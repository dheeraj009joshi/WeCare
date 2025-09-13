# 🍽️ Food Delivery Backend - Complete System

## 📋 Overview

This is a complete, production-ready food delivery backend system built with Node.js, Express, and Sequelize. The system provides comprehensive APIs for managing restaurants, menu items, user carts, orders, and admin operations.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MySQL)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Features

### Core Features
- ✅ **Restaurant Management** - CRUD operations for restaurants
- ✅ **Menu Management** - Comprehensive menu item system
- ✅ **Category System** - Food categorization and filtering
- ✅ **Shopping Cart** - Full cart management with persistence
- ✅ **Order Management** - Complete order lifecycle
- ✅ **User Authentication** - JWT-based authentication
- ✅ **Admin Dashboard** - Comprehensive admin controls
- ✅ **Real-time Updates** - Live order status updates

### Advanced Features
- 🔍 **Search & Filtering** - Advanced search with multiple filters
- 📊 **Analytics** - Detailed business insights and reports
- 🎯 **Recommendations** - Smart food recommendations
- 📱 **Mobile Optimized** - Responsive API design
- 🔒 **Security** - Input validation and sanitization
- 📈 **Scalability** - Database optimization and caching

## 🗄️ Database Schema

### Core Tables

#### 1. `food_categories`
```sql
- id (Primary Key)
- name (VARCHAR)
- identifier (VARCHAR, Unique)
- image (TEXT)
- description (TEXT)
- isActive (BOOLEAN)
- createdAt, updatedAt (Timestamps)
```

#### 2. `restaurants`
```sql
- id (Primary Key)
- name (VARCHAR)
- category (VARCHAR, Foreign Key to food_categories.identifier)
- cuisine (VARCHAR)
- rating (DECIMAL)
- deliveryTime (VARCHAR)
- priceRange (VARCHAR)
- image (TEXT)
- description (TEXT)
- address (TEXT)
- phone (VARCHAR)
- isActive (BOOLEAN)
- isOpen (BOOLEAN)
- openingTime (TIME)
- closingTime (TIME)
- createdAt, updatedAt (Timestamps)
```

#### 3. `menu_items`
```sql
- id (Primary Key)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- restaurantId (Foreign Key to restaurants.id)
- category (VARCHAR)
- image (TEXT)
- isVegetarian (BOOLEAN)
- isVegan (BOOLEAN)
- isGlutenFree (BOOLEAN)
- calories (INTEGER)
- ingredients (JSON)
- allergens (JSON)
- preparationTime (INTEGER)
- isAvailable (BOOLEAN)
- isPopular (BOOLEAN)
- createdAt, updatedAt (Timestamps)
```

#### 4. `food_carts`
```sql
- id (Primary Key)
- userId (Foreign Key to users.id)
- menuItemId (Foreign Key to menu_items.id)
- restaurantId (Foreign Key to restaurants.id)
- quantity (INTEGER)
- specialInstructions (TEXT)
- createdAt, updatedAt (Timestamps)
```

#### 5. `food_orders`
```sql
- id (Primary Key)
- orderNumber (VARCHAR, Unique)
- userId (Foreign Key to users.id)
- subtotal (DECIMAL)
- deliveryFee (DECIMAL)
- taxes (DECIMAL)
- total (DECIMAL)
- paymentMethod (VARCHAR)
- deliveryAddress (JSON)
- deliveryInstructions (TEXT)
- status (ENUM: pending, confirmed, preparing, out_for_delivery, delivered, cancelled)
- paymentStatus (ENUM: pending, paid, failed)
- estimatedDeliveryTime (DATETIME)
- actualDeliveryTime (DATETIME)
- cancellationReason (TEXT)
- createdAt, updatedAt (Timestamps)
```

