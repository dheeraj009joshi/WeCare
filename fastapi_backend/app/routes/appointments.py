from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timedelta
import uuid
from ..core.database import get_database
from ..models.appointment import (
    Appointment, AppointmentCreate, AppointmentCreateRequest, AppointmentUpdate, AppointmentStatus,
    DoctorAvailability, DoctorAvailabilityCreate
)
from ..models.user import UserInDB
from ..models.doctor import DoctorInDB
from ..utils.auth import get_current_active_user, get_current_active_doctor, get_current_admin_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[Appointment])
async def get_user_appointments(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = None
):
    """Get user's appointments"""
    query = {"patient_id": current_user.id}
    
    if status:
        query["status"] = status
    
    cursor = db.appointments.find(query).sort("appointment_date", -1).skip(skip).limit(limit)
    appointments = []
    async for appointment in cursor:
        appointments.append(Appointment(**appointment))
    
    return appointments

@router.get("/doctor", response_model=List[Appointment])
async def get_doctor_appointments(
    current_doctor: DoctorInDB = Depends(get_current_active_doctor),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    date: Optional[str] = None,
    status: Optional[str] = None
):
    """Get doctor's appointments"""
    query = {"doctor_id": current_doctor.id}
    
    if status:
        query["status"] = status
    
    if date:
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d")
            next_day = date_obj + timedelta(days=1)
            query["appointment_date"] = {
                "$gte": date_obj,
                "$lt": next_day
            }
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    cursor = db.appointments.find(query).sort("appointment_date", 1).skip(skip).limit(limit)
    appointments = []
    async for appointment in cursor:
        appointments.append(Appointment(**appointment))
    
    return appointments

