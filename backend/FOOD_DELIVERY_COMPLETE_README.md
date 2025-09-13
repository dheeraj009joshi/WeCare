# 🍽️ WeCure Food Delivery Backend - Complete Implementation

A comprehensive food delivery backend system built with Node.js, Express, and PostgreSQL, designed to work seamlessly with the WeCure frontend.

## 🚀 Features

### Core Functionality
- **Restaurant Management**: Complete CRUD operations for restaurants
- **Menu Management**: Full menu item management with categories and filters
- **Cart System**: Persistent shopping cart with real-time updates
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Support for multiple payment methods (COD, Card, UPI)
- **User Authentication**: Secure user authentication and authorization
- **Admin Dashboard**: Comprehensive admin panel for managing the system

### Advanced Features
- **Search & Filtering**: Advanced search across restaurants and menu items
- **Data Seeding**: Automated data seeding for development and testing
- **Real-time Updates**: Order status tracking and notifications
- **Analytics**: Dashboard with sales analytics and insights
- **Multi-category Support**: Support for different food categories
- **Inventory Management**: Menu item availability and stock tracking

## 📁 Project Structure

```
backend/src/
├── controllers/
│   ├── foodDeliveryCompleteController.js    # Main food delivery controller
│   ├── foodDeliverySeederController.js      # Data seeding controller
│   └── foodDeliveryController.js            # Original controller (legacy)
├── models/
│   ├── FoodCategory.js                      # Food category model
│   ├── Restaurant.js                        # Restaurant model
│   ├── MenuItem.js                          # Menu item model
│   ├── FoodCart.js                          # Shopping cart model
│   ├── FoodOrder.js                         # Order model
│   ├── FoodOrderItem.js                     # Order item model
│   └── index.js                             # Model associations
├── routes/
│   ├── foodDeliveryComplete.js              # Complete API routes
│   ├── foodDeliverySeeder.js                # Data seeding routes
│   └── foodDelivery.js                      # Original routes (legacy)
└── middleware/
    ├── auth.js                              # User authentication
    └── adminAuth.js                         # Admin authentication
```

## 🗄️ Database Schema

### Food Categories
- `id`: Primary key
- `name`: Category name
- `identifier`: Unique identifier (e.g., 'khichdi', 'fruits')
- `description`: Category description
- `image`: Category image URL
- `isActive`: Active status

### Restaurants
- `id`: Primary key
- `name`: Restaurant name
- `category`: Food category identifier
- `cuisine`: Cuisine type
- `rating`: Average rating (0-5)
- `deliveryTime`: Estimated delivery time
- `priceRange`: Price range string
- `image`: Restaurant image URL
- `description`: Restaurant description
- `address`: Restaurant address
- `phone`: Contact phone
- `openingTime`: Opening time
- `closingTime`: Closing time
- `isActive`: Active status
- `isOpen`: Current open status

### Menu Items
- `id`: Primary key
- `name`: Item name
- `description`: Item description
- `price`: Item price
- `restaurantId`: Foreign key to restaurants
- `category`: Item category
- `image`: Item image URL
- `isVegetarian`: Vegetarian flag
- `isVegan`: Vegan flag
- `isGlutenFree`: Gluten-free flag
- `calories`: Calorie count
- `ingredients`: JSON array of ingredients
- `allergens`: JSON array of allergens
- `preparationTime`: Preparation time in minutes
- `isAvailable`: Availability status
- `isPopular`: Popular item flag

### Food Cart
- `id`: Primary key
- `userId`: Foreign key to users
- `menuItemId`: Foreign key to menu items
- `restaurantId`: Foreign key to restaurants
- `quantity`: Item quantity
- `specialInstructions`: Special instructions
- `sessionId`: Session ID for guest users

### Food Orders
- `id`: Primary key
- `orderNumber`: Unique order number
- `userId`: Foreign key to users
- `status`: Order status
- `subtotal`: Subtotal amount
- `deliveryFee`: Delivery fee
- `taxes`: Tax amount
- `total`: Total amount
- `paymentMethod`: Payment method
- `paymentStatus`: Payment status
- `deliveryAddress`: JSON delivery address
- `estimatedDeliveryTime`: Estimated delivery time
- `actualDeliveryTime`: Actual delivery time
- `deliveryInstructions`: Delivery instructions
- `cancellationReason`: Cancellation reason
- `refundAmount`: Refund amount
- `rating`: Order rating
- `feedback`: Customer feedback

### Food Order Items
- `id`: Primary key
- `orderId`: Foreign key to orders
- `menuItemId`: Foreign key to menu items
- `restaurantId`: Foreign key to restaurants
- `quantity`: Item quantity
- `unitPrice`: Unit price at time of order
- `totalPrice`: Total price for this item
- `specialInstructions`: Special instructions
- `itemSnapshot`: JSON snapshot of item details

## 🛠️ API Endpoints

### Public Endpoints

#### Categories
- `GET /api/food-delivery-complete/categories` - Get all food categories

#### Restaurants
- `GET /api/food-delivery-complete/restaurants` - Get all restaurants with filters
- `GET /api/food-delivery-complete/restaurants/:id` - Get restaurant by ID

#### Menu Items
- `GET /api/food-delivery-complete/restaurants/:restaurantId/menu` - Get menu items for restaurant

#### Search
- `GET /api/food-delivery-complete/search` - Search restaurants and menu items

### Protected Endpoints (User Authentication Required)

