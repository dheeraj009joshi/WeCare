# WeCure FastAPI Backend

A comprehensive healthcare and food delivery API built with FastAPI and MongoDB using Beanie ODM.

## Features

### Healthcare Features
- **User Management**: User registration, authentication, and profile management
- **Doctor Management**: Doctor registration, profiles, and availability
- **Appointments**: Book, manage, and track medical appointments
- **Products**: Medicine and healthcare product catalog
- **Orders**: E-commerce functionality for healthcare products
- **Services**: Healthcare services management
- **Chat System**: AI-powered chat and doctor-patient messaging
- **Ambulance Services**: Emergency ambulance booking and management

### Food Delivery Features
- **Restaurants**: Restaurant management and listings
- **Menu Items**: Food menu management with detailed information
- **Food Categories**: Categorization of food items
- **Food Cart**: Shopping cart functionality
- **Food Orders**: Order management and tracking

### Additional Features
- **Address Management**: User address management
- **Contact System**: Customer support and contact management
- **Newsletter**: Email subscription management
- **File Uploads**: File upload and management
- **Escalation System**: Support ticket escalation

## Technology Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **MongoDB**: NoSQL database for flexible data storage
- **Beanie**: MongoDB ODM for Python
- **Pydantic**: Data validation using Python type annotations
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Motor**: Async MongoDB driver

## Project Structure

```
fastapi_backend/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration settings
├── database.py            # Database connection and initialization
├── requirements.txt       # Python dependencies
├── env.example           # Environment variables template
├── models/               # Pydantic schemas and Beanie models
│   ├── user.py
│   ├── doctor.py
│   ├── appointment.py
│   ├── product.py
│   ├── order.py
│   ├── cart.py
│   ├── service.py
│   ├── address.py
│   ├── message.py
│   ├── doctor_availability.py
│   ├── doctor_message.py
│   ├── ambulance.py
│   ├── contact.py
│   ├── escalation.py
│   ├── file_upload.py
│   ├── footer_content.py
│   ├── newsletter.py
│   ├── food_cart.py
│   ├── food_category.py
│   ├── food_order.py
│   ├── menu_item.py
│   └── restaurant.py
└── routers/              # API route handlers
    ├── auth.py
    ├── users.py
    ├── doctors.py
    ├── appointments.py
    ├── products.py
    ├── orders.py
    ├── services.py
    └── food_delivery.py
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fastapi_backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

6. **Run the application**
   ```bash
   python main.py
   ```

   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=wecure_db

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Azure Storage (Optional)
AZURE_STORAGE_CONNECTION_STRING=your-azure-connection-string
AZURE_CONTAINER_NAME=wecure-images

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

## API Documentation

Once the server is running, you can access:

- **Interactive API docs**: http://localhost:8000/docs
- **ReDoc documentation**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/register-doctor` - Doctor registration
- `POST /api/auth/login` - User/Doctor login
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users/` - Get all users
- `GET /api/users/{user_id}` - Get user by ID
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user

### Doctors
- `GET /api/doctors/` - Get all doctors
- `GET /api/doctors/{doctor_id}` - Get doctor by ID
- `PUT /api/doctors/{doctor_id}` - Update doctor
- `DELETE /api/doctors/{doctor_id}` - Delete doctor

### Appointments
- `GET /api/appointments/` - Get appointments
- `GET /api/appointments/{appointment_id}` - Get appointment by ID
- `POST /api/appointments/` - Create appointment
- `PUT /api/appointments/{appointment_id}` - Update appointment
- `DELETE /api/appointments/{appointment_id}` - Delete appointment

### Products
- `GET /api/products/` - Get products
- `GET /api/products/{product_id}` - Get product by ID
- `POST /api/products/` - Create product
- `PUT /api/products/{product_id}` - Update product
- `DELETE /api/products/{product_id}` - Delete product

### Orders
- `GET /api/orders/` - Get orders
- `GET /api/orders/{order_id}` - Get order by ID
- `POST /api/orders/` - Create order
- `PUT /api/orders/{order_id}` - Update order
- `DELETE /api/orders/{order_id}` - Delete order

### Services
- `GET /api/services/` - Get services
- `GET /api/services/{service_id}` - Get service by ID
- `POST /api/services/` - Create service
- `PUT /api/services/{service_id}` - Update service
- `DELETE /api/services/{service_id}` - Delete service

### Food Delivery
- `GET /api/food/restaurants` - Get restaurants
- `GET /api/food/menu-items` - Get menu items
- `GET /api/food/categories` - Get food categories
- `GET /api/food/cart` - Get user's food cart
- `POST /api/food/cart` - Add item to cart
- `GET /api/food/orders` - Get food orders

## Database Models

The application uses MongoDB with the following main collections:

- **users**: User accounts and profiles
- **doctors**: Doctor profiles and information
- **appointments**: Medical appointments
- **products**: Healthcare products and medicines
- **orders**: E-commerce orders
- **carts**: Shopping carts
- **services**: Healthcare services
- **addresses**: User addresses
- **messages**: Chat messages
- **chat_sessions**: Chat sessions
- **doctor_availabilities**: Doctor availability schedules
- **doctor_messages**: Doctor-patient messaging
- **ambulances**: Ambulance services
- **contacts**: Contact form submissions
- **escalations**: Support escalations
- **file_uploads**: File uploads
- **footer_contents**: Footer content management
- **newsletters**: Newsletter subscriptions
- **food_cart**: Food delivery cart
- **food_categories**: Food categories
- **food_orders**: Food delivery orders
- **food_order_items**: Food order items
- **menu_items**: Restaurant menu items
- **restaurants**: Restaurant information

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Development

### Running in Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Code Formatting

```bash
black .
isort .
```

### Type Checking

```bash
mypy .
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
