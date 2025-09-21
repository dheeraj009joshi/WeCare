// We'll get models after initialization
let FoodCategory, Restaurant, MenuItem, User;
const { connectDB, sequelize } = require('../config/db');

// Sample data matching the frontend
const categories = [
  {
    name: "All",
    identifier: "all",
    image: "https://cdn-icons-png.flaticon.com/512/8786/8786966.png",
    description: "All food categories"
  },
  {
    name: "Khichdi",
    identifier: "khichdi",
    image: "https://www.maggi.in/sites/default/files/styles/home_stage_1500_700/public/srh_recipes/e193a27c4e173335ec4162436a0eb78d.jpg?h=51a72048&itok=zeMAnCZu",
    description: "Healthy khichdi varieties"
  },
  {
    name: "Fresh Fruits",
    identifier: "fruits",
    image: "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg",
    description: "Fresh seasonal fruits"
  },
  {
    name: "Fruit Juice",
    identifier: "juice",
    image: "https://www.news-medical.net/image-handler/ts/20180426060615/ri/673/picture/2018/4/shutterstock_1By_stockcreations.jpg",
    description: "Fresh fruit juices and smoothies"
  },
  {
    name: "Soups",
    identifier: "soups",
    image: "https://www.onceuponachef.com/images/2023/07/chilled-tomato-basil-soup-11-1120x923.jpg",
    description: "Healthy vegetable and chicken soups"
  },
  {
    name: "Porridge",
    identifier: "porridge",
    image: "https://www.allrecipes.com/thmb/FvfPW4w10vNq4IeYZIeYBgZoeVc=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/73155porridgeKim4x3-837aa32ee7ca433cbb69c94ffa4c1617.jpg",
    description: "Nutritious porridge varieties"
  }
];

const restaurants = [
  {
    id: 1,
    name: "Healthy Khichdi Point",
    category: "khichdi",
    cuisine: "Moong Dal Khichdi, Veg Khichdi",
    rating: 4.9,
    deliveryTime: "20 mins",
    priceRange: "₹120-₹200",
    image: "https://www.maggi.in/sites/default/files/styles/home_stage_1500_700/public/srh_recipes/e193a27c4e173335ec4162436a0eb78d.jpg?h=51a72048&itok=zeMAnCZu",
    description: "Specialized in healthy khichdi varieties",
    address: "123 Health Street, Mumbai",
    phone: "+91-98765-43210",
    isActive: true,
    isOpen: true,
    openingTime: "08:00:00",
    closingTime: "22:00:00"
  },
  {
    id: 2,
    name: "Fresh & Fit Fruits",
    category: "fruits",
    cuisine: "Seasonal Fruits, Fruit Bowls",
    rating: 4.7,
    deliveryTime: "15 mins",
    priceRange: "₹80-₹150",
    image: "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg",
    description: "Fresh and healthy fruit selections",
    address: "456 Fruit Avenue, Mumbai",
    phone: "+91-98765-43211",
    isActive: true,
    isOpen: true,
    openingTime: "07:00:00",
    closingTime: "21:00:00"
  },
  {
    id: 3,
    name: "Juice & Soup Corner",
    category: "juice",
    cuisine: "Fresh Juices, Veg/Chicken Soup",
    rating: 4.8,
    deliveryTime: "18 mins",
    priceRange: "₹60-₹120",
    image: "https://www.onceuponachef.com/images/2023/07/chilled-tomato-basil-soup-11-1120x923.jpg",
    description: "Fresh juices and healthy soups",
    address: "789 Juice Lane, Mumbai",
    phone: "+91-98765-43212",
    isActive: true,
    isOpen: true,
    openingTime: "08:00:00",
    closingTime: "23:00:00"
  },
  {
    id: 4,
    name: "Sandwich Corner",
    category: "sandwich",
    cuisine: "Sandwiches, Veg Sandwiches",
    rating: 4.8,
    deliveryTime: "18 mins",
    priceRange: "₹90-₹160",
    image: "https://images.arla.com/recordid/15F33607-F6D9-4952-B6AA210D3033BF14/club-sandwich1.jpg?format=webp&width=1269&height=715&mode=crop",
    description: "Fresh and healthy sandwiches",
    address: "321 Sandwich Road, Mumbai",
    phone: "+91-98765-43213",
    isActive: true,
    isOpen: true,
    openingTime: "09:00:00",
    closingTime: "22:00:00"
  },
  {
    id: 5,
    name: "Porridge Palace",
    category: "porridge",
    cuisine: "Oats Porridge, Multigrain Porridge",
    rating: 4.6,
    deliveryTime: "25 mins",
    priceRange: "₹100-₹180",
    image: "https://www.allrecipes.com/thmb/FvfPW4w10vNq4IeYZIeYBgZoeVc=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/73155porridgeKim4x3-837aa32ee7ca433cbb69c94ffa4c1617.jpg",
    description: "Healthy porridge and breakfast options",
    address: "654 Porridge Street, Mumbai",
    phone: "+91-98765-43214",
    isActive: true,
    isOpen: true,
    openingTime: "06:00:00",
    closingTime: "20:00:00"
  },
  {
    id: 6,
    name: "Healthy Bites",
    category: "khichdi",
    cuisine: "Special Khichdi, Dal Khichdi",
    rating: 4.5,
    deliveryTime: "30 mins",
    priceRange: "₹150-₹250",
    image: "https://images.getrecipekit.com/20250101065912-feature.jpg?class=16x9",
    description: "Premium khichdi and healthy meals",
    address: "987 Health Boulevard, Mumbai",
    phone: "+91-98765-43215",
    isActive: true,
    isOpen: true,
    openingTime: "08:00:00",
    closingTime: "21:00:00"
  }
];

