# WeCure Admin Panel Backend

This document describes the complete backend implementation for the WeCure admin panel, providing comprehensive management capabilities for doctors, patients, medicine store, and system analytics.

## 🚀 Features

### 1. Dashboard Management
- **Real-time Statistics**: Total appointments, running appointments, scheduled appointments, completed appointments
- **Revenue Tracking**: Daily earnings from completed appointments
- **User Analytics**: Total doctors and patients count
- **Live Data**: Running appointments and scheduled appointments for today

### 2. Doctors Management
- **Doctor CRUD Operations**: Create, read, update, and delete doctor profiles
- **Status Management**: Activate/deactivate doctors
- **Search & Filter**: Find doctors by name, specialty, or status
- **Consultation Tracking**: Monitor consultation counts for each doctor
- **Active Doctors Summary**: Quick overview of all active doctors

### 3. Patients Management
- **Patient Directory**: Complete list of registered patients
- **Search Functionality**: Find patients by name or email
- **Appointment History**: Track patient appointment counts and last visits
- **Pagination**: Efficient data loading with pagination support

### 4. Medicine Store Management
- **Product CRUD**: Complete product lifecycle management
- **Inventory Control**: Stock management and low stock alerts
- **Category Management**: Organize products by categories
- **Prescription Tracking**: Monitor prescription vs. over-the-counter products
- **Status Control**: Activate/deactivate products

## 🏗️ Architecture

### Directory Structure
```
backend/src/
├── controllers/
│   ├── adminDashboardController.js    # Dashboard statistics and analytics
│   ├── adminDoctorsController.js      # Doctor management operations
│   └── adminMedicineStoreController.js # Medicine store operations
├── middleware/
│   └── adminAuth.js                   # Admin authentication middleware
├── routes/
│   └── admin.js                       # Admin API routes
└── models/                            # Database models (existing)
```

### API Endpoints

#### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/dashboard/running-appointments` - Get currently running appointments
- `GET /api/admin/dashboard/scheduled-appointments` - Get today's scheduled appointments

#### Doctors Management
- `GET /api/admin/doctors` - Get all doctors with filtering
- `POST /api/admin/doctors` - Add new doctor
- `GET /api/admin/doctors/:id` - Get doctor details
- `PUT /api/admin/doctors/:id/status` - Update doctor status
- `DELETE /api/admin/doctors/:id` - Delete doctor
- `GET /api/admin/doctors/summary/active` - Get active doctors summary

#### Patients Management
- `GET /api/admin/patients` - Get patients list with search and pagination

#### Medicine Store
- `GET /api/admin/products` - Get all products with filtering
- `POST /api/admin/products` - Add new product
- `GET /api/admin/products/:id` - Get product details
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `PUT /api/admin/products/:id/stock` - Update product stock
- `GET /api/admin/products/categories` - Get product categories
- `GET /api/admin/products/low-stock` - Get low stock products
- `PUT /api/admin/products/:id/toggle-status` - Toggle product status

#### Authentication
- `POST /api/auth/create-admin` - Create new admin user (admin only)

## 🔐 Security

### Admin Authentication
- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: Only users with 'admin' role can access admin endpoints
- **Middleware Protection**: All admin routes are protected by `adminAuth` middleware

### Data Validation
- **Input Validation**: Comprehensive validation for all input data
- **SQL Injection Prevention**: Using Sequelize ORM with parameterized queries
- **Error Handling**: Proper error handling without exposing sensitive information

## 🗄️ Database Models

### Core Models Used
- **User**: Patient and admin user management
- **Doctor**: Doctor profile and availability management
- **Appointment**: Appointment tracking and analytics
- **Product**: Medicine store inventory management

### Associations
- User ↔ Appointment (Patient)
- Doctor ↔ Appointment
- Product ↔ Cart/Order

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- Environment variables configured

### 2. Installation
```bash
cd backend
npm install
```

### 3. Environment Setup
Create a `.env` file with the following variables:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wecure
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

### 4. Create First Admin User
```bash
npm run create:admin
```
This will create the first admin user with:
- Email: `admin@wecure.com`
- Password: `admin123`

**⚠️ Important**: Change the password after first login!

### 5. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📊 API Response Format

All admin API endpoints follow a consistent response format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "currentPage": 1,
    "totalPages": 10
  }
}
```

## 🔍 Usage Examples

### Creating a New Doctor
```bash
curl -X POST http://localhost:5000/api/admin/doctors \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. John Doe",
    "email": "john.doe@example.com",
    "password": "securepassword",
    "phone": "+1234567890",
    "specializations": ["Cardiology"],
    "qualifications": "MBBS, MD Cardiology",
    "experience": 10,
    "gender": "male",
    "dateOfBirth": "1980-01-01",
    "address": "123 Medical Center",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "pincode": "10001",
    "licenseNumber": "MD123456",
    "hospital": "City Hospital",
    "consultationFee": 150.00
  }'
```

### Adding a New Product
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Paracetamol 500mg",
    "price": 5.99,
    "stock": 100,
    "category": "Pain Relief",
    "prescription": false,
    "dosha": "All Doshas",
    "benefits": "Fever and pain relief",
    "description": "Effective pain reliever and fever reducer",
    "manufacturer": "Generic Pharma"
  }'
```

## 🧪 Testing

### Test Admin Endpoints
```bash
# Test dashboard stats
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/admin/dashboard/stats

# Test doctors list
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/admin/doctors

# Test products list
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/admin/products
```

## 🚨 Error Handling

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient privileges)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Error Logging
All errors are logged to the console with detailed information for debugging purposes.

## 🔄 Data Synchronization

The admin panel automatically syncs with the main application data:
- Real-time appointment updates
- Live doctor and patient statistics
- Current inventory levels
- Active user counts

## 📈 Performance Features

- **Pagination**: Efficient data loading for large datasets
- **Database Indexing**: Optimized queries with proper database indexes
- **Caching**: JWT token caching for improved performance
- **Connection Pooling**: Database connection optimization

## 🔧 Maintenance

### Database Backups
Regular database backups are recommended for production environments.

### Log Monitoring
Monitor application logs for:
- Authentication attempts
- Admin operations
- Error patterns
- Performance metrics

## 🆘 Support

For technical support or questions about the admin panel backend:
1. Check the application logs for error details
2. Verify database connectivity and permissions
3. Ensure all environment variables are properly set
4. Check JWT token validity and admin role assignment

## 📝 Changelog

### Version 1.0.0
- Complete admin panel backend implementation
- Dashboard statistics and analytics
- Doctors management system
- Patients management system
- Medicine store management
- Admin authentication and authorization
- Comprehensive API documentation

---

**Note**: This admin panel backend is designed to work seamlessly with the existing WeCure frontend components and provides a robust foundation for healthcare platform administration.
