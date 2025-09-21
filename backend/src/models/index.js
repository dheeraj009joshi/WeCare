// Global models registry
let models = null;

// Function that controllers can use to get models (deferred access)
const getModelsDeferred = () => {
  if (!models) {
    throw new Error('Models not initialized. Call initializeModels() first.');
  }
  return models;
};

// Model initialization function - call this after database connection
const initializeModels = (sequelize) => {
  // Import all model classes
  const User = require('./User');
  const Doctor = require('./Doctor');
  const ChatSession = require('./ChatSession');
  const Message = require('./Message');
  const Escalation = require('./Escalation');
  const FileUpload = require('./FileUpload');
  const Appointment = require('./Appointment');
  const DoctorAvailability = require('./DoctorAvailability');
  const DoctorMessage = require('./DoctorMessage');
  const Ambulance = require('./Ambulance');
  const Product = require('./Product');
  const Cart = require('./Cart');
  const Order = require('./Order');
  const OrderItem = require('./OrderItem');
  const Address = require('./Address');
  const Newsletter = require('./Newsletter');
  const Contact = require('./Contact');
  const FooterContent = require('./FooterContent');
  const Service = require('./Service');
  const FoodCategory = require('./FoodCategory');
  const Restaurant = require('./Restaurant');
  const MenuItem = require('./MenuItem');
  const FoodCart = require('./FoodCart');
  const FoodOrder = require('./FoodOrder');
  const FoodOrderItem = require('./FoodOrderItem');

  // Initialize all models with sequelize instance
  const initializedModels = {
    User: User.initModel(sequelize),
    Doctor: Doctor.initModel(sequelize),
    ChatSession: ChatSession.initModel(sequelize),
    Message: Message.initModel(sequelize),
    Escalation: Escalation.initModel(sequelize),
    FileUpload: FileUpload.initModel(sequelize),
    Appointment: Appointment.initModel(sequelize),
    DoctorAvailability: DoctorAvailability.initModel(sequelize),
    DoctorMessage: DoctorMessage.initModel(sequelize),
    Ambulance: Ambulance.initModel(sequelize),
    Product: Product.initModel(sequelize),
    Cart: Cart.initModel(sequelize),
    Order: Order.initModel(sequelize),
    OrderItem: OrderItem.initModel(sequelize),
    Address: Address.initModel(sequelize),
    Newsletter: Newsletter.initModel(sequelize),
    Contact: Contact.initModel(sequelize),
    FooterContent: FooterContent.initModel(sequelize),
    Service: Service.initModel(sequelize),
    FoodCategory: FoodCategory.initModel(sequelize),
    Restaurant: Restaurant.initModel(sequelize),
    MenuItem: MenuItem.initModel(sequelize),
    FoodCart: FoodCart.initModel(sequelize),
    FoodOrder: FoodOrder.initModel(sequelize),
    FoodOrderItem: FoodOrderItem.initModel(sequelize)
    
  };

  // Setup associations after all models are initialized
  Object.values(initializedModels).forEach((model) => {
    if (model.associate) {
      model.associate(initializedModels);
    }
  });

  // Define associations manually for models that don't have associate methods
  const { User: UserModel, Doctor: DoctorModel, ChatSession: ChatSessionModel, Message: MessageModel, 
          Escalation: EscalationModel, FileUpload: FileUploadModel, Appointment: AppointmentModel, 
          DoctorAvailability: DoctorAvailabilityModel, DoctorMessage: DoctorMessageModel, 
          Product: ProductModel, Cart: CartModel, Order: OrderModel, OrderItem: OrderItemModel, 
          Address: AddressModel, Contact: ContactModel } = initializedModels;

  // User associations
  UserModel.hasMany(ChatSessionModel, { foreignKey: 'userId' });
  UserModel.hasMany(EscalationModel, { foreignKey: 'userId' });
  UserModel.hasMany(FileUploadModel, { foreignKey: 'userId' });
  UserModel.hasMany(AppointmentModel, { foreignKey: 'patientId', as: 'appointments' });
  UserModel.hasMany(CartModel, { foreignKey: 'userId', as: 'cartItems' });
  UserModel.hasMany(OrderModel, { foreignKey: 'userId', as: 'orders' });
  UserModel.hasMany(AddressModel, { foreignKey: 'userId', as: 'addresses' });

  // Doctor associations
  DoctorModel.hasMany(AppointmentModel, { foreignKey: 'doctorId', as: 'appointments' });
  DoctorModel.hasMany(DoctorAvailabilityModel, { foreignKey: 'doctorId', as: 'availability' });
  DoctorModel.hasMany(DoctorMessageModel, { foreignKey: 'doctorId', as: 'messages' });

  // ChatSession associations
  ChatSessionModel.belongsTo(UserModel, { foreignKey: 'userId' });
  ChatSessionModel.hasMany(MessageModel, { foreignKey: 'sessionId' });
  ChatSessionModel.hasMany(EscalationModel, { foreignKey: 'sessionId' });

  // Message associations
  MessageModel.belongsTo(ChatSessionModel, { foreignKey: 'sessionId' });

  // Escalation associations
  EscalationModel.belongsTo(UserModel, { foreignKey: 'userId' });
  EscalationModel.belongsTo(ChatSessionModel, { foreignKey: 'sessionId' });

  // FileUpload associations
  FileUploadModel.belongsTo(UserModel, { foreignKey: 'userId' });

  // Appointment associations
  AppointmentModel.belongsTo(DoctorModel, { foreignKey: 'doctorId', as: 'doctor' });
  AppointmentModel.belongsTo(UserModel, { foreignKey: 'patientId', as: 'patient' });

  // DoctorAvailability associations
  DoctorAvailabilityModel.belongsTo(DoctorModel, { foreignKey: 'doctorId' });

  // DoctorMessage associations
  DoctorMessageModel.belongsTo(DoctorModel, { foreignKey: 'doctorId', as: 'messageDoctor' });
  DoctorMessageModel.belongsTo(UserModel, { foreignKey: 'patientId', as: 'messagePatient' });

  // Medicine Store associations
  ProductModel.hasMany(CartModel, { foreignKey: 'productId', as: 'cartItems' });
  ProductModel.hasMany(OrderItemModel, { foreignKey: 'productId', as: 'orderItems' });

  CartModel.belongsTo(UserModel, { foreignKey: 'userId' });
  CartModel.belongsTo(ProductModel, { foreignKey: 'productId', as: 'product' });

  OrderModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });
  OrderModel.hasMany(OrderItemModel, { foreignKey: 'orderId', as: 'orderItems' });

  OrderItemModel.belongsTo(OrderModel, { foreignKey: 'orderId' });
  OrderItemModel.belongsTo(ProductModel, { foreignKey: 'productId', as: 'product' });

  AddressModel.belongsTo(UserModel, { foreignKey: 'userId' });

  // Footer associations
  ContactModel.belongsTo(DoctorModel, { foreignKey: 'assignedTo', as: 'assignedDoctor' });

  // Food Delivery associations
  const { FoodCategory: FoodCategoryModel, Restaurant: RestaurantModel, MenuItem: MenuItemModel, 
          FoodCart: FoodCartModel, FoodOrder: FoodOrderModel, FoodOrderItem: FoodOrderItemModel } = initializedModels;

  // Food Category associations
  FoodCategoryModel.hasMany(RestaurantModel, { foreignKey: 'category', sourceKey: 'identifier' });

  // Restaurant associations
  RestaurantModel.belongsTo(FoodCategoryModel, { foreignKey: 'category', targetKey: 'identifier' });
  RestaurantModel.hasMany(MenuItemModel, { foreignKey: 'restaurantId', as: 'menuItems' });
  RestaurantModel.hasMany(FoodCartModel, { foreignKey: 'restaurantId', as: 'cartItems' });
  RestaurantModel.hasMany(FoodOrderItemModel, { foreignKey: 'restaurantId', as: 'orderItems' });

  // Menu Item associations
  MenuItemModel.belongsTo(RestaurantModel, { foreignKey: 'restaurantId', as: 'restaurant' });
  MenuItemModel.hasMany(FoodCartModel, { foreignKey: 'menuItemId', as: 'cartItems' });
  MenuItemModel.hasMany(FoodOrderItemModel, { foreignKey: 'menuItemId', as: 'orderItems' });

  // Food Cart associations
  FoodCartModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });
  FoodCartModel.belongsTo(MenuItemModel, { foreignKey: 'menuItemId', as: 'menuItem' });
  FoodCartModel.belongsTo(RestaurantModel, { foreignKey: 'restaurantId', as: 'restaurant' });

  // Food Order associations
  FoodOrderModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });
  FoodOrderModel.hasMany(FoodOrderItemModel, { foreignKey: 'orderId', as: 'orderItems' });

  // Food Order Item associations
  FoodOrderItemModel.belongsTo(FoodOrderModel, { foreignKey: 'orderId', as: 'order' });
  FoodOrderItemModel.belongsTo(MenuItemModel, { foreignKey: 'menuItemId', as: 'menuItem' });
  FoodOrderItemModel.belongsTo(RestaurantModel, { foreignKey: 'restaurantId', as: 'restaurant' });

  // User associations for food delivery
  UserModel.hasMany(FoodCartModel, { foreignKey: 'userId', as: 'foodCartItems' });
  UserModel.hasMany(FoodOrderModel, { foreignKey: 'userId', as: 'foodOrders' });

  // Store models in global registry
  models = initializedModels;

  return models;
};

