# WeCure FastAPI Backend

A comprehensive healthcare platform backend built with FastAPI, MongoDB, and Azure services.

## 🚀 Features

### Core Services
- **User Authentication & Management** - JWT-based auth for users and doctors
- **Doctor Registration & Verification** - Complete doctor onboarding system
- **Appointment Booking System** - Schedule and manage medical appointments
- **Medicine Store** - Full e-commerce for medicines with cart and orders
- **Food Delivery** - Healthy food delivery with restaurant management
- **AI-Powered Health Chat** - Google Gemini-powered health assistant
- **Emergency Services** - Ambulance booking and emergency contacts
- **Admin Dashboard** - Complete admin panel with analytics

### Technical Features
- **MongoDB Atlas** - Cloud database with modern ODM
- **Azure Blob Storage** - Secure file storage for images and documents
- **Google Gemini AI** - Advanced AI for health consultations
- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - API protection with configurable limits
- **Email Notifications** - SMTP-based email system
- **Real-time Chat** - WebSocket support for live communication
- **Comprehensive API Documentation** - Auto-generated OpenAPI docs

## 📋 Requirements

- Python 3.11+
- MongoDB Atlas account
- Azure Storage account
- Google Cloud account (for Gemini AI)
- Gmail account (for SMTP)

## 🔧 Installation

1. **Clone and navigate to the FastAPI backend:**
   ```bash
   cd fastapi_backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file with the provided credentials:
   ```env
   # MongoDB Configuration
   MONGODB_URL=mongodb+srv://dlovej009:Dheeraj2006@cluster0.dnu8vna.mongodb.net/wecare
   DATABASE_NAME=wecare
   
   # Azure Storage Configuration
   AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=printxd;AccountKey=CaL/3SmhK8iKVM02i/cIN1VgE3058lyxRnCxeRd2J1k/9Ay6I67GC2CMnW//lJhNl+71WwxYXHnC+AStkbW1Jg==;EndpointSuffix=core.windows.net
   CONTAINER_NAME=mf2
   
   # JWT Configuration
   JWT_SECRET_KEY=7b553b2f9783baa22c38a81e0d7a6d2879f42c4e9ee62a62e6801c5b74406bc9f815febcaa121b57713f2495b1a739474a6072c0e575aab44e1a13e382516dfe
   
   # AI Configuration
   GEMINI_API_KEY=AIzaSyC63YplvWNwe-yJqQVQHkV9tp5oxuuCNFk
   GEMINI_API_KEY_1=AIzaSyDwRGUvDNec8zLj_9suO8e_Yz74lJMeRgA
   GEMINI_API_KEY_2=AIzaSyBiaJwvDH_dv3RXjKvTY3G4Vj2lMBXBpIw
   
   # Email Configuration
   EMAIL_USER=tanukum.ss784@gmail.com
   EMAIL_PASSWORD=dmxl taim rtpg ador
   ```

## 🚀 Running the Server

### Development Mode
```bash
python start.py
```

### Production Mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Using Docker
```bash
docker-compose up --build
```

## 📚 API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:4000/docs
- **ReDoc**: http://localhost:4000/redoc
- **OpenAPI JSON**: http://localhost:4000/openapi.json

## 🏗️ Project Structure

```
fastapi_backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Configuration settings
│   │   ├── database.py        # MongoDB connection
│   │   └── security.py        # JWT and password hashing
│   ├── models/
│   │   ├── user.py           # User models
│   │   ├── doctor.py         # Doctor models
│   │   ├── medicine.py       # Medicine store models
│   │   ├── food_delivery.py  # Food delivery models
│   │   ├── appointment.py    # Appointment models
│   │   ├── chat.py           # Chat and messaging models
│   │   ├── emergency.py      # Emergency services models
│   │   ├── orders.py         # Order management models
│   │   └── general.py        # General purpose models
│   ├── routes/
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── medicine.py       # Medicine store endpoints
│   │   ├── food_delivery.py  # Food delivery endpoints
│   │   ├── appointments.py   # Appointment endpoints
│   │   ├── chat.py           # Chat and AI endpoints
│   │   ├── emergency.py      # Emergency services endpoints
│   │   ├── admin.py          # Admin panel endpoints
│   │   ├── services.py       # General services endpoints
│   │   └── contact.py        # Contact and support endpoints
│   ├── services/
│   │   ├── azure_storage.py  # Azure Blob Storage service
│   │   ├── ai_service.py     # Google Gemini AI service
│   │   └── email_service.py  # Email notification service
│   ├── middleware/
│   │   ├── logging.py        # Request logging middleware
│   │   └── rate_limiting.py  # Rate limiting middleware
│   ├── utils/
│   │   └── auth.py           # Authentication utilities
│   └── main.py               # FastAPI application setup
├── requirements.txt          # Python dependencies
├── Dockerfile               # Docker configuration
├── docker-compose.yml      # Docker Compose setup
├── start.py                # Development startup script
└── README.md               # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/doctor/register` - Doctor registration
- `POST /api/auth/doctor/login` - Doctor login