#### 6. `food_order_items`
```sql
- id (Primary Key)
- orderId (Foreign Key to food_orders.id)
- menuItemId (Foreign Key to menu_items.id)
- restaurantId (Foreign Key to restaurants.id)
- quantity (INTEGER)
- unitPrice (DECIMAL)
- totalPrice (DECIMAL)
- specialInstructions (TEXT)
- itemSnapshot (JSON)
- createdAt, updatedAt (Timestamps)
```

## 🔌 API Endpoints

### Public Endpoints (No Authentication Required)

#### Categories
```
GET /api/food-delivery/categories
```
Get all active food categories

#### Restaurants
```
GET /api/food-delivery/restaurants
GET /api/food-delivery/restaurants?category=khichdi&search=healthy&minRating=4.5
GET /api/food-delivery/restaurants/:id
```
Get restaurants with optional filtering

#### Menu Items
```
GET /api/food-delivery/restaurants/:restaurantId/menu
GET /api/food-delivery/restaurants/:restaurantId/menu?category=main&isVegetarian=true
```
Get menu items for a specific restaurant

### Protected Endpoints (Authentication Required)

#### Cart Management
```
POST   /api/food-delivery/cart/add
GET    /api/food-delivery/cart
PUT    /api/food-delivery/cart/:id
DELETE /api/food-delivery/cart/:id
DELETE /api/food-delivery/cart
```

#### Order Management
```
POST   /api/food-delivery/orders
GET    /api/food-delivery/orders
GET    /api/food-delivery/orders/:id
PUT    /api/food-delivery/orders/:id/cancel
```

### Enhanced Endpoints

#### Data Synchronization
```
POST /api/food-delivery-enhanced/sync-restaurants
POST /api/food-delivery-enhanced/sync-menu-items
GET  /api/food-delivery-enhanced/restaurants
```

### Admin Endpoints

#### Dashboard & Analytics
```
GET /api/food-delivery-admin/dashboard-stats
GET /api/food-delivery-admin/orders
PUT /api/food-delivery-admin/orders/:id/status
GET /api/food-delivery-admin/restaurants/:id/analytics
GET /api/food-delivery-admin/popular-items
GET /api/food-delivery-admin/revenue-stats
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd wecure/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env` file in the backend directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=wecure_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### 4. Database Setup
```bash
# Run database migrations
npm run db:migrate

# Seed initial data
npm run seed:food-delivery
```

### 5. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🌱 Database Seeding

### Run the Food Delivery Seeder
```bash
cd backend/src/scripts
node seedFoodDelivery.js
```

This will populate your database with:
- 6 food categories
- 6 restaurants
- 18+ menu items
- Sample data matching the frontend requirements

### Sample Data Structure
The seeder creates realistic data including:
- **Categories**: Khichdi, Fruits, Juice, Soups, Porridge
- **Restaurants**: Healthy Khichdi Point, Fresh & Fit Fruits, etc.
- **Menu Items**: Complete menu with pricing, descriptions, and nutritional info

## 🔐 Authentication & Security

### JWT Authentication
- Token-based authentication using JSON Web Tokens
- Automatic token refresh
- Secure token storage

### Input Validation
- Comprehensive input sanitization
- SQL injection prevention
- XSS protection

### Rate Limiting
- API rate limiting for public endpoints
- User-specific rate limiting for authenticated endpoints

## 📊 Admin Dashboard Features

### Real-time Statistics
- Total orders and revenue
- Daily/monthly trends
- Restaurant performance metrics

### Order Management
- View all orders
- Update order status
- Track delivery progress
- Handle cancellations

### Analytics & Reports
- Popular menu items
- Revenue analytics
- Customer behavior insights
- Restaurant performance reports

## 🚀 Performance Optimizations

### Database Optimization
- Efficient indexing on frequently queried fields
- Query optimization for complex joins
- Connection pooling

### Caching Strategy
- Redis caching for frequently accessed data
- Database query result caching
- Static asset caching

### API Optimization
- Pagination for large datasets
- Lazy loading for related data
- Response compression

## 🧪 Testing