// Get models from registry (for controllers to use)
const getModels = () => {
  if (!models) {
    throw new Error('Models not initialized. Call initializeModels() first.');
  }
  return models;
};

// Backward compatibility - export individual models with checks
const getModel = (modelName) => {
  if (!models) {
    throw new Error(`Model ${modelName} not initialized. Call initializeModels() first.`);
  }
  return models[modelName];
};

// Export individual models for backward compatibility
module.exports = {
  initializeModels,
  getModels,
  getModelsDeferred,
  // Individual model exports
  get User() { return getModel('User'); },
  get Doctor() { return getModel('Doctor'); },
  get ChatSession() { return getModel('ChatSession'); },
  get Message() { return getModel('Message'); },
  get Escalation() { return getModel('Escalation'); },
  get FileUpload() { return getModel('FileUpload'); },
  get Appointment() { return getModel('Appointment'); },
  get DoctorAvailability() { return getModel('DoctorAvailability'); },
  get DoctorMessage() { return getModel('DoctorMessage'); },
  get Ambulance() { return getModel('Ambulance'); },
  get Product() { return getModel('Product'); },
  get Cart() { return getModel('Cart'); },
  get Order() { return getModel('Order'); },
  get OrderItem() { return getModel('OrderItem'); },
  get Address() { return getModel('Address'); },
  get Newsletter() { return getModel('Newsletter'); },
  get Contact() { return getModel('Contact'); },
  get FooterContent() { return getModel('FooterContent'); },
  get Service() { return getModel('Service'); },
  get FoodCategory() { return getModel('FoodCategory'); },
  get Restaurant() { return getModel('Restaurant'); },
  get MenuItem() { return getModel('MenuItem'); },
  get FoodCart() { return getModel('FoodCart'); },
  get FoodOrder() { return getModel('FoodOrder'); },
  get FoodOrderItem() { return getModel('FoodOrderItem'); }
}; 