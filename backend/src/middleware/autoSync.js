const { getModels } = require('../models');

// Middleware to automatically sync frontend data when server starts
const autoSyncFrontendData = async () => {
  try {
    const { Restaurant, MenuItem } = getModels();
    console.log('🔄 Auto-syncing frontend data with backend...');

    // Frontend restaurant data (from your existing frontend)
    const frontendRestaurants = [
      {
        id: 1,
        name: "Healthy Khichdi Point",
        category: "khichdi",
        cuisine: "Moong Dal Khichdi, Veg Khichdi",
        rating: 4.9,
        time: "20 mins",
        price: "₹120-₹200",
        img: "https://www.maggi.in/sites/default/files/styles/home_stage_1500_700/public/srh_recipes/e193a27c4e173335ec4162436a0eb78d.jpg?h=51a72048&itok=zeMAnCZu",
      },
      {
        id: 2,
        name: "Fresh & Fit Fruits",
        category: "fruits",
        cuisine: "Seasonal Fruits, Fruit Bowls",
        rating: 4.7,
        time: "15 mins",
        price: "₹80-₹150",
        img: "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg",
      },
      {
        id: 3,
        name: "Juice & Soup Corner",
        category: "juice",
        cuisine: "Fresh Juices, Veg/Chicken Soup",
        rating: 4.8,
        time: "18 mins",
        price: "₹60-₹120",
        img: "https://www.onceuponachef.com/images/2023/07/chilled-tomato-basil-soup-11-1120x923.jpg",
      },
      {
        id: 4,
        name: "Sandwich Corner",
        category: "sandwich",
        cuisine: "Sandwiches, Veg Sandwiches",
        rating: 4.8,
        time: "18 mins",
        price: "₹90-₹160",
        img: "https://images.arla.com/recordid/15F33607-F6D9-4952-B6AA210D3033BF14/club-sandwich1.jpg?format=webp&width=1269&height=715&mode=crop",
      },
      {
        id: 5,
        name: "Porridge Palace",
        category: "porridge",
        cuisine: "Oats Porridge, Multigrain Porridge",
        rating: 4.6,
        time: "25 mins",
        price: "₹100-₹180",
        img: "https://www.allrecipes.com/thmb/FvfPW4w10vNq4IeYZIeYBgZoeVc=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/73155porridgeKim4x3-837aa32ee7ca433cbb69c94ffa4c1617.jpg",
      },
      {
        id: 6,
        name: "Healthy Bites",
        category: "khichdi",
        cuisine: "Special Khichdi, Dal Khichdi",
        rating: 4.5,
        time: "30 mins",
        price: "₹150-₹250",
        img: "https://images.getrecipekit.com/20250101065912-feature.jpg?class=16x9",
      }
    ];

    // Frontend menu items data (from your existing frontend)
    const frontendMenuItems = {
      1: [
        {
          id: 101,
          name: "Moong Dal Khichdi",
          price: 120,
          description: "Healthy khichdi made with moong dal and rice",
        },
        {
          id: 102,
          name: "Vegetable Khichdi",
          price: 150,
          description: "Khichdi with mixed vegetables",
        },
        {
          id: 103,
          name: "Special Diet Khichdi",
          price: 180,
          description: "Doctor recommended khichdi",
        },
      ],
      2: [
        {
          id: 201,
          name: "Seasonal Fruit Bowl",
          price: 90,
          description: "Fresh seasonal fruits",
        },
        {
          id: 202,
          name: "Mixed Fruit Salad",
          price: 110,
          description: "Assorted fruits with honey",
        },
      ],
      3: [
        {
          id: 301,
          name: "Fresh Orange Juice",
          price: 60,
          description: "100% pure orange juice",
        },
        {
          id: 302,
          name: "Vegetable Soup",
          price: 80,
          description: "Healthy vegetable soup",
        },
      ],
      4: [
        {
          id: 401,
          name: "Veg Sandwich",
          price: 90,
          description: "Fresh vegetable sandwich",
        },
        {
          id: 402,
          name: "Grilled Cheese",
          price: 120,
          description: "Classic grilled cheese sandwich",
        },
      ],
      5: [
        {
          id: 501,
          name: "Oats Porridge",
          price: 100,
          description: "Healthy oats porridge",
        },
        {
          id: 502,
          name: "Multigrain Porridge",
          price: 120,
          description: "Nutritious multigrain mix",
        },
      ],
      6: [
        {
          id: 601,
          name: "Special Khichdi",
          price: 150,
          description: "Signature khichdi recipe",
        },
        {
          id: 602,
          name: "Dal Khichdi",
          price: 130,
          description: "Traditional dal khichdi",
        },
      ]
    };

    // Sync restaurants
    let restaurantsSynced = 0;
    for (const restaurantData of frontendRestaurants) {
      const [restaurant, created] = await Restaurant.findOrCreate({
        where: { id: restaurantData.id },
        defaults: {
          name: restaurantData.name,
          category: restaurantData.category,
          cuisine: restaurantData.cuisine,
          rating: restaurantData.rating,
          deliveryTime: restaurantData.time,
          priceRange: restaurantData.price,
          image: restaurantData.img,
          description: `${restaurantData.name} - ${restaurantData.cuisine}`,
          isActive: true,
          isOpen: true
        }
      });

      if (!created) {
        await restaurant.update({
          name: restaurantData.name,
          category: restaurantData.category,
          cuisine: restaurantData.cuisine,
          rating: restaurantData.rating,
          deliveryTime: restaurantData.time,
          priceRange: restaurantData.price,
          image: restaurantData.img
        });
      }
      restaurantsSynced++;
    }

    // Sync menu items
    let menuItemsSynced = 0;
    for (const [restaurantId, items] of Object.entries(frontendMenuItems)) {
      if (Array.isArray(items)) {
        for (const itemData of items) {
          const [menuItem, created] = await MenuItem.findOrCreate({
            where: { id: itemData.id },
            defaults: {
              name: itemData.name,
              description: itemData.description,
              price: itemData.price,
              restaurantId: parseInt(restaurantId),
              category: 'main',
              isVegetarian: true,
              isAvailable: true,
              isPopular: Math.random() > 0.7 // Randomly mark some as popular
            }
          });

          if (!created) {
            await menuItem.update({
              name: itemData.name,
              description: itemData.description,
              price: itemData.price,
              restaurantId: parseInt(restaurantId)
            });
          }
          menuItemsSynced++;
        }
      }
    }

    console.log(`✅ Auto-sync completed: ${restaurantsSynced} restaurants, ${menuItemsSynced} menu items`);
    return { restaurantsSynced, menuItemsSynced };

  } catch (error) {
    console.error('❌ Auto-sync failed:', error);
    throw error;
  }
};

module.exports = { autoSyncFrontendData };
