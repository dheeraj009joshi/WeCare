const { Op } = require('sequelize');

// Lazy load models to avoid initialization issues
const getModels = () => {
  const { 
    FoodCategory, 
    Restaurant, 
    MenuItem, 
    FoodCart, 
    FoodOrder, 
    FoodOrderItem, 
    User 
  } = require('../models');
  return { FoodCategory, Restaurant, MenuItem, FoodCart, FoodOrder, FoodOrderItem, User };
};

// ==================== DATA SEEDING ====================

// Seed food categories
exports.seedCategories = async (req, res) => {
  try {
    const { FoodCategory } = getModels();

    const categories = [
      {
        name: 'Khichdi & Rice',
        identifier: 'khichdi',
        description: 'Healthy and nutritious khichdi varieties',
        image: '/images/categories/khichdi.jpg',
        isActive: true
      },
      {
        name: 'Fresh Fruits',
        identifier: 'fruits',
        description: 'Fresh and organic fruits',
        image: '/images/categories/fruits.jpg',
        isActive: true
      },
      {
        name: 'Fresh Juices',
        identifier: 'juice',
        description: 'Freshly squeezed fruit juices',
        image: '/images/categories/juice.jpg',
        isActive: true
      },
      {
        name: 'Healthy Snacks',
        identifier: 'snacks',
        description: 'Nutritious and healthy snacks',
        image: '/images/categories/snacks.jpg',
        isActive: true
      },
      {
        name: 'Soups & Broths',
        identifier: 'soups',
        description: 'Warm and comforting soups',
        image: '/images/categories/soups.jpg',
        isActive: true
      },
      {
        name: 'Salads',
        identifier: 'salads',
        description: 'Fresh and crisp salads',
        image: '/images/categories/salads.jpg',
        isActive: true
      }
    ];

    const seededCategories = [];
    for (const categoryData of categories) {
      const [category, created] = await FoodCategory.findOrCreate({
        where: { identifier: categoryData.identifier },
        defaults: categoryData
      });
      seededCategories.push(category);
    }

    res.status(200).json({
      success: true,
      message: 'Categories seeded successfully',
      count: seededCategories.length,
      categories: seededCategories
    });
  } catch (error) {
    console.error('Seed categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Seed restaurants
exports.seedRestaurants = async (req, res) => {
  try {
    const { Restaurant } = getModels();

    const restaurants = [
      {
        name: 'Healthy Khichdi Corner',
        category: 'khichdi',
        cuisine: 'Indian',
        rating: 4.5,
        deliveryTime: '25 mins',
        priceRange: '₹80-₹150',
        image: '/images/restaurants/khichdi-corner.jpg',
        description: 'Specializing in healthy and nutritious khichdi varieties',
        address: '123 Health Street, Mumbai',
        phone: '+91 98765 43210',
        openingTime: '07:00:00',
        closingTime: '22:00:00',
        isActive: true,
        isOpen: true
      },
      {
        name: 'Fresh Fruit Paradise',
        category: 'fruits',
        cuisine: 'International',
        rating: 4.8,
        deliveryTime: '20 mins',
        priceRange: '₹50-₹200',
        image: '/images/restaurants/fruit-paradise.jpg',
        description: 'Fresh and organic fruits delivered daily',
        address: '456 Green Avenue, Mumbai',
        phone: '+91 98765 43211',
        openingTime: '06:00:00',
        closingTime: '21:00:00',
        isActive: true,
        isOpen: true
      },
      {
        name: 'Juice Junction',
        category: 'juice',
        cuisine: 'International',
        rating: 4.3,
        deliveryTime: '15 mins',
        priceRange: '₹60-₹120',
        image: '/images/restaurants/juice-junction.jpg',
        description: 'Freshly squeezed fruit juices and smoothies',
        address: '789 Fresh Lane, Mumbai',
        phone: '+91 98765 43212',
        openingTime: '08:00:00',
        closingTime: '20:00:00',
        isActive: true,
        isOpen: true
      },
      {
        name: 'Nutri Snacks Hub',
        category: 'snacks',
        cuisine: 'Indian',
        rating: 4.2,
        deliveryTime: '30 mins',
        priceRange: '₹40-₹100',
        image: '/images/restaurants/nutri-snacks.jpg',
        description: 'Healthy and nutritious snack options',
        address: '321 Wellness Road, Mumbai',
        phone: '+91 98765 43213',
        openingTime: '09:00:00',
        closingTime: '22:00:00',
        isActive: true,
        isOpen: true
      },
      {
        name: 'Soup Station',
        category: 'soups',
        cuisine: 'International',
        rating: 4.6,
        deliveryTime: '20 mins',
        priceRange: '₹70-₹130',
        image: '/images/restaurants/soup-station.jpg',
        description: 'Warm and comforting soups made fresh daily',
        address: '654 Comfort Street, Mumbai',
        phone: '+91 98765 43214',
        openingTime: '10:00:00',
        closingTime: '21:00:00',
        isActive: true,
        isOpen: true
      },
      {
        name: 'Garden Fresh Salads',
        category: 'salads',
        cuisine: 'International',
        rating: 4.4,
        deliveryTime: '18 mins',
        priceRange: '₹90-₹180',
        image: '/images/restaurants/garden-fresh.jpg',
        description: 'Fresh and crisp salads with organic ingredients',
        address: '987 Garden Path, Mumbai',
        phone: '+91 98765 43215',
        openingTime: '08:00:00',
        closingTime: '20:00:00',
        isActive: true,
        isOpen: true
      }
    ];

    const seededRestaurants = [];
    for (const restaurantData of restaurants) {
      const [restaurant, created] = await Restaurant.findOrCreate({
        where: { name: restaurantData.name },
        defaults: restaurantData
      });
      seededRestaurants.push(restaurant);
    }

    res.status(200).json({
      success: true,
      message: 'Restaurants seeded successfully',
      count: seededRestaurants.length,
      restaurants: seededRestaurants
    });
  } catch (error) {
    console.error('Seed restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed restaurants',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Seed menu items
exports.seedMenuItems = async (req, res) => {
  try {
    const { Restaurant, MenuItem } = getModels();

    // Get all restaurants to assign menu items
    const restaurants = await Restaurant.findAll();

    const menuItems = [
      // Khichdi items
      {
        name: 'Moong Dal Khichdi',
        description: 'Healthy moong dal khichdi with ghee and spices',
        price: 120.00,
        category: 'main',
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: true,
        calories: 350,
        ingredients: ['Moong dal', 'Rice', 'Ghee', 'Cumin', 'Turmeric'],
        allergens: [],
        preparationTime: 25,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Vegetable Khichdi',
        description: 'Mixed vegetable khichdi with fresh vegetables',
        price: 140.00,
        category: 'main',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        calories: 320,
        ingredients: ['Rice', 'Mixed vegetables', 'Cumin', 'Turmeric', 'Salt'],
        allergens: [],
        preparationTime: 30,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Quinoa Khichdi',
        description: 'Protein-rich quinoa khichdi with vegetables',
        price: 160.00,
        category: 'main',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        calories: 280,
        ingredients: ['Quinoa', 'Mixed vegetables', 'Cumin', 'Turmeric'],
        allergens: [],
        preparationTime: 20,
        isAvailable: true,
        isPopular: false
      },

      // Fruit items
      {
        name: 'Mixed Fruit Bowl',
        description: 'Fresh seasonal fruits cut and served fresh',
        price: 80.00,
        category: 'main',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        calories: 120,
        ingredients: ['Apple', 'Banana', 'Orange', 'Grapes', 'Pomegranate'],
        allergens: [],
        preparationTime: 5,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Papaya Bowl',
        description: 'Fresh papaya with honey and nuts',
        price: 70.00,
        category: 'main',
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: true,
        calories: 100,
        ingredients: ['Papaya', 'Honey', 'Almonds', 'Chia seeds'],
        allergens: ['Nuts'],
        preparationTime: 5,
        isAvailable: true,
        isPopular: false
      },

      // Juice items
      {
        name: 'Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 60.00,
        category: 'beverage',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        calories: 80,
        ingredients: ['Fresh oranges'],
        allergens: [],
        preparationTime: 3,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Apple Carrot Juice',
        description: 'Healthy apple and carrot juice blend',
        price: 70.00,
        category: 'beverage',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        calories: 90,
        ingredients: ['Apple', 'Carrot', 'Ginger'],
        allergens: [],
        preparationTime: 5,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Green Detox Juice',
        description: 'Spinach, cucumber, and apple detox juice',
        price: 80.00,
        category: 'beverage',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        calories: 60,
        ingredients: ['Spinach', 'Cucumber', 'Apple', 'Lemon'],
        allergens: [],
        preparationTime: 5,
        isAvailable: true,
        isPopular: false
      },

      // Snack items
      {
        name: 'Roasted Chana',
        description: 'Healthy roasted chickpeas with spices',
        price: 50.00,
        category: 'snack',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        calories: 150,
        ingredients: ['Chickpeas', 'Cumin', 'Coriander', 'Salt'],
        allergens: [],
        preparationTime: 10,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Mixed Nuts',
        description: 'Assorted dry fruits and nuts',
        price: 90.00,
        category: 'snack',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        calories: 200,
        ingredients: ['Almonds', 'Walnuts', 'Raisins', 'Cashews'],
        allergens: ['Nuts'],
        preparationTime: 2,
        isAvailable: true,
        isPopular: true
      },

      // Soup items
      {
        name: 'Tomato Soup',
        description: 'Fresh tomato soup with herbs',
        price: 80.00,
        category: 'main',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        calories: 100,
        ingredients: ['Tomatoes', 'Onion', 'Garlic', 'Basil', 'Salt'],
        allergens: [],
        preparationTime: 15,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Mixed Vegetable Soup',
        description: 'Hearty mixed vegetable soup',
        price: 90.00,
        category: 'main',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        calories: 120,
        ingredients: ['Carrot', 'Beans', 'Corn', 'Onion', 'Garlic'],
        allergens: [],
        preparationTime: 20,
        isAvailable: true,
        isPopular: false
      },

      // Salad items
      {
        name: 'Garden Salad',
        description: 'Fresh mixed greens with vegetables',
        price: 100.00,
        category: 'main',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        calories: 80,
        ingredients: ['Lettuce', 'Tomato', 'Cucumber', 'Onion', 'Olive oil'],
        allergens: [],
        preparationTime: 10,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Quinoa Salad',
        description: 'Protein-rich quinoa salad with vegetables',
        price: 130.00,
        category: 'main',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        calories: 200,
        ingredients: ['Quinoa', 'Cucumber', 'Tomato', 'Onion', 'Lemon'],
        allergens: [],
        preparationTime: 15,
        isAvailable: true,
        isPopular: true
      }
    ];

    const seededMenuItems = [];
    
    // Assign menu items to restaurants based on category
    for (const restaurant of restaurants) {
      let itemsToAssign = [];
      
      switch (restaurant.category) {
        case 'khichdi':
          itemsToAssign = menuItems.filter(item => 
            item.name.includes('Khichdi') || item.name.includes('Quinoa')
          );
          break;
        case 'fruits':
          itemsToAssign = menuItems.filter(item => 
            item.name.includes('Fruit') || item.name.includes('Papaya')
          );
          break;
        case 'juice':
          itemsToAssign = menuItems.filter(item => 
            item.name.includes('Juice') || item.name.includes('Detox')
          );
          break;
        case 'snacks':
          itemsToAssign = menuItems.filter(item => 
            item.name.includes('Chana') || item.name.includes('Nuts')
          );
          break;
        case 'soups':
          itemsToAssign = menuItems.filter(item => 
            item.name.includes('Soup')
          );
          break;
        case 'salads':
          itemsToAssign = menuItems.filter(item => 
            item.name.includes('Salad')
          );
          break;
        default:
          itemsToAssign = menuItems.slice(0, 3); // Default items
      }

      for (const itemData of itemsToAssign) {
        const [menuItem, created] = await MenuItem.findOrCreate({
          where: { 
            name: itemData.name,
            restaurantId: restaurant.id 
          },
          defaults: {
            ...itemData,
            restaurantId: restaurant.id
          }
        });
        seededMenuItems.push(menuItem);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Menu items seeded successfully',
      count: seededMenuItems.length,
      menuItems: seededMenuItems
    });
  } catch (error) {
    console.error('Seed menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed menu items',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Seed all data at once
exports.seedAll = async (req, res) => {
  try {
    // Seed categories first
    const categoriesResult = await exports.seedCategories(req, res);
    if (!categoriesResult.success) {
      return res.status(500).json(categoriesResult);
    }

    // Seed restaurants
    const restaurantsResult = await exports.seedRestaurants(req, res);
    if (!restaurantsResult.success) {
      return res.status(500).json(restaurantsResult);
    }

    // Seed menu items
    const menuItemsResult = await exports.seedMenuItems(req, res);
    if (!menuItemsResult.success) {
      return res.status(500).json(menuItemsResult);
    }

    res.status(200).json({
      success: true,
      message: 'All food delivery data seeded successfully',
      summary: {
        categories: categoriesResult.count,
        restaurants: restaurantsResult.count,
        menuItems: menuItemsResult.count
      }
    });
  } catch (error) {
    console.error('Seed all data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed all data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Clear all food delivery data
exports.clearAll = async (req, res) => {
  try {
    const { FoodOrderItem, FoodOrder, FoodCart, MenuItem, Restaurant, FoodCategory } = getModels();

    // Delete in reverse order of dependencies
    await FoodOrderItem.destroy({ where: {} });
    await FoodOrder.destroy({ where: {} });
    await FoodCart.destroy({ where: {} });
    await MenuItem.destroy({ where: {} });
    await Restaurant.destroy({ where: {} });
    await FoodCategory.destroy({ where: {} });

    res.status(200).json({
      success: true,
      message: 'All food delivery data cleared successfully'
    });
  } catch (error) {
    console.error('Clear all data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear all data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get seeding status
exports.getSeedingStatus = async (req, res) => {
  try {
    const { FoodCategory, Restaurant, MenuItem, FoodOrder } = getModels();

    const categoryCount = await FoodCategory.count();
    const restaurantCount = await Restaurant.count();
    const menuItemCount = await MenuItem.count();
    const orderCount = await FoodOrder.count();

    res.status(200).json({
      success: true,
      message: 'Seeding status retrieved successfully',
      status: {
        categories: categoryCount,
        restaurants: restaurantCount,
        menuItems: menuItemCount,
        orders: orderCount,
        isSeeded: categoryCount > 0 && restaurantCount > 0 && menuItemCount > 0
      }
    });
  } catch (error) {
    console.error('Get seeding status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get seeding status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