const menuItems = {
  1: [ // Healthy Khichdi Point
    {
      id: 101,
      name: "Moong Dal Khichdi",
      price: 120.00,
      description: "Healthy khichdi made with moong dal and rice",
      category: "main",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      calories: 280,
      ingredients: ["moong dal", "rice", "ghee", "spices"],
      allergens: [],
      preparationTime: 20,
      isAvailable: true,
      isPopular: true
    },
    {
      id: 102,
      name: "Vegetable Khichdi",
      price: 150.00,
      description: "Khichdi with mixed vegetables",
      category: "main",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      calories: 320,
      ingredients: ["rice", "vegetables", "ghee", "spices"],
      allergens: [],
      preparationTime: 25,
      isAvailable: true,
      isPopular: false
    },
    {
      id: 103,
      name: "Special Diet Khichdi",
      price: 180.00,
      description: "Doctor recommended khichdi",
      category: "main",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      calories: 300,
      ingredients: ["brown rice", "quinoa", "vegetables", "olive oil"],
      allergens: [],
      preparationTime: 30,
      isAvailable: true,
      isPopular: true
    }
  ],
  2: [ // Fresh & Fit Fruits
    {
      id: 201,
      name: "Seasonal Fruit Bowl",
      price: 90.00,
      description: "Fresh seasonal fruits",
      category: "dessert",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      calories: 120,
      ingredients: ["seasonal fruits", "honey", "nuts"],
      allergens: ["nuts"],
      preparationTime: 10,
      isAvailable: true,
      isPopular: true
    },
    {
      id: 202,
      name: "Mixed Fruit Salad",
      price: 110.00,
      description: "Assorted fruits with honey",
      category: "dessert",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      calories: 150,
      ingredients: ["mixed fruits", "honey", "mint"],
      allergens: [],
      preparationTime: 15,
      isAvailable: true,
      isPopular: false
    }
  ],
  3: [ // Juice & Soup Corner
    {
      id: 301,
      name: "Fresh Orange Juice",
      price: 60.00,
      description: "100% pure orange juice",
      category: "beverage",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      calories: 80,
      ingredients: ["fresh oranges"],
      allergens: [],
      preparationTime: 5,
      isAvailable: true,
      isPopular: true
    },
    {
      id: 302,
      name: "Vegetable Soup",
      price: 80.00,
      description: "Healthy vegetable soup",
      category: "soup",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      calories: 90,
      ingredients: ["vegetables", "herbs", "vegetable stock"],
      allergens: [],
      preparationTime: 20,
      isAvailable: true,
      isPopular: false
    }
  ],
  4: [ // Sandwich Corner
    {
      id: 401,
      name: "Veg Sandwich",
      price: 90.00,
      description: "Fresh vegetable sandwich",
      category: "main",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      calories: 250,
      ingredients: ["bread", "vegetables", "cheese", "mayo"],
      allergens: ["gluten", "dairy"],
      preparationTime: 15,
      isAvailable: true,
      isPopular: true
    },
    {
      id: 402,
      name: "Grilled Cheese",
      price: 120.00,
      description: "Classic grilled cheese sandwich",
      category: "main",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      calories: 320,
      ingredients: ["bread", "cheese", "butter"],
      allergens: ["gluten", "dairy"],
      preparationTime: 12,
      isAvailable: true,
      isPopular: false
    }
  ],
  5: [ // Porridge Palace
    {
      id: 501,
      name: "Oats Porridge",
      price: 100.00,
      description: "Healthy oats porridge",
      category: "breakfast",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      calories: 180,
      ingredients: ["oats", "milk", "honey", "nuts"],
      allergens: ["nuts", "dairy"],
      preparationTime: 15,
      isAvailable: true,
      isPopular: true
    },
    {
      id: 502,
      name: "Multigrain Porridge",
      price: 120.00,
      description: "Nutritious multigrain mix",
      category: "breakfast",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: false,
      calories: 220,
      ingredients: ["multigrain mix", "water", "fruits"],
      allergens: ["gluten"],
      preparationTime: 20,
      isAvailable: true,
      isPopular: false
    }
  ],
  6: [ // Healthy Bites
    {
      id: 601,
      name: "Special Khichdi",
      price: 150.00,
      description: "Signature khichdi recipe",
      category: "main",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      calories: 350,
      ingredients: ["special rice", "lentils", "herbs", "ghee"],
      allergens: [],
      preparationTime: 35,
      isAvailable: true,
      isPopular: true
    },
    {
      id: 602,
      name: "Dal Khichdi",
      price: 130.00,
      description: "Traditional dal khichdi",
      category: "main",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      calories: 310,
      ingredients: ["rice", "dal", "spices", "ghee"],
      allergens: [],
      preparationTime: 25,
      isAvailable: true,
      isPopular: false
    }
  ]
};

