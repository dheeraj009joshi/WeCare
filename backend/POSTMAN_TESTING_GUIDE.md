# 🧪 Postman Testing Guide for WeCure Food Delivery API

This guide will help you test the complete food delivery backend using Postman.

## 📋 Prerequisites

1. **Backend Server Running**: `cd backend && npm start`
2. **Postman Installed**: Download from [postman.com](https://www.postman.com/)
3. **Database Seeded**: Run the seeder to populate test data

## 🚀 Quick Start

### Step 1: Import the Collection

1. Open Postman
2. Click **Import** button
3. Select the file: `backend/Postman_Food_Delivery_Collection.json`
4. The collection will be imported with all endpoints

### Step 2: Set Up Environment Variables

1. In Postman, go to **Environments**
2. Create a new environment called "WeCure Food Delivery"
3. Add these variables:
   - `baseUrl`: `http://localhost:5000/api/food-delivery-complete`
   - `authToken`: (leave empty, will be auto-filled)
   - `adminToken`: (leave empty, will be auto-filled)

### Step 3: Start Testing

## 🔐 Authentication Tests

### 1. Register a New User
- **Endpoint**: `POST /api/auth/register`
- **Body**:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```
- **Expected**: 201 Created with user data

### 2. Login User
- **Endpoint**: `POST /api/auth/login`
- **Body**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Expected**: 200 OK with token (auto-saved to `authToken`)

### 3. Login Admin
- **Endpoint**: `POST /api/auth/login`
- **Body**:
```json
{
  "email": "admin@wecure.com",
  "password": "admin123"
}
```
- **Expected**: 200 OK with admin token (auto-saved to `adminToken`)

## 🌐 Public API Tests

### 1. Get Categories
- **Endpoint**: `GET {{baseUrl}}/categories`
- **Expected**: List of food categories

### 2. Get Restaurants
- **Endpoint**: `GET {{baseUrl}}/restaurants`
- **Expected**: List of restaurants

### 3. Get Restaurants with Filters
- **Endpoint**: `GET {{baseUrl}}/restaurants?category=khichdi&minRating=4.0`
- **Expected**: Filtered restaurants

### 4. Get Restaurant by ID
- **Endpoint**: `GET {{baseUrl}}/restaurants/1`
- **Expected**: Single restaurant with menu items

### 5. Get Menu Items
- **Endpoint**: `GET {{baseUrl}}/restaurants/1/menu`
- **Expected**: Menu items for restaurant

### 6. Search
- **Endpoint**: `GET {{baseUrl}}/search?q=khichdi&type=all`
- **Expected**: Search results

## 🛒 Cart Operations (Protected)

### 1. Get Cart
- **Endpoint**: `GET {{baseUrl}}/cart`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: User's cart items

### 2. Add to Cart
- **Endpoint**: `POST {{baseUrl}}/cart/add`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Body**:
```json
{
  "menuItemId": 1,
  "restaurantId": 1,
  "quantity": 2,
  "specialInstructions": "Extra spicy please"
}
```
- **Expected**: Item added to cart

### 3. Update Cart Item
- **Endpoint**: `PUT {{baseUrl}}/cart/1`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Body**:
```json
{
  "quantity": 3
}
```
- **Expected**: Cart item updated

### 4. Remove from Cart
- **Endpoint**: `DELETE {{baseUrl}}/cart/1`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: Item removed from cart

## 📦 Order Operations (Protected)

### 1. Create Order
- **Endpoint**: `POST {{baseUrl}}/orders`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Body**:
```json
{
  "deliveryAddress": {
    "fullName": "John Doe",
    "phone": "9876543210",
    "address": "123 Main Street, Mumbai",
    "city": "Mumbai",
    "pincode": ":400001"
  },
  "paymentMethod": "cod",
  "deliveryInstructions": "Ring the doorbell twice"
}
```
- **Expected**: Order created successfully

### 2. Get User Orders
- **Endpoint**: `GET {{baseUrl}}/orders`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: List of user's orders

### 3. Get Order by ID
- **Endpoint**: `GET {{baseUrl}}/orders/1`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Expected**: Single order details

### 4. Cancel Order
- **Endpoint**: `PUT {{baseUrl}}/orders/1/cancel`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Body**:
```json
{
  "reason": "Changed my mind"
}
```
- **Expected**: Order cancelled

## 💳 Payment Operations (Protected)

### 1. Process Payment
- **Endpoint**: `POST {{baseUrl}}/payment/process`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Body**:
```json
{
  "orderId": 1,
  "paymentMethod": "card",
  "amount": 150.00,
  "paymentDetails": {
    "cardNumber": "4111111111111111",
    "expiryDate": "12/25",
    "cvv": "123"
  }
}
```
- **Expected**: Payment processed

## 👨‍💼 Admin Operations

### 1. Get Dashboard Stats
- **Endpoint**: `GET {{baseUrl}}/admin/dashboard/stats`
- **Headers**: `Authorization: Bearer {{adminToken}}`
- **Expected**: Dashboard statistics

### 2. Get All Orders
- **Endpoint**: `GET {{baseUrl}}/admin/orders`
- **Headers**: `Authorization: Bearer {{adminToken}}`
- **Expected**: All orders in system

### 3. Update Order Status
- **Endpoint**: `PUT {{baseUrl}}/admin/orders/1/status`
- **Headers**: `Authorization: Bearer {{adminToken}}`
- **Body**:
```json
{
  "status": "preparing",
  "estimatedDeliveryTime": "2024-01-15T14:30:00Z"
}
```
- **Expected**: Order status updated

### 4. Create Category
- **Endpoint**: `POST {{baseUrl}}/admin/categories`
- **Headers**: `Authorization: Bearer {{adminToken}}`
- **Body**:
```json
{
  "name": "Healthy Snacks",
  "identifier": "healthy-snacks",
  "description": "Nutritious and healthy snack options",
  "image": "https://example.com/snacks.jpg"
}
```
- **Expected**: Category created

### 5. Create Restaurant
- **Endpoint**: `POST {{baseUrl}}/admin/restaurants`
- **Headers**: `Authorization: Bearer {{adminToken}}`
- **Body**:
```json
{
  "name": "Test Restaurant",
  "category": "khichdi",
  "cuisine": "Indian",
  "rating": 4.5,
  "deliveryTime": "25 mins",
  "priceRange": "₹100-₹200",
  "image": "https://example.com/restaurant.jpg",
  "description": "Test restaurant for API testing",
  "address": "123 Test Street, Mumbai",
  "phone": "9876543210"
}
```
- **Expected**: Restaurant created

### 6. Create Menu Item
- **Endpoint**: `POST {{baseUrl}}/admin/menu-items`
- **Headers**: `Authorization: Bearer {{adminToken}}`
- **Body**:
```json
{
  "name": "Test Khichdi",
  "description": "Test khichdi for API testing",
  "price": 120.00,
  "restaurantId": 1,
  "category": "main",
  "isVegetarian": true,
  "isVegan": false,
  "calories": 300
}
```
- **Expected**: Menu item created

## 🌱 Data Seeding

### 1. Check Seeding Status
- **Endpoint**: `GET http://localhost:5000/api/food-delivery-seeder/status`
- **Expected**: Current data status

### 2. Seed All Data
- **Endpoint**: `POST http://localhost:5000/api/food-delivery-seeder/all`
- **Headers**: `Authorization: Bearer {{adminToken}}`
- **Expected**: All data seeded

### 3. Clear All Data
- **Endpoint**: `DELETE http://localhost:5000/api/food-delivery-seeder/all`
- **Headers**: `Authorization: Bearer {{adminToken}}`
- **Expected**: All data cleared

## 🧪 Testing Workflow

### Complete User Journey Test:

1. **Setup**:
   - Register/Login user
   - Seed data (if not already done)

2. **Browse**:
   - Get categories
   - Get restaurants
   - Get menu items for a restaurant

3. **Cart Operations**:
   - Add items to cart
   - Update quantities
   - View cart

4. **Order Placement**:
   - Create order
   - Process payment
   - View order details

5. **Admin Operations**:
   - Login as admin
   - View dashboard stats
   - Update order status
   - Create new content

## 📊 Expected Response Formats

### Success Response:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🔍 Common Issues & Solutions

### 1. Authentication Errors
- **Issue**: 401 Unauthorized
- **Solution**: Make sure to login first and use the correct token

### 2. Data Not Found
- **Issue**: 404 Not Found
- **Solution**: Seed the database first using the seeder endpoints

### 3. Validation Errors
- **Issue**: 400 Bad Request
- **Solution**: Check the request body format and required fields

### 4. Server Not Running
- **Issue**: Connection refused
- **Solution**: Start the backend server with `npm start`

## 📈 Performance Testing

### Load Testing with Postman:
1. Create a collection runner
2. Set iterations to 100
3. Run the collection
4. Check response times and success rates

### Stress Testing:
1. Use Postman's built-in testing
2. Test concurrent requests
3. Monitor server performance

## 🎯 Success Criteria

✅ **All endpoints return 200/201 status codes**
✅ **Authentication works correctly**
✅ **Data is saved to database**
✅ **Cart operations work seamlessly**
✅ **Order creation and management works**
✅ **Admin operations function properly**
✅ **Error handling is appropriate**

## 📝 Notes

- Always test in the correct order (auth → public → protected → admin)
- Use the environment variables for easy switching between environments
- Check the console logs for detailed error information
- The collection includes automatic token saving for authenticated requests

---

**🎉 Happy Testing! Your food delivery API is ready for production!**
