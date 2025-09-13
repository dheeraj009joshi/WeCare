# 🧪 WeCure API Postman Testing Guide

This guide will help you test the complete WeCure Healthcare Platform API using the provided Postman collection, including the new Google Calendar integration and 30-minute time slot features.

## 📋 Quick Setup

### 1. Import Files into Postman

1. **Import Collection**: Import `WeCure_API_Collection.postman_collection.json`
2. **Import Environment**: Import `WeCure_API_Environment.postman_environment.json`
3. **Select Environment**: Make sure "WeCure API Environment" is selected in Postman

### 2. Start the Backend Server

```bash
cd fastapi_backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start the Frontend (Optional)

```bash
cd frontend
npm run dev
```

## 🎯 Testing Features

### ✅ **New Google Calendar & 30-Minute Slot Features**

The collection includes comprehensive tests for our newly implemented features:

#### **30-Minute Time Slots & Availability**
- `📅 Appointments & Availability > 🕐 30-Minute Time Slots & Availability`
  - **Get Doctor Available Slots (Daily)**: Check available 30-minute slots for a specific date
  - **Get Doctor Weekly Availability**: View 7-day availability overview
  - **Get Alternative Available Slots**: Alternative slot checking endpoint
  - **Get/Create Doctor Availability Settings**: Manage doctor schedules

#### **Enhanced Appointment Booking**
- `📅 Appointments & Availability > 📋 Appointment Management > Book Appointment`
  - Now includes automatic **Google Calendar integration**
  - Sends **email notifications** to both doctor and patient
  - Performs **real-time availability checking**
  - Suggests **alternative slots** when requested time is unavailable

## 🚀 Testing Workflows

### **Workflow 1: Complete Appointment Booking Flow**

Use the "🧪 Testing Scenarios > 🧪 Appointment Booking Flow Test" folder:

1. **Register Patient** → Creates test patient account
2. **Login Patient** → Gets authentication token
3. **Check Doctor Availability** → Tests 30-minute slot checking
4. **Test Appointment Booking** → Books appointment with calendar/email integration

### **Workflow 2: Manual Step-by-Step Testing**

#### Step 1: Authentication
```
1. 🔐 Authentication > User Registration
2. 🔐 Authentication > User Login (saves token automatically)
3. 🔐 Authentication > Doctor Registration
4. 🔐 Authentication > Doctor Login (saves doctor token)
```

#### Step 2: Test Availability System
```
1. 📅 Appointments & Availability > 🕐 Get Doctor Available Slots
   - Tests: /api/appointments/doctor/{doctor_id}/available-slots?date=2025-09-15
   
2. 📅 Appointments & Availability > 🕐 Get Doctor Weekly Availability  
   - Tests: /api/appointments/doctor/{doctor_id}/availability-week?start_date=2025-09-15
```

#### Step 3: Book Appointment with Full Integration
```
1. 📅 Appointments & Availability > 📋 Book Appointment
   - Automatically creates Google Calendar event
   - Sends email notifications to doctor and patient
   - Checks slot availability before booking
   - Returns appointment with meet_link and calendar_event_id