async function seedFoodDelivery() {
  try {
    console.log('🌱 Starting Food Delivery Seeding...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');

    // Initialize models
    const { initializeModels } = require('../models/index');
    const models = await initializeModels(sequelize);
    console.log('✅ Models initialized');
    
    // Get model references
    FoodCategory = models.FoodCategory;
    Restaurant = models.Restaurant;
    MenuItem = models.MenuItem;
    FoodCart = models.FoodCart;
    FoodOrder = models.FoodOrder;
    FoodOrderItem = models.FoodOrderItem;
    User = models.User;

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    // For PostgreSQL, we need to disable triggers temporarily
    await sequelize.query('SET session_replication_role = replica;');
    await FoodOrderItem.destroy({ where: {} });
    await FoodOrder.destroy({ where: {} });
    await FoodCart.destroy({ where: {} });
    await MenuItem.destroy({ where: {} });
    await Restaurant.destroy({ where: {} });
    await FoodCategory.destroy({ where: {} });
    await sequelize.query('SET session_replication_role = DEFAULT;');
    console.log('✅ Existing data cleared');

    // Seed categories
    console.log('📂 Seeding food categories...');
    for (const categoryData of categories) {
      await FoodCategory.create(categoryData);
    }
    console.log(`✅ ${categories.length} categories seeded`);

    // Seed restaurants
    console.log('🏪 Seeding restaurants...');
    for (const restaurantData of restaurants) {
      await Restaurant.create(restaurantData);
    }
    console.log(`✅ ${restaurants.length} restaurants seeded`);

    // Seed menu items
    console.log('🍽️ Seeding menu items...');
    let totalMenuItems = 0;
    for (const [restaurantId, items] of Object.entries(menuItems)) {
      for (const itemData of items) {
        await MenuItem.create({
          ...itemData,
          restaurantId: parseInt(restaurantId)
        });
        totalMenuItems++;
      }
    }
    console.log(`✅ ${totalMenuItems} menu items seeded`);

    console.log('🎉 Food Delivery seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Restaurants: ${restaurants.length}`);
    console.log(`   - Menu Items: ${totalMenuItems}`);

  } catch (error) {
    console.error('❌ Error seeding food delivery:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedFoodDelivery()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedFoodDelivery;
