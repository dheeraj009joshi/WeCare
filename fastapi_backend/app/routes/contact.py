from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from ..core.database import get_database
from ..models.general import Contact, ContactCreate, ContactUpdate, Newsletter, NewsletterCreate
from ..models.user import UserInDB
from ..utils.auth import get_current_admin_user
from ..services.email_service import email_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=Contact)
async def create_contact(
    contact_data: ContactCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new contact request"""
    contact_dict = contact_data.dict()
    
    result = await db.contacts.insert_one(contact_dict)
    created_contact = await db.contacts.find_one({"_id": result.inserted_id})
    
    # Send confirmation email to user
    try:
        await email_service.send_email(
            contact_data.email,
            "Contact Request Received - WeCure",
            f"""
            <h2>Thank you for contacting WeCure!</h2>
            <p>Dear {contact_data.name},</p>
            <p>We have received your message and will get back to you within 24 hours.</p>
            <p><strong>Your message:</strong></p>
            <p>"{contact_data.message}"</p>
            <p>Best regards,<br>WeCure Support Team</p>
            """,
            is_html=True
        )
        
        # Send notification to admin
        await email_service.send_email(
            "admin@wecure.com",  # Replace with actual admin email
            f"New Contact Request - {contact_data.subject}",
            f"""
            <h2>New Contact Request</h2>
            <p><strong>From:</strong> {contact_data.name} ({contact_data.email})</p>
            <p><strong>Phone:</strong> {contact_data.phone or 'Not provided'}</p>
            <p><strong>Subject:</strong> {contact_data.subject}</p>
            <p><strong>Department:</strong> {contact_data.department}</p>
            <p><strong>Message:</strong></p>
            <p>{contact_data.message}</p>
            <p><strong>Priority:</strong> {contact_data.priority}</p>
            <p><a href="http://localhost:4000/api/admin/contacts">View in Admin Panel</a></p>
            """,
            is_html=True
        )
    except Exception as e:
        logger.error(f"Failed to send contact confirmation emails: {e}")
    
    return Contact(**created_contact)

@router.get("/", response_model=List[Contact])
async def get_contacts(
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    department: Optional[str] = None
):
    """Get all contact requests (Admin only)"""
    query = {}
    
    if status:
        query["status"] = status
    
    if department:
        query["department"] = department
    
    cursor = db.contacts.find(query).skip(skip).limit(limit).sort("created_at", -1)
    contacts = []
    async for contact in cursor:
        contacts.append(Contact(**contact))
    
    return contacts

@router.get("/{contact_id}", response_model=Contact)
async def get_contact(
    contact_id: str,
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific contact request (Admin only)"""
    if not ObjectId.is_valid(contact_id):
        raise HTTPException(status_code=400, detail="Invalid contact ID")
    
    contact = await db.contacts.find_one({"_id": ObjectId(contact_id)})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return Contact(**contact)

@router.put("/{contact_id}", response_model=Contact)
async def update_contact(
    contact_id: str,
    contact_data: ContactUpdate,
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update contact request status (Admin only)"""
    if not ObjectId.is_valid(contact_id):
        raise HTTPException(status_code=400, detail="Invalid contact ID")
    
    update_data = {k: v for k, v in contact_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    if contact_data.status == "resolved":
        update_data["resolved_at"] = datetime.utcnow()
    
    result = await db.contacts.update_one(
        {"_id": ObjectId(contact_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    updated_contact = await db.contacts.find_one({"_id": ObjectId(contact_id)})
    return Contact(**updated_contact)

@router.post("/{contact_id}/reply")
async def reply_to_contact(
    contact_id: str,
    reply_message: str,
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Reply to a contact request (Admin only)"""
    if not ObjectId.is_valid(contact_id):
        raise HTTPException(status_code=400, detail="Invalid contact ID")
    
    contact = await db.contacts.find_one({"_id": ObjectId(contact_id)})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Send reply email
    try:
        await email_service.send_email(
            contact["email"],
            f"Re: {contact['subject']} - WeCure Support",
            f"""
            <h2>Response from WeCure Support</h2>
            <p>Dear {contact['name']},</p>
            <p>{reply_message}</p>
            <hr>
            <p><strong>Your original message:</strong></p>
            <p>"{contact['message']}"</p>
            <p>Best regards,<br>WeCure Support Team</p>
            """,
            is_html=True
        )
        
        # Update contact status
        await db.contacts.update_one(
            {"_id": ObjectId(contact_id)},
            {"$set": {
                "status": "resolved",
                "resolved_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }}
        )
        
        return {"message": "Reply sent successfully"}
        
    except Exception as e:
        logger.error(f"Failed to send reply email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send reply")

# Newsletter endpoints
@router.post("/newsletter/subscribe", response_model=Newsletter)
async def subscribe_newsletter(
    newsletter_data: NewsletterCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Subscribe to newsletter"""
    # Check if email already subscribed
    existing = await db.newsletters.find_one({"email": newsletter_data.email})
    
    if existing:
        if existing.get("is_subscribed", False):
            raise HTTPException(
                status_code=400, 
                detail="Email already subscribed to newsletter"
            )
        else:
            # Reactivate subscription
            await db.newsletters.update_one(
                {"email": newsletter_data.email},
                {"$set": {
                    "is_subscribed": True,
                    "preferences": newsletter_data.preferences,
                    "updated_at": datetime.utcnow()
                }}
            )
            updated_newsletter = await db.newsletters.find_one({"email": newsletter_data.email})
            return Newsletter(**updated_newsletter)
    
    # Create new subscription
    newsletter_dict = newsletter_data.dict()
    result = await db.newsletters.insert_one(newsletter_dict)
    
    # Send welcome email
    try:
        await email_service.send_email(
            newsletter_data.email,
            "Welcome to WeCure Newsletter!",
            """
            <h2>Welcome to WeCure Newsletter!</h2>
            <p>Thank you for subscribing to our newsletter.</p>
            <p>You'll receive:</p>
            <ul>
                <li>Health tips and wellness advice</li>
                <li>Latest healthcare news</li>
                <li>Special offers and discounts</li>
                <li>New service announcements</li>
            </ul>
            <p>You can unsubscribe at any time by clicking the unsubscribe link in our emails.</p>
            <p>Best regards,<br>WeCure Team</p>
            """,
            is_html=True
        )
    except Exception as e:
        logger.error(f"Failed to send newsletter welcome email: {e}")
    
    created_newsletter = await db.newsletters.find_one({"_id": result.inserted_id})
    return Newsletter(**created_newsletter)

@router.post("/newsletter/unsubscribe")
async def unsubscribe_newsletter(
    email: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Unsubscribe from newsletter"""
    result = await db.newsletters.update_one(
        {"email": email},
        {"$set": {
            "is_subscribed": False,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Email not found in newsletter")
    
    # Send confirmation email
    try:
        await email_service.send_email(
            email,
            "Newsletter Unsubscription Confirmed - WeCure",
            """
            <h2>Unsubscription Confirmed</h2>
            <p>You have been successfully unsubscribed from the WeCure newsletter.</p>
            <p>We're sorry to see you go! If you change your mind, you can always subscribe again on our website.</p>
            <p>Best regards,<br>WeCure Team</p>
            """,
            is_html=True
        )
    except Exception as e:
        logger.error(f"Failed to send unsubscribe confirmation email: {e}")
    
    return {"message": "Successfully unsubscribed from newsletter"}

@router.get("/newsletter/subscribers")
async def get_newsletter_subscribers(
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """Get newsletter subscribers (Admin only)"""
    cursor = db.newsletters.find({
        "is_subscribed": True
    }).skip(skip).limit(limit).sort("created_at", -1)
    
    subscribers = []
    async for subscriber in cursor:
        subscribers.append(Newsletter(**subscriber))
    
    # Get total count
    total_subscribers = await db.newsletters.count_documents({"is_subscribed": True})
    
    return {
        "subscribers": subscribers,
        "total": total_subscribers,
        "page": skip // limit + 1,
        "per_page": limit
    }