### Medicine Store
- `GET /api/medicine-store/` - List medicines
- `POST /api/medicine-store/` - Create medicine (Admin)
- `GET /api/medicine-store/cart/` - Get user cart
- `POST /api/medicine-store/cart/add` - Add to cart

### Food Delivery
- `GET /api/food-delivery/restaurants` - List restaurants
- `GET /api/food-delivery/restaurants/{id}/menu` - Restaurant menu
- `POST /api/food-delivery/cart/add` - Add to food cart
- `POST /api/food-delivery/orders` - Create food order

### Appointments
- `GET /api/appointments/` - List user appointments
- `POST /api/appointments/` - Book appointment
- `GET /api/appointments/available-slots/{doctor_id}` - Available slots

### Chat & AI
- `GET /api/chat/sessions` - List chat sessions
- `POST /api/chat/sessions` - Create chat session
- `POST /api/chat/sessions/{id}/messages` - Send message
- `WebSocket /api/chat/sessions/{id}/ws` - Real-time chat

### Emergency Services
- `POST /api/emergency/request` - Create emergency request
- `GET /api/emergency/contacts` - Emergency contacts
- `GET /api/emergency/ambulances/track/{id}` - Track ambulance

### Admin Panel
- `GET /api/admin/dashboard/analytics` - Dashboard analytics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/doctors` - Manage doctors
- `PUT /api/admin/doctors/{id}/verify` - Verify doctor

### Services & Contact
- `GET /api/services/` - List services
- `POST /api/contact/` - Submit contact form
- `POST /api/contact/newsletter/subscribe` - Newsletter subscription

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per minute per IP
- **CORS**: Configured for secure cross-origin requests
- **JWT**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Pydantic models for request validation
- **SQL Injection Protection**: MongoDB ODM prevents injection attacks

## 🔧 Configuration

Key configuration options in `app/core/config.py`:

- **Database Settings**: MongoDB connection and database name
- **JWT Settings**: Secret key, algorithm, and token expiration
- **CORS Origins**: Allowed origins for cross-origin requests
- **Rate Limiting**: Request limits and time windows
- **File Upload**: Azure Storage configuration
- **Email Settings**: SMTP configuration
- **AI Settings**: Google Gemini API keys

## 📊 Monitoring & Logging

- **Request Logging**: All requests logged with timing information
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Health Checks**: Health check endpoints for monitoring
- **Performance Metrics**: Request timing headers included in responses

## 🚀 Deployment

### Using Docker
```bash
docker build -t wecure-backend .
docker run -p 8000:4000 --env-file .env wecure-backend
```

### Using Docker Compose
```bash
docker-compose up -d
```

### Environment Variables
Ensure all required environment variables are set in production:
- `MONGODB_URL`
- `AZURE_STORAGE_CONNECTION_STRING`
- `GEMINI_API_KEY`
- `JWT_SECRET_KEY`
- `EMAIL_USER` and `EMAIL_PASSWORD`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@wecure.com or create an issue in the repository.

## 🔄 Migration from Node.js

This FastAPI backend is a complete migration from the original Node.js/Express backend with the following improvements:

- **Modern Python Stack**: FastAPI with async/await support
- **Better Type Safety**: Pydantic models with automatic validation
- **Improved Performance**: Async database operations with Motor
- **Enhanced Security**: Built-in security features and middleware
- **Better Documentation**: Auto-generated OpenAPI documentation
- **Cloud-First**: Designed for modern cloud deployment
- **Comprehensive Testing**: Built with testing in mind

All original functionality has been preserved and enhanced with additional features and better architecture.