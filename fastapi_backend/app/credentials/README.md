# Google Calendar Integration Setup

To enable meeting link generation and Google Calendar integration, follow these steps:

## 1. Create Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to "APIs & Services" > "Library"
4. Search and enable "Google Calendar API"

## 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Desktop application"
4. Download the JSON file
5. Rename it to `google-calendar-credentials.json`
6. Place it in this `credentials` directory

## 3. Required Files

Place these files in `/Users/dheeraj/Downloads/wecure-main/fastapi_backend/app/credentials/`:

- `google-calendar-credentials.json` - OAuth credentials from Google Cloud Console
- `google-calendar-token.json` - Will be auto-generated on first auth

## 4. Environment Variables

Add to your `.env` file:

```env
# Google Calendar Integration
GOOGLE_CALENDAR_ENABLED=true
GOOGLE_MEET_ENABLED=true
```

## 5. First Setup

1. Start the FastAPI server
2. Book an appointment
3. The first time will prompt for authentication
4. A browser window will open for OAuth flow
5. Grant permissions to access calendar
6. Token will be saved automatically

## 6. Features Enabled

Once configured:
- ✅ Automatic Google Calendar event creation
- ✅ Google Meet links for online appointments
- ✅ Email notifications with calendar links
- ✅ Appointment updates sync with calendar

## Troubleshooting

**Calendar integration disabled**: Check if `google-calendar-credentials.json` exists
**Authentication failed**: Delete `google-calendar-token.json` and restart server
**Meet links not generated**: Ensure Google Meet is enabled in your Google Workspace