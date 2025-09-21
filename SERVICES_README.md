# Medical Services System - Auto-Doctor Matching

## Overview

This system automatically adds doctors to medical services based on their specializations and availability. When a service is created, the system automatically finds and displays all matching doctors who can provide that service.

## 🚀 Key Features

### 1. **Automatic Doctor Matching**
- Services are created with specific medical specializations
- Doctors are automatically matched based on their specializations
- Real-time availability checking
- No manual doctor assignment required

### 2. **Smart Specialization Matching**
- Uses PostgreSQL's `@>` (contains) and `&&` (overlap) operators
- Supports multiple specializations per service
- Flexible matching algorithms

### 3. **Real-time Updates**
- Available doctors count updates automatically
- Doctor lists refresh when services change
- Live availability status

## 🏗️ System Architecture

### Backend Components

#### 1. **Service Model** (`backend/src/models/Service.js`)
```javascript
const Service = sequelize.define('Service', {
  name: DataTypes.STRING,           // Service name
  description: DataTypes.TEXT,      // Service description
  category: DataTypes.STRING,       // Medical category
  price: DataTypes.DECIMAL,         // Service price
  duration: DataTypes.INTEGER,      // Duration in minutes
  specializations: DataTypes.JSON,  // Required specializations
  requirements: DataTypes.JSON,     // Patient requirements
  isActive: DataTypes.BOOLEAN       // Service availability
});
```

#### 2. **Service Controller** (`backend/src/controllers/serviceController.js`)
- `createService()` - Creates service and auto-finds doctors
- `getAllServices()` - Returns services with available doctors
- `getServiceById()` - Returns specific service with doctors
- `updateService()` - Updates service details
- `deleteService()` - Removes service

#### 3. **Service Routes** (`backend/src/routes/services.js`)
```
GET    /api/services              - Get all services with doctors
GET    /api/services/:id          - Get specific service with doctors
GET    /api/services/category/:category - Get services by category
POST   /api/services              - Create new service
PUT    /api/services/:id          - Update service
DELETE /api/services/:id          - Delete service
```

### Frontend Components

#### 1. **Services Page** (`frontend/src/components/Services.jsx`)
- Displays all services with available doctors
- Category filtering
- Real-time doctor availability
- Beautiful UI with animations

#### 2. **Create Service Form** (`frontend/src/components/CreateService.jsx`)
- Admin interface for creating services
- Specialization and requirement management
- Real-time validation
- Success feedback with doctor count

## 🔄 How It Works

### 1. **Service Creation Process**
```javascript
// 1. Admin creates service with specializations
const service = await Service.create({
  name: 'Cardiology Consultation',
  specializations: ['Cardiology', 'Interventional Cardiology'],
  // ... other fields
});

// 2. System automatically finds matching doctors
const matchingDoctors = await Doctor.findAll({
  where: {
    isVerified: true,
    isAvailable: true,
    specializations: {
      [Op.overlap]: service.specializations
    }
  }
});

// 3. Service is returned with doctor information
return {
  service,
  availableDoctors: matchingDoctors.length,
  doctors: matchingDoctors
};
```

### 2. **Doctor Matching Algorithm**
```javascript
// Uses PostgreSQL JSON operators for efficient matching
specializations: {
  [Op.overlap]: service.specializations  // Any specialization matches
}

// Alternative: Strict matching
specializations: {
  [Op.contains]: service.specializations  // All specializations must match
}
```

### 3. **Real-time Updates**
- Services automatically refresh doctor availability
- New doctors appear immediately when they register
- Doctor status changes update service listings

## 📊 Database Schema

### Services Table
```sql
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration INTEGER,
  image TEXT,
  requirements JSON DEFAULT '[]',
  specializations JSON DEFAULT '[]',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Doctors Table (existing)
```sql
-- The doctors table already exists with:
-- specializations JSON field
-- isVerified BOOLEAN field  
-- isAvailable BOOLEAN field
```

## 🚀 Getting Started

### 1. **Backend Setup**
```bash
cd backend
npm install
npm run dev
```

### 2. **Database Setup**
The system automatically handles database schema:
- Creates services table if it doesn't exist
- Converts existing specializations to JSON format
- Adds bio column if missing

### 3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

### 4. **Test the System**
```bash
# Run the demo script
cd backend
npm run demo:services

# Or run manually
node src/scripts/demoServices.js
```

## 📱 Usage Examples

### Creating a Service
```javascript
// POST /api/services
{
  "name": "Cardiology Consultation",
  "description": "Expert consultation for heart-related issues",
  "category": "Cardiology",
  "price": 1500,
  "duration": 30,
  "specializations": ["Cardiology", "Interventional Cardiology"]
}
```

### Response
```javascript
{
  "message": "Service created successfully",
  "service": { /* service details */ },
  "availableDoctors": 3,
  "doctors": [
    {
      "id": 1,
      "name": "Dr. John Smith",
      "specializations": ["Cardiology", "Interventional Cardiology"],
      "experience": 15,
      "consultationFee": 1500
    }
    // ... more doctors
  ]
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=wecure

# Server
PORT=5000
NODE_ENV=development
```

### Database Connection
The system automatically:
- Connects to PostgreSQL
- Syncs models with database
- Fixes schema issues automatically
- Handles JSON column conversions

## 🎯 Benefits

### 1. **For Administrators**
- No manual doctor assignment needed
- Automatic service-doctor matching
- Real-time availability tracking
- Easy service management

### 2. **For Patients**
- See available doctors for each service
- Real-time availability information
- Transparent pricing and duration
- Easy appointment booking

### 3. **For Doctors**
- Automatic service discovery
- No manual service registration needed
- Real-time availability updates
- Increased patient visibility

## 🚨 Troubleshooting

### Common Issues

#### 1. **Database Connection Failed**
```bash
# Check database is running
# Verify connection details in .env
# Run database fix script
npm run fix:db
```

#### 2. **Schema Mismatch**
```bash
# The system automatically fixes most issues
# Check console logs for schema fix messages
# Restart backend if needed
```

#### 3. **No Doctors Found**
- Verify doctors have correct specializations
- Check doctor verification status
- Ensure doctor availability is set to true

### Debug Commands
```bash
# Check table structure
curl http://localhost:5000/api/debug/table-structure

# Add bio column if missing
curl -X POST http://localhost:5000/api/debug/add-bio-column

# Test services endpoint
curl http://localhost:5000/api/services
```

## 🔮 Future Enhancements

### Planned Features
1. **Advanced Matching Algorithms**
   - Experience-based matching
   - Rating-based sorting
   - Location-based filtering

2. **Service Scheduling**
   - Automatic appointment scheduling
   - Conflict detection
   - Calendar integration

3. **Analytics Dashboard**
   - Service popularity metrics
   - Doctor utilization rates
   - Revenue analytics

4. **Mobile App**
   - Native mobile interfaces
   - Push notifications
   - Offline capabilities

## 📞 Support

For technical support or questions:
1. Check the console logs for error messages
2. Verify database connectivity
3. Check API endpoint responses
4. Review the troubleshooting section above

## 📄 License

This system is part of the WeCure medical platform. All rights reserved.

---

**🎉 Congratulations!** You now have a fully automated medical services system that automatically matches doctors to services based on their specializations and availability.
