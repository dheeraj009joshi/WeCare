"""
Google Calendar Integration Service for WeCure
Handles appointment scheduling with Google Calendar
"""

import json
import logging
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import asyncio
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

# Gmail API scopes
SCOPES = ['https://www.googleapis.com/auth/calendar']

class GoogleCalendarService:
    def __init__(self):
        self.credentials_file = os.path.join(os.path.dirname(__file__), '..', 'credentials', 'google-calendar-credentials.json')
        self.token_file = os.path.join(os.path.dirname(__file__), '..', 'credentials', 'google-calendar-token.json')
        self.service = None
        
    async def initialize(self):
        """Initialize Google Calendar service with authentication"""
        try:
            creds = None
            
            # Load existing token
            if os.path.exists(self.token_file):
                creds = Credentials.from_authorized_user_file(self.token_file, SCOPES)
            
            # If there are no (valid) credentials available, let the user log in
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    if os.path.exists(self.credentials_file):
                        flow = InstalledAppFlow.from_client_secrets_file(
                            self.credentials_file, SCOPES)
                        creds = flow.run_local_server(port=0)
                    else:
                        logger.warning("Google credentials file not found. Calendar integration will be disabled.")
                        return False
                
                # Save the credentials for the next run
                with open(self.token_file, 'w') as token:
                    token.write(creds.to_json())
            
            self.service = build('calendar', 'v3', credentials=creds)
            logger.info("Google Calendar service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Google Calendar service: {e}")
            return False
    
    async def create_appointment_event(
        self,
        appointment_data: Dict[str, Any],
        doctor_email: str,
        patient_email: str
    ) -> Optional[Dict[str, Any]]:
        """Create a Google Calendar event for an appointment"""
        if not self.service:
            await self.initialize()
            if not self.service:
                logger.warning("Google Calendar service not available")
                return None
        
        try:
            # Parse appointment date and time
            appointment_date = appointment_data['appointment_date']
            appointment_time = appointment_data['appointment_time']
            
            # Convert to datetime
            if isinstance(appointment_date, str):
                start_datetime = datetime.strptime(f"{appointment_date} {appointment_time}", "%Y-%m-%d %H:%M")
            else:
                start_datetime = datetime.combine(appointment_date, datetime.strptime(appointment_time, "%H:%M").time())
            
            # 30-minute appointment duration
            end_datetime = start_datetime + timedelta(minutes=30)
            
            # Create event
            event = {
                'summary': f'Medical Consultation - {appointment_data.get("symptoms", "General Consultation")}',
                'description': f'''
Medical Appointment Details:
- Patient: {appointment_data.get("patient_name", "Patient")}
- Doctor: {appointment_data.get("doctor_name", "Doctor")}
- Symptoms: {appointment_data.get("symptoms", "Not specified")}
- Consultation Fee: ₹{appointment_data.get("consultation_fee", 0)}
- Appointment ID: {appointment_data.get("appointment_id", "N/A")}

This is an automated event created by WeCure Healthcare Platform.
                '''.strip(),
                'start': {
                    'dateTime': start_datetime.isoformat(),
                    'timeZone': 'Asia/Kolkata',
                },
                'end': {
                    'dateTime': end_datetime.isoformat(),
                    'timeZone': 'Asia/Kolkata',
                },
                'attendees': [
                    {'email': doctor_email},
                    {'email': patient_email},
                ],
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                        {'method': 'popup', 'minutes': 30},       # 30 minutes before
                    ],
                },
                'conferenceData': {
                    'createRequest': {
                        'requestId': f"wecure-{appointment_data.get('appointment_id', datetime.now().strftime('%Y%m%d%H%M%S'))}",
                        'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                    }
                },
                'guestsCanModify': False,
                'guestsCanInviteOthers': False,
                'guestsCanSeeOtherGuests': True,
            }
            
            # Create the event
            event = self.service.events().insert(
                calendarId='primary',
                body=event,
                conferenceDataVersion=1,
                sendUpdates='all'
            ).execute()
            
            logger.info(f"Calendar event created successfully: {event.get('id')}")
            
            return {
                'event_id': event.get('id'),
                'event_link': event.get('htmlLink'),
                'meet_link': event.get('conferenceData', {}).get('entryPoints', [{}])[0].get('uri') if event.get('conferenceData') else None,
                'start_time': start_datetime.isoformat(),
                'end_time': end_datetime.isoformat()
            }
            
        except HttpError as error:
            logger.error(f"An error occurred while creating calendar event: {error}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in calendar event creation: {e}")
            return None
    
    async def update_appointment_event(
        self,
        event_id: str,
        appointment_data: Dict[str, Any]
    ) -> bool:
        """Update an existing Google Calendar event"""
        if not self.service:
            await self.initialize()
            if not self.service:
                return False
        
        try:
            # Get the existing event
            event = self.service.events().get(calendarId='primary', eventId=event_id).execute()
            
            # Update event details
            event['summary'] = f'Medical Consultation - {appointment_data.get("symptoms", "General Consultation")}'
            
            # Update the event
            updated_event = self.service.events().update(
                calendarId='primary',
                eventId=event_id,
                body=event,
                sendUpdates='all'
            ).execute()
            
            logger.info(f"Calendar event updated successfully: {event_id}")
            return True
            
        except HttpError as error:
            logger.error(f"An error occurred while updating calendar event: {error}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error in calendar event update: {e}")
            return False
    
    async def cancel_appointment_event(self, event_id: str) -> bool:
        """Cancel a Google Calendar event"""
        if not self.service:
            await self.initialize()
            if not self.service:
                return False
        
        try:
            self.service.events().delete(
                calendarId='primary',
                eventId=event_id,
                sendUpdates='all'
            ).execute()
            
            logger.info(f"Calendar event cancelled successfully: {event_id}")
            return True
            
        except HttpError as error:
            logger.error(f"An error occurred while cancelling calendar event: {error}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error in calendar event cancellation: {e}")
            return False
    
    async def get_busy_times(self, email: str, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get busy times for a user within a date range"""
        if not self.service:
            await self.initialize()
            if not self.service:
                return []
        
        try:
            freebusy_query = {
                'timeMin': start_date.isoformat() + 'Z',
                'timeMax': end_date.isoformat() + 'Z',
                'items': [{'id': email}]
            }
            
            result = self.service.freebusy().query(body=freebusy_query).execute()
            busy_times = result.get('calendars', {}).get(email, {}).get('busy', [])
            
            return busy_times
            
        except HttpError as error:
            logger.error(f"An error occurred while getting busy times: {error}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in getting busy times: {e}")
            return []

# Global calendar service instance
calendar_service = GoogleCalendarService()