### API Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:food-delivery
npm run test:auth
npm run test:orders
```

### Test Coverage
- Unit tests for all controllers
- Integration tests for API endpoints
- Database operation tests
- Authentication flow tests

## 📱 Frontend Integration

### API Service
The frontend includes a comprehensive API service (`frontend/src/api/foodDeliveryApi.js`) that provides:

- **Public APIs**: Categories, restaurants, menu items
- **Protected APIs**: Cart, orders, user management
- **Enhanced APIs**: Data synchronization
- **Admin APIs**: Dashboard and analytics
- **Utility Functions**: Price calculation, validation

### Key Features
- Automatic authentication token handling
- Error handling and retry logic
- Request/response interceptors
- Type-safe API calls

## 🔄 Data Flow

### Order Processing Flow
```
1. User adds items to cart
2. Cart validation and total calculation
3. Order creation with delivery details
4. Payment processing
5. Order confirmation
6. Restaurant notification
7. Order preparation and delivery
8. Order completion and feedback
```

### Cart Management Flow
```
1. User browses menu items
2. Add items to cart with quantity
3. Cart persistence in database
4. Real-time cart updates
5. Checkout process
6. Cart clearing after order
```

## 🚨 Error Handling

### Standardized Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info (development only)",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication needed
- `INVALID_INPUT`: Invalid request data
- `NOT_FOUND`: Resource not found
- `PERMISSION_DENIED`: Insufficient permissions
- `VALIDATION_ERROR`: Data validation failed

## 📈 Monitoring & Logging

### Application Logging
- Request/response logging
- Error tracking and reporting
- Performance monitoring
- Database query logging

### Health Checks
```
GET /api/health
GET /api/pool-status
```

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Rate limiting enabled
- [ ] Monitoring configured
- [ ] Backup strategy implemented

### Docker Support
```bash
# Build and run with Docker
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration Options

### Database Configuration
- Connection pooling settings
- Query timeout configuration
- Retry logic settings

### API Configuration
- Rate limiting thresholds
- CORS settings
- Request size limits
- Timeout configurations

## 📚 API Documentation

### Request/Response Examples

#### Get Restaurants
```bash
GET /api/food-delivery/restaurants?category=khichdi&minRating=4.5
```

Response:
```json
{
  "success": true,
  "message": "Restaurants retrieved successfully",
  "restaurants": [...],
  "count": 2
}
```

#### Add to Cart
```bash
POST /api/food-delivery/cart/add
{
  "menuItemId": 101,
  "restaurantId": 1,
  "quantity": 2,
  "specialInstructions": "Less spicy please"
}
```

#### Create Order
```bash
POST /api/food-delivery/orders
{
  "deliveryAddress": {
    "fullName": "John Doe",
    "phone": "+919876543210",
    "address": "123 Main St",
    "city": "Mumbai",
    "pincode": ":400001"
  },
  "paymentMethod": "card",
  "deliveryInstructions": "Ring doorbell twice"
}
```

## 🤝 Contributing

### Development Guidelines
1. Follow the existing code style
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Use conventional commit messages

### Code Review Process
1. Create feature branch
2. Implement changes with tests
3. Submit pull request
4. Code review and approval
5. Merge to main branch

## 📞 Support & Maintenance

### Common Issues
- **Database Connection**: Check credentials and network
- **Authentication**: Verify JWT token validity
- **Performance**: Monitor database queries and indexes

### Maintenance Tasks
- Regular database backups
- Log rotation and cleanup
- Performance monitoring
- Security updates

## 🎯 Future Enhancements

### Planned Features
- Real-time order tracking
- Push notifications
- Advanced analytics dashboard
- Multi-language support
- Payment gateway integration
- Delivery partner management

### Scalability Improvements
- Microservices architecture
- Load balancing
- Database sharding
- CDN integration

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Backend Development**: [Your Name]
- **Database Design**: [Your Name]
- **API Architecture**: [Your Name]
- **Documentation**: [Your Name]

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
