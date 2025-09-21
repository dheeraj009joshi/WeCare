const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
const { initializeModels } = require('./models');

const app = express();

console.log('🚀 Starting WeCure server...');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('✅ Middleware loaded');

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Import routes - Load only essential routes to isolate the issue
// const authRoutes = require('./routes/auth');
// const servicesRoutes = require('./routes/services');
// const bookingRoutes = require('./routes/booking');
// const adminRoutes = require('./routes/admin');
const medicineStoreRoutes = require('./routes/medicineStore');
// const foodDeliveryRoutes = require('./routes/foodDelivery');
// const foodDeliveryCompleteRoutes = require('./routes/foodDeliveryComplete');
// const foodDeliveryEnhancedRoutes = require('./routes/foodDeliveryEnhanced');
// const foodDeliverySeederRoutes = require('./routes/foodDeliverySeeder');
// const foodDeliveryAdminRoutes = require('./routes/foodDeliveryAdmin');
// const doctorAuthRoutes = require('./routes/doctorAuth');
// const doctorDashboardRoutes = require('./routes/doctorDashboard');
// const aboutDoctorRoutes = require('./routes/aboutDoctor');
// const chatRoutes = require('./routes/chat');
// const footerRoutes = require('./routes/footer');

console.log('✅ Routes imported');

// Use routes - Only medicine store for now
// app.use('/api/auth', authRoutes);
// app.use('/api/services', servicesRoutes);
// app.use('/api/booking', bookingRoutes);
// app.use('/api/admin', adminRoutes);
app.use('/api/medicine-store', medicineStoreRoutes);
// app.use('/api/food-delivery', foodDeliveryRoutes);
// app.use('/api/food-delivery-complete', foodDeliveryCompleteRoutes);
// app.use('/api/food-delivery-enhanced', foodDeliveryEnhancedRoutes);
// app.use('/api/food-delivery-seeder', foodDeliverySeederRoutes);
// app.use('/api/food-delivery-admin', foodDeliveryAdminRoutes);
// app.use('/api/doctor-auth', doctorAuthRoutes);
// app.use('/api/doctor-dashboard', doctorDashboardRoutes);
// app.use('/api/about-doctor', aboutDoctorRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/footer', footerRoutes);

console.log('✅ Routes configured');

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'WeCure Backend API is running!',
    timestamp: new Date().toISOString(),
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'WeCure Backend API is running!',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Connect to database and initialize models
connectDB().then(async () => {
  console.log('✅ Database connected');
  
  // Initialize models after database connection
  await initializeModels(sequelize);
  console.log('✅ Models initialized');
  
  // Temporarily disable seeding to isolate issue
  // const { seedProducts } = require('./seeders/productSeeder');
  // await seedProducts();
  console.log('✅ Seeding skipped for testing');
  
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
});