@router.get("/{appointment_id}", response_model=Appointment)
async def get_appointment(
    appointment_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific appointment"""
    if not ObjectId.is_valid(appointment_id):
        raise HTTPException(status_code=400, detail="Invalid appointment ID")
    
    appointment = await db.appointments.find_one({
        "_id": ObjectId(appointment_id),
        "$or": [
            {"patient_id": current_user.id},
            {"doctor_id": current_user.id}  # If user is also a doctor
        ]
    })
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return Appointment(**appointment)

@router.post("/", response_model=Appointment)
async def book_appointment(
    appointment_data: AppointmentCreateRequest,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Book a new appointment with Google Calendar integration and email notifications"""
    from ..services.availability_service import availability_service
    from ..services.calendar_service import calendar_service
    from ..services.email_service import email_service
    
    # Verify doctor exists and is active
    doctor = await db.doctors.find_one({
        "_id": appointment_data.doctor_id,
        "is_active": True,
        "is_verified": True
    })
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found or not available")
    
    # Convert date to string for availability check
    appointment_date_str = appointment_data.appointment_date.strftime("%Y-%m-%d")
    
    # COMPREHENSIVE CONFLICT DETECTION
    
    # 1. Check for existing appointment with same doctor/patient/time
    existing_appointment = await db.appointments.find_one({
        "doctor_id": appointment_data.doctor_id,
        "patient_id": current_user.id,
        "appointment_date": {
            "$gte": appointment_data.appointment_date,
            "$lt": appointment_data.appointment_date + timedelta(days=1)
        },
        "appointment_time": appointment_data.appointment_time,
        "status": {"$nin": [AppointmentStatus.CANCELLED]}
    })
    
    if existing_appointment:
        raise HTTPException(
            status_code=400,
            detail="You already have an appointment with this doctor at this time. Please choose a different slot."
        )
    
    # 2. Check for any appointment at this exact time slot with doctor (different patients)
    doctor_slot_conflict = await db.appointments.find_one({
        "doctor_id": appointment_data.doctor_id,
        "appointment_date": {
            "$gte": appointment_data.appointment_date,
            "$lt": appointment_data.appointment_date + timedelta(days=1)
        },
        "appointment_time": appointment_data.appointment_time,
        "status": {"$nin": [AppointmentStatus.CANCELLED]}
    })
    
    if doctor_slot_conflict:
        # Get REAL-TIME available alternative slots using the fixed availability service
        available_slots = await availability_service.get_doctor_available_slots(
            db,
            str(appointment_data.doctor_id),
            appointment_date_str
        )
        
        if available_slots:
            suggestion_text = f"Available alternatives: {', '.join(available_slots[:3])}"
        else:
            suggestion_text = "No slots available today. Please try another date."
        
        raise HTTPException(
            status_code=409,
            detail=f"This time slot is already booked with another patient. {suggestion_text}"
        )
    
    # 3. Check for patient's overlapping appointments with any doctor on same day
    patient_day_appointments = await db.appointments.find({
        "patient_id": current_user.id,
        "appointment_date": {
            "$gte": appointment_data.appointment_date,
            "$lt": appointment_data.appointment_date + timedelta(days=1)
        },
        "status": {"$nin": [AppointmentStatus.CANCELLED]}
    }).to_list(None)
    
    # Check for time conflicts (within 30 minutes)
    for existing in patient_day_appointments:
        existing_time = datetime.strptime(existing["appointment_time"], "%H:%M").time()
        new_time = datetime.strptime(appointment_data.appointment_time, "%H:%M").time()
        
        existing_datetime = datetime.combine(appointment_data.appointment_date.date(), existing_time)
        new_datetime = datetime.combine(appointment_data.appointment_date.date(), new_time)
        
        time_diff = abs((new_datetime - existing_datetime).total_seconds() / 60)
        
        if time_diff < 30:  # Within 30 minutes
            existing_doctor = await db.doctors.find_one({"_id": existing["doctor_id"]})
            existing_doctor_name = existing_doctor.get("name", "Another doctor") if existing_doctor else "Another doctor"
            
            raise HTTPException(
                status_code=409,
                detail=f"You have an overlapping appointment with {existing_doctor_name} at {existing['appointment_time']}. Please allow at least 30 minutes between appointments."
            )
    
    # 4. Final availability check using enhanced service
    is_available = await availability_service.check_slot_availability(
        db,
        str(appointment_data.doctor_id),
        appointment_date_str,
        appointment_data.appointment_time
    )
    
    if not is_available:
        # Get REAL-TIME available slots for suggestions using the fixed availability service
        available_slots = await availability_service.get_doctor_available_slots(
            db,
            str(appointment_data.doctor_id),
            appointment_date_str
        )
        
        if available_slots:
            suggestion_text = f"Available slots: {', '.join(available_slots[:5])}"
        else:
            suggestion_text = "No slots available today"
        
        raise HTTPException(
            status_code=400,
            detail=f"Time slot not available. {suggestion_text}"
        )
    
    # 5. Business rules validation
    appointment_datetime = datetime.combine(
        appointment_data.appointment_date.date(),
        datetime.strptime(appointment_data.appointment_time, "%H:%M").time()
    )
    
    # Must be at least 30 minutes in the future
    if appointment_datetime < datetime.now() + timedelta(minutes=30):
        raise HTTPException(
            status_code=400,
            detail="Appointments must be scheduled at least 30 minutes in advance."
        )
    
    # Cannot be more than 90 days in advance
    if appointment_datetime > datetime.now() + timedelta(days=90):
        raise HTTPException(
            status_code=400,
            detail="Appointments cannot be scheduled more than 90 days in advance."
        )
    
    # CREATE APPOINTMENT WITH FINAL CONFLICT CHECK
    # Final atomic check right before insertion
    final_conflict_check = await db.appointments.find_one({
        "doctor_id": appointment_data.doctor_id,
        "appointment_date": {
            "$gte": appointment_data.appointment_date,
            "$lt": appointment_data.appointment_date + timedelta(days=1)
        },
        "appointment_time": appointment_data.appointment_time,
        "status": {"$nin": [AppointmentStatus.CANCELLED]}
    })
    
    if final_conflict_check:
        raise HTTPException(
            status_code=409,
            detail="This time slot was just booked by another patient. Please select a different time."
        )
    
    # Create appointment
    appointment_dict = appointment_data.dict()
    appointment_dict["patient_id"] = current_user.id
    appointment_dict["status"] = AppointmentStatus.PENDING
    appointment_dict["created_at"] = datetime.utcnow()
    appointment_dict["updated_at"] = datetime.utcnow()
    
    # Insert appointment into database
    result = await db.appointments.insert_one(appointment_dict)
    created_appointment = await db.appointments.find_one({"_id": result.inserted_id})
    
    # Add timestamps for Pydantic model compatibility
    created_appointment["created_at"] = appointment_dict["created_at"]
    created_appointment["updated_at"] = appointment_dict["updated_at"]
    
    appointment_obj = Appointment(**created_appointment)
    
    # Prepare data for calendar and email
    calendar_data = {
        'appointment_id': str(result.inserted_id),
        'appointment_date': appointment_data.appointment_date,
        'appointment_time': appointment_data.appointment_time,
        'symptoms': appointment_data.symptoms,
        'consultation_fee': appointment_data.consultation_fee,
        'patient_name': current_user.name,
        'doctor_name': doctor.get('name', 'Doctor')
    }
    
    # Create Google Calendar event (async, don't wait for it)
    calendar_event = None
    try:
        calendar_event = await calendar_service.create_appointment_event(
            calendar_data,
            doctor.get('email', ''),
            current_user.email
        )
        
        # Update appointment with calendar event ID
        if calendar_event:
            await db.appointments.update_one(
                {"_id": result.inserted_id},
                {"$set": {
                    "calendar_event_id": calendar_event.get('event_id'),
                    "meet_link": calendar_event.get('meet_link')
                }}
            )
            
    except Exception as e:
        logger.warning(f"Failed to create calendar event: {e}")
    
    # Send email notifications (async, don't wait for it)
    try:
        email_results = await email_service.send_appointment_emails(
            patient_email=current_user.email,
            patient_name=current_user.name,
            doctor_email=doctor.get('email', ''),
            doctor_name=doctor.get('name', 'Doctor'),
            appointment_date=appointment_data.appointment_date.strftime("%B %d, %Y"),
            appointment_time=appointment_data.appointment_time,
            symptoms=appointment_data.symptoms,
            calendar_link=calendar_event.get('event_link') if calendar_event else None,
            meet_link=calendar_event.get('meet_link') if calendar_event else None
        )
        
        logger.info(f"Email notifications sent: {email_results}")
        
    except Exception as e:
        logger.warning(f"Failed to send email notifications: {e}")
    
    return appointment_obj

@router.put("/{appointment_id}", response_model=Appointment)
async def update_appointment(
    appointment_id: str,
    appointment_data: AppointmentUpdate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update an appointment"""
    if not ObjectId.is_valid(appointment_id):
        raise HTTPException(status_code=400, detail="Invalid appointment ID")
    
    # Check if appointment exists and user has permission
    appointment = await db.appointments.find_one({
        "_id": ObjectId(appointment_id),
        "$or": [
            {"patient_id": current_user.id},
            {"doctor_id": current_user.id}
        ]
    })
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    update_data = {k: v for k, v in appointment_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    await db.appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": update_data}
    )
    
    updated_appointment = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
    return Appointment(**updated_appointment)

@router.delete("/{appointment_id}")
async def cancel_appointment(
    appointment_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Cancel an appointment"""
    if not ObjectId.is_valid(appointment_id):
        raise HTTPException(status_code=400, detail="Invalid appointment ID")
    
    appointment = await db.appointments.find_one({
        "_id": ObjectId(appointment_id),
        "$or": [
            {"patient_id": current_user.id},
            {"doctor_id": current_user.id}
        ]
    })
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment["status"] in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel completed or already cancelled appointment"
        )
    
    await db.appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {
            "status": AppointmentStatus.CANCELLED,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Appointment cancelled successfully"}

# Doctor Availability endpoints
@router.get("/doctor/{doctor_id}/availability", response_model=List[DoctorAvailability])
async def get_doctor_availability(
    doctor_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get doctor's availability schedule"""
    if not ObjectId.is_valid(doctor_id):
        raise HTTPException(status_code=400, detail="Invalid doctor ID")
    
    cursor = db.doctor_availability.find({
        "doctor_id": ObjectId(doctor_id),
        "is_available": True
    }).sort("day_of_week", 1)
    
    availability = []
    async for slot in cursor:
        availability.append(DoctorAvailability(**slot))
    
    return availability

@router.get("/doctor/{doctor_id}/available-slots")
async def get_doctor_available_slots(
    doctor_id: str,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get available time slots for a doctor on a specific date"""
    from ..services.availability_service import availability_service
    
    try:
        # Validate date format
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Verify doctor exists
    doctor = await db.doctors.find_one({
        "_id": ObjectId(doctor_id),
        "is_active": True,
        "is_verified": True
    })
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Get doctor's availability settings
    availability = doctor.get('availability', {})
    weekday = datetime.strptime(date, "%Y-%m-%d").strftime("%A").lower()
    
    day_availability = availability.get(weekday, {
        'is_available': True,
        'start_time': '09:00',
        'end_time': '17:00'
    })
    
    # If doctor is not available on this day, return empty slots
    if not day_availability.get('is_available', True):
        return {
            "doctor_id": doctor_id,
            "doctor_name": doctor.get('name', 'Doctor'),
            "date": date,
            "day_name": datetime.strptime(date, "%Y-%m-%d").strftime("%A"),
            "is_available": False,
            "available_slots": [],
            "total_slots": 0,
            "available_count": 0
        }
    
    # Generate ALL possible slots for the day
    if 'time_blocks' in day_availability:
        # Multiple time blocks with breaks
        time_blocks = day_availability['time_blocks']
        all_possible_slots = availability_service.generate_multiple_time_blocks_slots(time_blocks)
    else:
        # Single continuous time block
        start_time = day_availability.get('start_time', '09:00')
        end_time = day_availability.get('end_time', '17:00')
        all_possible_slots = availability_service.generate_time_slots(start_time, end_time)
    
    # Get existing appointments for this doctor on this date
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    next_day = date_obj + timedelta(days=1)
    
    existing_appointments = await db.appointments.find({
        "doctor_id": ObjectId(doctor_id),
        "appointment_date": {
            "$gte": date_obj,
            "$lt": next_day
        },
        "status": {"$in": ["pending", "confirmed"]}
    }).to_list(None)
    
    # Get booked time slots
    booked_slots = set(apt["appointment_time"] for apt in existing_appointments)
    
    # Format ALL slots with availability status
    formatted_slots = []
    available_count = 0
    current_time = datetime.now().strftime("%H:%M")
    is_today = date == datetime.now().strftime("%Y-%m-%d")
    
    for slot in all_possible_slots:
        end_time = availability_service.get_slot_duration_end(slot)
        
        # Check if slot is available
        is_booked = slot in booked_slots
        is_past = is_today and slot <= current_time
        is_available = not is_booked and not is_past
        
        if is_available:
            available_count += 1
            
        formatted_slots.append({
            "time": slot,
            "end_time": end_time,
            "display_time": f"{availability_service.format_time_slot(slot)} - {availability_service.format_time_slot(end_time)}",
            "display_range": f"{availability_service.format_time_slot(slot)} - {availability_service.format_time_slot(end_time)}",
            "is_available": is_available,
            "is_booked": is_booked,
            "is_past": is_past
        })
    
    return {
        "doctor_id": doctor_id,
        "doctor_name": doctor.get('name', 'Doctor'),
        "date": date,
        "day_name": datetime.strptime(date, "%Y-%m-%d").strftime("%A"),
        "is_available": True,
        "available_slots": formatted_slots,
        "total_slots": len(formatted_slots),
        "available_count": available_count
    }

@router.get("/doctor/{doctor_id}/availability-week")
async def get_doctor_weekly_availability(
    doctor_id: str,
    start_date: str = Query(None, description="Start date in YYYY-MM-DD format. Defaults to today"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get available time slots for a doctor for the next 7 days"""
    from ..services.availability_service import availability_service
    
    # Use today as default start date
    if not start_date:
        start_date = datetime.now().strftime("%Y-%m-%d")
    
    try:
        datetime.strptime(start_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Verify doctor exists
    doctor = await db.doctors.find_one({
        "_id": ObjectId(doctor_id),
        "is_active": True,
        "is_verified": True
    })
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Get detailed weekly availability with same structure as daily endpoint
    formatted_availability = {}
    start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
    
    for i in range(7):
        current_date_obj = start_date_obj + timedelta(days=i)
        date_str = current_date_obj.strftime("%Y-%m-%d")
        
        # Get doctor's availability settings for this day
        availability = doctor.get('availability', {})
        weekday = current_date_obj.strftime("%A").lower()
        
        day_availability = availability.get(weekday, {
            'is_available': True,
            'start_time': '09:00',
            'end_time': '17:00'
        })
        
        # If doctor is not available on this day, return empty slots
        if not day_availability.get('is_available', True):
            formatted_availability[date_str] = {
                "date": date_str,
                "day_name": current_date_obj.strftime("%A"),
                "formatted_date": current_date_obj.strftime("%B %d, %Y"),
                "is_available": False,
                "available_slots": [],
                "total_slots": 0,
                "available_count": 0
            }
            continue
        
        # Generate ALL possible slots for the day
        if 'time_blocks' in day_availability:
            # Multiple time blocks with breaks
            time_blocks = day_availability['time_blocks']
            all_possible_slots = availability_service.generate_multiple_time_blocks_slots(time_blocks)
        else:
            # Single continuous time block
            start_time = day_availability.get('start_time', '09:00')
            end_time = day_availability.get('end_time', '17:00')
            all_possible_slots = availability_service.generate_time_slots(start_time, end_time)
        
        # Get existing appointments for this doctor on this date
        next_day = current_date_obj + timedelta(days=1)
        
        existing_appointments = await db.appointments.find({
            "doctor_id": ObjectId(doctor_id),
            "appointment_date": {
                "$gte": current_date_obj,
                "$lt": next_day
            },
            "status": {"$in": ["pending", "confirmed"]}
        }).to_list(None)
        
        # Get booked time slots
        booked_slots = set(apt["appointment_time"] for apt in existing_appointments)
        
        # Format ALL slots with availability status
        formatted_slots = []
        available_count = 0
        current_time = datetime.now().strftime("%H:%M")
        is_today = date_str == datetime.now().strftime("%Y-%m-%d")
        
        for slot in all_possible_slots:
            end_time = availability_service.get_slot_duration_end(slot)
            
            # Check if slot is available
            is_booked = slot in booked_slots
            is_past = is_today and slot <= current_time
            is_available = not is_booked and not is_past
            
            if is_available:
                available_count += 1
                
            formatted_slots.append({
                "time": slot,
                "end_time": end_time,
                "display_time": f"{availability_service.format_time_slot(slot)} - {availability_service.format_time_slot(end_time)}",
                "display_range": f"{availability_service.format_time_slot(slot)} - {availability_service.format_time_slot(end_time)}",
                "is_available": is_available,
                "is_booked": is_booked,
                "is_past": is_past
            })
        
        formatted_availability[date_str] = {
            "date": date_str,
            "day_name": current_date_obj.strftime("%A"),
            "formatted_date": current_date_obj.strftime("%B %d, %Y"),
            "is_available": True,
            "available_slots": formatted_slots,
            "total_slots": len(formatted_slots),
            "available_count": available_count
        }
    
    return {
        "doctor_id": doctor_id,
        "doctor_name": doctor.get('name', 'Doctor'),
        "start_date": start_date,
        "weekly_availability": formatted_availability
    }

@router.post("/doctor/availability", response_model=DoctorAvailability)
async def create_doctor_availability(
    availability_data: DoctorAvailabilityCreate,
    current_doctor: DoctorInDB = Depends(get_current_active_doctor),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create doctor availability slot"""
    availability_dict = availability_data.dict()
    availability_dict["doctor_id"] = current_doctor.id
    
    # Check if availability already exists for this day
    existing = await db.doctor_availability.find_one({
        "doctor_id": current_doctor.id,
        "day_of_week": availability_data.day_of_week
    })
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Availability already exists for this day"
        )
    
    result = await db.doctor_availability.insert_one(availability_dict)
    created_availability = await db.doctor_availability.find_one({"_id": result.inserted_id})
    
    return DoctorAvailability(**created_availability)

@router.get("/available-slots/{doctor_id}")
async def get_available_slots(
    doctor_id: str,
    date: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get detailed time slot availability for a specific date with booking status"""
    if not ObjectId.is_valid(doctor_id):
        raise HTTPException(status_code=400, detail="Invalid doctor ID")
    
    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Verify doctor exists
    doctor = await db.doctors.find_one({
        "_id": ObjectId(doctor_id),
        "is_active": True,
        "is_verified": True
    })
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Get doctor's availability for this day
    weekday_name = date_obj.strftime("%A").lower()
    doctor_availability = doctor.get('availability', {})
    day_availability = doctor_availability.get(weekday_name, {})
    
    if not day_availability.get('is_available', False):
        return {
            "doctor_id": doctor_id,
            "doctor_name": doctor.get('name', 'Doctor'),
            "date": date,
            "is_available_day": False,
            "available_slots": [],
            "all_slots": [],
            "total_slots": 0,
            "available_count": 0
        }
    
    # Generate all possible slots using the enhanced availability service
    from ..services.availability_service import availability_service
    
    if 'time_blocks' in day_availability:
        # Multiple time blocks with breaks
        time_blocks = day_availability['time_blocks']
        all_slots = availability_service.generate_multiple_time_blocks_slots(time_blocks)
    else:
        # Legacy single block format
        start_time = day_availability.get('start_time', '09:00')
        end_time = day_availability.get('end_time', '17:00')
        all_slots = availability_service.generate_time_slots(start_time, end_time)
    
    # Get existing appointments for this date
    existing_appointments = []
    cursor = db.appointments.find({
        "doctor_id": ObjectId(doctor_id),
        "appointment_date": {
            "$gte": date_obj,
            "$lt": date_obj + timedelta(days=1)
        },
        "status": {"$nin": [AppointmentStatus.CANCELLED]}
    })
    
    booked_slots = {}
    async for appointment in cursor:
        time_slot = appointment["appointment_time"]
        booked_slots[time_slot] = {
            "patient_name": "Booked",  # Don't expose patient details
            "status": appointment.get("status", "pending"),
            "appointment_id": str(appointment["_id"])
        }
    
    # Build detailed slot information
    detailed_slots = []
    available_slots = []
    current_datetime = datetime.now()
    
    for slot in all_slots:
        slot_datetime = datetime.combine(date_obj.date(), datetime.strptime(slot, "%H:%M").time())
        
        is_past = slot_datetime < current_datetime if date == current_datetime.strftime("%Y-%m-%d") else False
        is_booked = slot in booked_slots
        is_available = not is_past and not is_booked
        
        slot_info = {
            "time": slot,
            "end_time": availability_service.get_slot_duration_end(slot),
            "display_time": availability_service.format_time_slot(slot),
            "display_range": f"{availability_service.format_time_slot(slot)} - {availability_service.format_time_slot(availability_service.get_slot_duration_end(slot))}",
            "available": is_available,
            "is_past": is_past,
            "is_booked": is_booked
        }
        
        if is_booked:
            slot_info["booking_info"] = booked_slots[slot]
        
        if is_available:
            available_slots.append(slot_info)
        
        detailed_slots.append(slot_info)
    
    return {
        "doctor_id": doctor_id,
        "doctor_name": doctor.get('name', 'Doctor'),
        "date": date,
        "day_name": date_obj.strftime("%A"),
        "formatted_date": date_obj.strftime("%B %d, %Y"),
        "is_available_day": True,
        "available_slots": available_slots,
        "all_slots": detailed_slots,
        "total_slots": len(detailed_slots),
        "available_count": len(available_slots),
        "booked_count": len([s for s in detailed_slots if s["is_booked"]]),
        "past_count": len([s for s in detailed_slots if s["is_past"]])
    }

# ===== DOCTOR AVAILABILITY MANAGEMENT ENDPOINTS =====

@router.get("/doctor/my-availability")
async def get_my_availability(
    current_doctor: DoctorInDB = Depends(get_current_active_doctor),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get current doctor's availability settings"""
    doctor = await db.doctors.find_one({"_id": current_doctor.id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    availability = doctor.get('availability', {})
    
    # Return formatted availability with defaults
    default_availability = {
        'monday': {'is_available': True, 'start_time': '09:00', 'end_time': '17:00'},
        'tuesday': {'is_available': True, 'start_time': '09:00', 'end_time': '17:00'},
        'wednesday': {'is_available': True, 'start_time': '09:00', 'end_time': '17:00'},
        'thursday': {'is_available': True, 'start_time': '09:00', 'end_time': '17:00'},
        'friday': {'is_available': True, 'start_time': '09:00', 'end_time': '17:00'},
        'saturday': {'is_available': False, 'start_time': '09:00', 'end_time': '17:00'},
        'sunday': {'is_available': False, 'start_time': '09:00', 'end_time': '17:00'}
    }
    
    # Merge with existing availability
    for day, settings in default_availability.items():
        if day in availability:
            settings.update(availability[day])
    
    return {
        "doctor_id": str(current_doctor.id),
        "doctor_name": doctor.get('name', 'Doctor'),
        "availability": default_availability
    }

@router.put("/doctor/my-availability")
async def update_my_availability(
    availability_update: dict,
    current_doctor: DoctorInDB = Depends(get_current_active_doctor),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update current doctor's availability settings"""
    from ..services.availability_service import availability_service
    
    # Validate the availability data
    valid_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    for day, settings in availability_update.items():
        if day not in valid_days:
            raise HTTPException(status_code=400, detail=f"Invalid day: {day}")
        
        if 'is_available' in settings and settings['is_available']:
            start_time = settings.get('start_time', '09:00')
            end_time = settings.get('end_time', '17:00')
            
            try:
                datetime.strptime(start_time, "%H:%M")
                datetime.strptime(end_time, "%H:%M")
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid time format for {day}")
            
            if start_time >= end_time:
                raise HTTPException(status_code=400, detail=f"Start time must be before end time for {day}")
    
    # Update doctor's availability
    result = await db.doctors.update_one(
        {"_id": current_doctor.id},
        {"$set": {
            "availability": availability_update,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update availability")
    
    return {
        "message": "Availability updated successfully",
        "doctor_id": str(current_doctor.id),
        "availability": availability_update
    }

@router.post("/doctor/availability/bulk-update")
async def bulk_update_availability(
    availability_settings: dict,
    current_doctor: DoctorInDB = Depends(get_current_active_doctor),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Bulk update doctor's weekly availability (for easier frontend integration)"""
    
    # Expected format:
    # {
    #   "monday": {"is_available": true, "start_time": "09:00", "end_time": "17:00"},
    #   "tuesday": {"is_available": true, "start_time": "09:00", "end_time": "17:00"},
    #   ...
    # }
    
    valid_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    updated_availability = {}
    
    for day in valid_days:
        if day in availability_settings:
            settings = availability_settings[day]
            
            # Validate settings
            if not isinstance(settings, dict):
                raise HTTPException(status_code=400, detail=f"Invalid settings format for {day}")
            
            is_available = settings.get('is_available', False)
            start_time = settings.get('start_time', '09:00')
            end_time = settings.get('end_time', '17:00')
            
            if is_available:
                try:
                    datetime.strptime(start_time, "%H:%M")
                    datetime.strptime(end_time, "%H:%M")
                except ValueError:
                    raise HTTPException(status_code=400, detail=f"Invalid time format for {day}")
                
                if start_time >= end_time:
                    raise HTTPException(status_code=400, detail=f"Start time must be before end time for {day}")
            
            day_availability = {
                "is_available": is_available,
                "start_time": start_time,
                "end_time": end_time
            }
            
            # Check if multiple time blocks are provided
            if 'time_blocks' in settings:
                time_blocks = settings['time_blocks']
                if not isinstance(time_blocks, list):
                    raise HTTPException(status_code=400, detail=f"time_blocks must be a list for {day}")
                
                if len(time_blocks) == 0:
                    raise HTTPException(status_code=400, detail=f"time_blocks cannot be empty for {day}")
                
                # Validate each time block
                for block in time_blocks:
                    if not isinstance(block, dict) or 'start_time' not in block or 'end_time' not in block:
                        raise HTTPException(status_code=400, detail=f"Invalid time block format for {day}")
                    
                    try:
                        datetime.strptime(block['start_time'], "%H:%M")
                        datetime.strptime(block['end_time'], "%H:%M")
                    except ValueError:
                        raise HTTPException(status_code=400, detail=f"Invalid time format in time blocks for {day}")
                    
                    if block['start_time'] >= block['end_time']:
                        raise HTTPException(status_code=400, detail=f"Start time must be before end time in time blocks for {day}")
                
                # Auto-calculate overall start_time and end_time from time_blocks
                all_start_times = [block['start_time'] for block in time_blocks]
                all_end_times = [block['end_time'] for block in time_blocks]
                
                day_availability['start_time'] = min(all_start_times)
                day_availability['end_time'] = max(all_end_times)
                day_availability['time_blocks'] = time_blocks
            
            updated_availability[day] = day_availability
        else:
            # Set default for missing days
            updated_availability[day] = {
                "is_available": False,
                "start_time": "09:00",
                "end_time": "17:00"
            }
    
    # Update in database
    result = await db.doctors.update_one(
        {"_id": current_doctor.id},
        {"$set": {
            "availability": updated_availability,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update availability")
    
    return {
        "message": "Weekly availability updated successfully",
        "doctor_id": str(current_doctor.id),
        "availability": updated_availability
    }

@router.get("/doctor/my-appointments-overview")
async def get_my_appointments_overview(
    current_doctor: DoctorInDB = Depends(get_current_active_doctor),
    db: AsyncIOMotorDatabase = Depends(get_database),
    days: int = Query(7, description="Number of days to look ahead")
):
    """Get doctor's appointment overview for the next N days"""
    
    start_date = datetime.now().date()
    appointments_overview = {}
    
    for i in range(days):
        current_date = start_date + timedelta(days=i)
        date_str = current_date.strftime("%Y-%m-%d")
        
        # Get appointments for this date
        next_day = current_date + timedelta(days=1)
        appointments_cursor = db.appointments.find({
            "doctor_id": str(current_doctor.id),
            "appointment_date": date_str,
            "status": {"$in": ["pending", "confirmed"]}
        })
        
        appointments = await appointments_cursor.to_list(None)
        
        # Get available slots
        from ..services.availability_service import availability_service
        available_slots = await availability_service.get_doctor_available_slots(
            db, str(current_doctor.id), date_str
        )
        
        appointments_overview[date_str] = {
            "date": date_str,
            "day_name": current_date.strftime("%A"),
            "formatted_date": current_date.strftime("%B %d, %Y"),
            "total_appointments": len(appointments),
            "available_slots": len(available_slots),
            "appointments": [
                {
                    "id": str(apt["_id"]),
                    "time": apt["appointment_time"],
                    "patient_name": apt.get("patient_name", "Patient"),
                    "symptoms": apt.get("symptoms", ""),
                    "status": apt.get("status", "pending")
                }
                for apt in appointments
            ]
        }
    
    return {
        "doctor_id": str(current_doctor.id),
        "overview_period": f"Next {days} days",
        "appointments_overview": appointments_overview
    }