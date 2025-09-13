"""
Doctor Availability and Time Slot Management Service
Handles 30-minute time slots and appointment scheduling logic
"""

from datetime import datetime, timedelta, time
from typing import List, Dict, Any, Optional, Tuple
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

logger = logging.getLogger(__name__)

class AvailabilityService:
    def __init__(self):
        self.slot_duration = 30  # 30 minutes per slot
    
    def generate_time_slots(
        self, 
        start_time: str = "09:00", 
        end_time: str = "17:00"
    ) -> List[str]:
        """Generate 30-minute time slots between start and end time"""
        slots = []
        
        # Parse start and end times
        start_hour, start_minute = map(int, start_time.split(':'))
        end_hour, end_minute = map(int, end_time.split(':'))
        
        current_time = time(start_hour, start_minute)
        end_time_obj = time(end_hour, end_minute)
        
        while current_time < end_time_obj:
            slots.append(current_time.strftime("%H:%M"))
            
            # Add 30 minutes
            current_datetime = datetime.combine(datetime.today(), current_time)
            current_datetime += timedelta(minutes=self.slot_duration)
            current_time = current_datetime.time()
        
        return slots
    
    def generate_multiple_time_blocks_slots(
        self, 
        time_blocks: List[Dict[str, str]]
    ) -> List[str]:
        """Generate 30-minute time slots for multiple time blocks with breaks
        
        Args:
            time_blocks: List of dictionaries with 'start_time' and 'end_time'
            Example: [
                {"start_time": "10:00", "end_time": "13:00"},
                {"start_time": "15:00", "end_time": "19:00"}
            ]
        """
        all_slots = []
        
        for block in time_blocks:
            block_slots = self.generate_time_slots(
                start_time=block["start_time"],
                end_time=block["end_time"]
            )
            all_slots.extend(block_slots)
        
        # Sort slots chronologically
        all_slots.sort()
        return all_slots
    
    def get_slot_duration_end(self, start_time: str) -> str:
        """Get the end time for a 30-minute slot"""
        try:
            start_hour, start_minute = map(int, start_time.split(':'))
            start_datetime = datetime.combine(datetime.today(), time(start_hour, start_minute))
            end_datetime = start_datetime + timedelta(minutes=self.slot_duration)
            return end_datetime.strftime("%H:%M")
        except:
            return start_time
    
    def format_time_slot(self, time_str: str) -> str:
        """Format time slot for display (e.g., '14:30' -> '2:30 PM')"""
        try:
            hour, minute = map(int, time_str.split(':'))
            time_obj = time(hour, minute)
            return time_obj.strftime("%I:%M %p").lstrip('0')
        except:
            return time_str
    
    async def get_doctor_available_slots(
        self,
        db: AsyncIOMotorDatabase,
        doctor_id: str,
        date: str
    ) -> List[str]:
        """Get available time slots for a doctor on a specific date"""
        try:
            # Get doctor's availability settings
            doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
            if not doctor:
                return []
            
            # Get doctor's working hours (default 9 AM to 5 PM)
            availability = doctor.get('availability', {})
            weekday = datetime.strptime(date, "%Y-%m-%d").strftime("%A").lower()
            
            day_availability = availability.get(weekday, {
                'is_available': True,
                'start_time': '09:00',
                'end_time': '17:00'
            })
            
            if not day_availability.get('is_available', True):
                return []
            
            # Check if doctor has multiple time blocks (new format) or single block (legacy format)
            if 'time_blocks' in day_availability:
                # New format: multiple time blocks with breaks
                time_blocks = day_availability['time_blocks']
                all_slots = self.generate_multiple_time_blocks_slots(time_blocks)
            else:
                # Legacy format: single continuous time block
                start_time = day_availability.get('start_time', '09:00')
                end_time = day_availability.get('end_time', '17:00')
                all_slots = self.generate_time_slots(start_time, end_time)
            
            # Get existing appointments for this doctor on this date
            # Convert string date to datetime range for proper database query
            date_obj = datetime.strptime(date, "%Y-%m-%d")
            next_day = date_obj + timedelta(days=1)
            
            existing_appointments = await db.appointments.find({
                "doctor_id": ObjectId(doctor_id),
                "appointment_date": {
                    "$gte": date_obj,
                    "$lt": next_day
                },
                "status": {"$in": ["pending", "confirmed"]}  # Don't count cancelled appointments
            }).to_list(None)
            
            # Remove booked slots
            booked_slots = [apt["appointment_time"] for apt in existing_appointments]
            available_slots = [slot for slot in all_slots if slot not in booked_slots]
            
            # Remove past slots for today
            if date == datetime.now().strftime("%Y-%m-%d"):
                current_time = datetime.now().strftime("%H:%M")
                available_slots = [slot for slot in available_slots if slot > current_time]
            
            return available_slots
            
        except Exception as e:
            logger.error(f"Error getting available slots for doctor {doctor_id}: {e}")
            return []
    
    async def check_slot_availability(
        self,
        db: AsyncIOMotorDatabase,
        doctor_id: str,
        date: str,
        time_slot: str
    ) -> bool:
        """Check if a specific time slot is available for booking"""
        try:
            # Check if appointment already exists
            # Convert string date to datetime range for proper database query
            date_obj = datetime.strptime(date, "%Y-%m-%d")
            next_day = date_obj + timedelta(days=1)
            
            existing = await db.appointments.find_one({
                "doctor_id": ObjectId(doctor_id),
                "appointment_date": {
                    "$gte": date_obj,
                    "$lt": next_day
                },
                "appointment_time": time_slot,
                "status": {"$in": ["pending", "confirmed"]}
            })
            
            if existing:
                return False
            
            # Check if slot is within doctor's availability
            available_slots = await self.get_doctor_available_slots(db, doctor_id, date)
            return time_slot in available_slots
            
        except Exception as e:
            logger.error(f"Error checking slot availability: {e}")
            return False
    
    async def get_doctor_availability_for_week(
        self,
        db: AsyncIOMotorDatabase,
        doctor_id: str,
        start_date: str
    ) -> Dict[str, List[str]]:
        """Get available slots for a doctor for the next 7 days"""
        try:
            availability = {}
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
            
            for i in range(7):
                current_date = start_date_obj + timedelta(days=i)
                date_str = current_date.strftime("%Y-%m-%d")
                
                slots = await self.get_doctor_available_slots(db, doctor_id, date_str)
                availability[date_str] = slots
            
            return availability
            
        except Exception as e:
            logger.error(f"Error getting weekly availability: {e}")
            return {}
    
    async def set_doctor_availability(
        self,
        db: AsyncIOMotorDatabase,
        doctor_id: str,
        availability_settings: Dict[str, Any]
    ) -> bool:
        """Set doctor's availability schedule"""
        try:
            # Validate availability settings
            valid_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            
            for day, settings in availability_settings.items():
                if day not in valid_days:
                    continue
                
                # Validate time format
                if settings.get('is_available', False):
                    start_time = settings.get('start_time', '09:00')
                    end_time = settings.get('end_time', '17:00')
                    
                    try:
                        datetime.strptime(start_time, "%H:%M")
                        datetime.strptime(end_time, "%H:%M")
                    except ValueError:
                        logger.error(f"Invalid time format for {day}: {start_time}, {end_time}")
                        return False
            
            # Update doctor's availability
            result = await db.doctors.update_one(
                {"_id": ObjectId(doctor_id)},
                {"$set": {
                    "availability": availability_settings,
                    "updated_at": datetime.utcnow()
                }}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error setting doctor availability: {e}")
            return False
    
    async def get_next_available_slot(
        self,
        db: AsyncIOMotorDatabase,
        doctor_id: str,
        preferred_date: Optional[str] = None
    ) -> Optional[Dict[str, str]]:
        """Get the next available slot for a doctor"""
        try:
            start_date = preferred_date or datetime.now().strftime("%Y-%m-%d")
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
            
            # Look for available slots in the next 30 days
            for i in range(30):
                current_date = start_date_obj + timedelta(days=i)
                date_str = current_date.strftime("%Y-%m-%d")
                
                available_slots = await self.get_doctor_available_slots(db, doctor_id, date_str)
                
                if available_slots:
                    return {
                        "date": date_str,
                        "time": available_slots[0],  # Return first available slot
                        "day_name": current_date.strftime("%A")
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting next available slot: {e}")
            return None
    
    async def block_time_slot(
        self,
        db: AsyncIOMotorDatabase,
        doctor_id: str,
        date: str,
        time_slot: str,
        reason: str = "Blocked by doctor"
    ) -> bool:
        """Block a specific time slot for a doctor"""
        try:
            # Create a blocked appointment entry
            # Convert string date to datetime object for consistent storage
            date_obj = datetime.strptime(date, "%Y-%m-%d")
            
            blocked_appointment = {
                "doctor_id": ObjectId(doctor_id),
                "patient_id": None,
                "appointment_date": date_obj,
                "appointment_time": time_slot,
                "status": "blocked",
                "symptoms": reason,
                "consultation_fee": 0.0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await db.appointments.insert_one(blocked_appointment)
            return result.inserted_id is not None
            
        except Exception as e:
            logger.error(f"Error blocking time slot: {e}")
            return False
    
    async def unblock_time_slot(
        self,
        db: AsyncIOMotorDatabase,
        doctor_id: str,
        date: str,
        time_slot: str
    ) -> bool:
        """Unblock a specific time slot for a doctor"""
        try:
            # Convert string date to datetime range for proper database query
            date_obj = datetime.strptime(date, "%Y-%m-%d")
            next_day = date_obj + timedelta(days=1)
            
            result = await db.appointments.delete_one({
                "doctor_id": ObjectId(doctor_id),
                "appointment_date": {
                    "$gte": date_obj,
                    "$lt": next_day
                },
                "appointment_time": time_slot,
                "status": "blocked"
            })
            
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"Error unblocking time slot: {e}")
            return False
    
    def format_time_slot(self, time_slot: str) -> str:
        """Format time slot for display (e.g., "09:00" -> "9:00 AM")"""
        try:
            time_obj = datetime.strptime(time_slot, "%H:%M")
            return time_obj.strftime("%I:%M %p").lstrip('0')
        except ValueError:
            return time_slot
    
    def get_slot_duration_end(self, start_time: str) -> str:
        """Get the end time for a slot given the start time"""
        try:
            start_obj = datetime.strptime(start_time, "%H:%M")
            end_obj = start_obj + timedelta(minutes=self.slot_duration)
            return end_obj.strftime("%H:%M")
        except ValueError:
            return start_time

# Global availability service instance
availability_service = AvailabilityService()