#### Cart Management
- `POST /api/food-delivery-complete/cart/add` - Add item to cart
- `GET /api/food-delivery-complete/cart` - Get user's cart
- `PUT /api/food-delivery-complete/cart/:id` - Update cart item quantity
- `DELETE /api/food-delivery-complete/cart/:id` - Remove item from cart
- `DELETE /api/food-delivery-complete/cart` - Clear entire cart

#### Order Management
- `POST /api/food-delivery-complete/orders` - Create new order
- `GET /api/food-delivery-complete/orders` - Get user's orders
- `GET /api/food-delivery-complete/orders/:id` - Get order by ID
- `PUT /api/food-delivery-complete/orders/:id/cancel` - Cancel order

#### Payment Processing
- `POST /api/food-delivery-complete/payment/process` - Process payment

### Admin Endpoints (Admin Authentication Required)

#### Category Management
- `POST /api/food-delivery-complete/admin/categories` - Create category
- `PUT /api/food-delivery-complete/admin/categories/:id` - Update category

#### Restaurant Management
- `POST /api/food-delivery-complete/admin/restaurants` - Create restaurant
- `PUT /api/food-delivery-complete/admin/restaurants/:id` - Update restaurant

#### Menu Item Management
- `POST /api/food-delivery-complete/admin/menu-items` - Create menu item
- `PUT /api/food-delivery-complete/admin/menu-items/:id` - Update menu item

#### Order Management
- `PUT /api/food-delivery-complete/admin/orders/:id/status` - Update order status
- `GET /api/food-delivery-complete/admin/orders` - Get all orders

#### Dashboard
- `GET /api/food-delivery-complete/admin/dashboard/stats` - Get dashboard statistics

### Data Seeding Endpoints

#### Seeding
- `GET /api/food-delivery-seeder/status` - Get seeding status
- `POST /api/food-delivery-seeder/categories` - Seed categories
- `POST /api/food-delivery-seeder/restaurants` - Seed restaurants
- `POST /api/food-delivery-seeder/menu-items` - Seed menu items
- `POST /api/food-delivery-seeder/all` - Seed all data
- `DELETE /api/food-delivery-seeder/all` - Clear all data

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wecure/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Update the `.env` file with your database credentials and other configuration.

4. **Set up the database**
   ```bash
   # Create database
   createdb wecure_food_delivery
   
   # Run migrations (if available)
   npm run migrate
   ```

5. **Seed the database**
   ```bash
   # Start the server
   npm start
   
   # In another terminal, seed the data
   curl -X POST http://localhost:5000/api/food-delivery-seeder/all
   ```

6. **Start the server**
   ```bash
   npm start
   ```

### Testing

Run the comprehensive test suite:
```bash
node test-food-delivery-complete.js
```

## 📊 Usage Examples

### Frontend Integration

The backend is designed to work seamlessly with the existing WeCure frontend. Here are some integration examples:

#### 1. Fetching Restaurants
```javascript
// Frontend API call
const response = await fetch('http://localhost:5000/api/food-delivery-complete/restaurants');
const data = await response.json();
```

#### 2. Adding to Cart
```javascript
// Frontend API call with authentication
const response = await fetch('http://localhost:5000/api/food-delivery-complete/cart/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    menuItemId: 1,
    restaurantId: 1,
    quantity: 2,
    specialInstructions: 'Extra spicy'
  })
});
```

#### 3. Creating an Order
```javascript
// Frontend API call
const response = await fetch('http://localhost:5000/api/food-delivery-complete/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    deliveryAddress: {
      fullName: 'John Doe',
      phone: '9876543210',
      address: '123 Main Street',
      city: 'Mumbai',
      pincode: ':400001'
    },
    paymentMethod: 'cod',
    deliveryInstructions: 'Ring the doorbell twice'
  })
});
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wecure_food_delivery
DB_USER=your_username
DB_PASSWORD=your_password

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Database Configuration

The system uses Sequelize ORM with PostgreSQL. All models are automatically synchronized and associations are properly configured.

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive input validation and sanitization
- **SQL Injection Protection**: Parameterized queries through Sequelize
- **CORS Configuration**: Proper CORS setup for frontend integration
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Admin Authorization**: Separate admin authentication and authorization

## 📈 Performance Optimizations

- **Database Indexing**: Optimized database indexes for fast queries
- **Pagination**: Built-in pagination for large datasets
- **Caching**: Redis caching for frequently accessed data
- **Query Optimization**: Optimized database queries with proper joins
- **Connection Pooling**: Database connection pooling for better performance

## 🧪 Testing

The system includes comprehensive testing:

- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: Complete workflow testing
- **Performance Tests**: Load and stress testing

Run tests:
```bash
# Run all tests
npm test

# Run specific test suite
npm run test:food-delivery

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t wecure-food-delivery .

# Run container
docker run -p 5000:5000 wecure-food-delivery
```

### Production Deployment

1. **Set up production database**
2. **Configure environment variables**
3. **Run database migrations**
4. **Seed initial data**
5. **Start the application**

## 📝 API Documentation

Complete API documentation is available at:
- Swagger UI: `http://localhost:5000/api-docs`
- Postman Collection: Available in `/docs` folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete food delivery backend
- All CRUD operations
- Authentication and authorization
- Admin dashboard
- Data seeding
- Comprehensive testing

---

**🎉 Your food delivery backend is now complete and ready for production!**