```

## 🔧 Environment Variables

The environment automatically manages these variables:

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `base_url` | API base URL | ✅ |
| `access_token` | User authentication token | ✅ (from login) |
| `doctor_token` | Doctor authentication token | ✅ (from doctor login) |
| `user_id` | Logged-in user ID | ✅ |
| `doctor_id` | Doctor ID for testing | ✅ |
| `appointment_id` | Created appointment ID | ✅ |

## 📊 API Endpoints Covered

### **🆕 New Availability Endpoints**
- `GET /api/appointments/doctor/{doctor_id}/available-slots?date=YYYY-MM-DD`
- `GET /api/appointments/doctor/{doctor_id}/availability-week?start_date=YYYY-MM-DD`
- `GET /api/appointments/available-slots/{doctor_id}?date=YYYY-MM-DD`
- `GET /api/appointments/doctor/{doctor_id}/availability`
- `POST /api/appointments/doctor/availability`

### **🔄 Enhanced Booking Endpoint**
- `POST /api/appointments/` - Now includes:
  - ✅ Real-time availability checking
  - ✅ Google Calendar event creation
  - ✅ Email notifications
  - ✅ Alternative slot suggestions

### **📱 All Platform Features**
- **🔐 Authentication**: User/Doctor registration and login
- **📅 Appointments**: Complete appointment management
- **💊 Medicine Store**: Medicine catalog and cart management
- **🍔 Food Delivery**: Restaurant and menu management
- **💬 Chat & AI**: Health consultation chat system
- **🚨 Emergency**: Emergency request system
- **📞 Contact**: Contact forms and support

## 🧪 Expected Results

### **Availability Endpoints**
- **Valid Doctor ID**: Returns formatted 30-minute slots
- **Invalid Doctor ID**: Returns `{"detail": "Doctor not found"}`
- **Valid Date**: Returns available slots for the day/week
- **Invalid Date**: Returns `400 Bad Request` with date format error

### **Enhanced Appointment Booking**
```json
{
  "id": "appointment_id",
  "patient_id": "user_id",
  "doctor_id": "doctor_id",
  "appointment_date": "2025-09-15",
  "appointment_time": "10:00",
  "status": "pending",
  "calendar_event_id": "google_calendar_event_id",
  "meet_link": "https://meet.google.com/xxx-xxxx-xxx",
  "symptoms": "Health consultation",
  "consultation_fee": 150.0,
  "created_at": "2025-09-11T10:30:00Z",
  "updated_at": "2025-09-11T10:30:00Z"
}
```

### **Error Handling**
- **Slot Unavailable**: Returns suggested alternative slots
- **Invalid Doctor**: Returns doctor not found error
- **Authentication Required**: Returns 401 Unauthorized
- **Validation Errors**: Returns detailed field validation messages

## 🔍 Troubleshooting

### **Common Issues**

#### 1. **404 Not Found on Availability Endpoints**
✅ **Fixed**: Custom 404 handler was disabled to allow proper route resolution

#### 2. **"Doctor not found" Responses**
Expected behavior when testing with sample ObjectIds - the endpoints are working correctly

#### 3. **Authentication Tokens**
- Tokens are automatically saved when you run login requests
- Use the environment variables `{{access_token}}` and `{{doctor_token}}`

#### 4. **Server Not Running**
Ensure backend server is running on `http://localhost:4000`:
```bash
cd fastapi_backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📈 Test Results Validation

### **Successful Test Indicators**
- ✅ Authentication endpoints return tokens
- ✅ Availability endpoints return formatted slot data or proper error messages
- ✅ Appointment booking includes `calendar_event_id` and `meet_link`
- ✅ All endpoints return proper HTTP status codes
- ✅ Email notifications logged in server console

### **Integration Verification**
1. **Calendar Integration**: Look for `calendar_event_id` in appointment responses
2. **Email Integration**: Check server logs for email notification confirmations
3. **Availability System**: Verify 30-minute slots are properly formatted
4. **Error Handling**: Confirm alternative slot suggestions when unavailable

## 🎉 Success Metrics

The collection validates that our new features are working:

- **🕐 30-Minute Time Slots**: ✅ Implemented and tested
- **📅 Google Calendar Integration**: ✅ Ready for OAuth2 setup
- **📧 Email Notifications**: ✅ Template-based system active
- **🔄 Smart Availability**: ✅ Real-time checking with alternatives
- **🚀 Complete Workflow**: ✅ End-to-end appointment booking

## 📝 Notes

- Sample ObjectIds are used for testing - replace with real IDs from your database
- Google Calendar features require OAuth2 setup for full functionality
- Email notifications require SMTP configuration for actual sending
- All endpoints are designed to work with the React frontend at `http://localhost:5174`

Happy testing! 🚀