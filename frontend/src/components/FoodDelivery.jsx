import {
  FaSearch,
  FaStar,
  FaHeart,
  FaShoppingCart,
  FaTimes,
  FaPlus,
  FaMinus,
  FaTrash,
  FaArrowLeft,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import log from "../assets/log.png";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import foodDeliveryApi from "../api/foodDeliveryApi";

export default function PatientFoodDelivery() {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [userAddress, setUserAddress] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [notification, setNotification] = useState(null);
  
  // API Data States
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug logging
  console.log('🔍 FoodDelivery Auth State:', {
    authLoading,
    user: !!user,
    userId: user?.id,
    userName: user?.name
  });

  // Show loading if authentication is still loading
  if (authLoading) {
    console.log('⏳ Authentication loading...');
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show login required message if user is not authenticated
  if (!user) {
    console.log('❌ User not authenticated, showing login required');
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-orange-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access food delivery services.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors font-semibold"
            >
              Login to Continue
            </Link>
            <Link
              to="/"
              className="block w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors font-semibold"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ User authenticated, showing food delivery interface');

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Update user address when user changes
  useEffect(() => {
    if (user) {
      setUserAddress(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🚀 Starting to fetch data...');
        setLoading(true);
        setError(null);

        // Fetch categories
        console.log('📂 Fetching categories...');
        const categoriesResponse = await foodDeliveryApi.public.getCategories();
        console.log('Categories response:', categoriesResponse);
        
        if (categoriesResponse.success) {
          const formattedCategories = [
            { id: "all", name: "All", img: "https://cdn-icons-png.flaticon.com/512/8786/8786966.png" },
            ...categoriesResponse.categories.map(cat => ({
              id: cat.identifier,
              name: cat.name,
              img: cat.image || "https://via.placeholder.com/64x64"
            }))
          ];
          setCategories(formattedCategories);
          console.log('✅ Categories loaded:', formattedCategories);
        } else {
          console.warn('⚠️ Categories API failed, using fallback data');
          setCategories([
            { id: "all", name: "All", img: "https://cdn-icons-png.flaticon.com/512/8786/8786966.png" },
            { id: "khichdi", name: "Khichdi", img: "https://cdn-icons-png.flaticon.com/512/8786/8786966.png" },
            { id: "soup", name: "Soup", img: "https://cdn-icons-png.flaticon.com/512/8786/8786966.png" }
          ]);
        }

        // Fetch restaurants
        console.log('🏪 Fetching restaurants...');
        const restaurantsResponse = await foodDeliveryApi.public.getRestaurants();
        console.log('Restaurants response:', restaurantsResponse);
        
        if (restaurantsResponse.success) {
          const formattedRestaurants = restaurantsResponse.restaurants.map(restaurant => ({
            id: restaurant.id,
            name: restaurant.name,
            category: restaurant.category,
            cuisine: restaurant.cuisine,
            rating: parseFloat(restaurant.rating),
            time: restaurant.deliveryTime,
            price: restaurant.priceRange,
            img: restaurant.image || "https://via.placeholder.com/300x200"
          }));
          setRestaurants(formattedRestaurants);
          console.log('✅ Restaurants loaded:', formattedRestaurants);
        } else {
          console.warn('⚠️ Restaurants API failed, using fallback data');
          setRestaurants([
            {
              id: 1,
              name: "Test Restaurant",
              category: "khichdi",
              cuisine: "Indian",
              rating: 4.5,
              time: "25 mins",
              price: "₹100-₹200",
              img: "https://via.placeholder.com/300x200"
            }
          ]);
        }

        // Fetch menu items for each restaurant
        const menuItemsData = {};
        if (restaurantsResponse.success) {
          for (const restaurant of restaurantsResponse.restaurants) {
            try {
              const menuResponse = await foodDeliveryApi.public.getMenuItems(restaurant.id);
              if (menuResponse.success) {
                menuItemsData[restaurant.id] = menuResponse.menuItems.map(item => ({
                  id: item.id,
                  name: item.name,
                  price: parseFloat(item.price),
                  description: item.description || "",
                  image: item.image,
                  isVegetarian: item.isVegetarian,
                  isVegan: item.isVegan
                }));
              }
            } catch (error) {
              console.error(`Error fetching menu for restaurant ${restaurant.id}:`, error);
            }
          }
        }
        setMenuItems(menuItemsData);
        console.log('✅ Data loading completed');

      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setError('Failed to load data. Please check if backend is running.');
        
        // Set fallback data on error
        setCategories([
          { id: "all", name: "All", img: "https://cdn-icons-png.flaticon.com/512/8786/8786966.png" },
          { id: "khichdi", name: "Khichdi", img: "https://cdn-icons-png.flaticon.com/512/8786/8786966.png" }
        ]);
        setRestaurants([
          {
            id: 1,
            name: "Test Restaurant",
            category: "khichdi",
            cuisine: "Indian",
            rating: 4.5,
            time: "25 mins",
            price: "₹100-₹200",
            img: "https://via.placeholder.com/300x200"
          }
        ]);
        setMenuItems({});
      } finally {
        setLoading(false);
        console.log('🏁 Loading finished');
      }
    };

    fetchData();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    console.log("Current cart items:", cartItems);
  }, [cartItems]);

  // Show notification function
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000); // Hide after 3 seconds
  };

  const updateQuantity = (itemId, change) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + change),
    }));
  };

  const openRestaurantModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || restaurant.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Debug logging
  console.log('🔍 Debug Info:', {
    loading,
    error,
    categories: categories.length,
    restaurants: restaurants.length,
    filteredRestaurants: filteredRestaurants.length,
    searchTerm,
    activeCategory
  });

  const addToCart = async (item, restaurantId) => {
    console.log('🛒 Adding to cart:', {
      item: item.name,
      restaurantId,
      user: !!user,
      userId: user?.id
    });

    if (!restaurantId) {
      console.error("restaurantId is undefined");
      return;
    }

    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (!restaurant) {
      console.error("Restaurant not found");
      return;
    }

    try {
      const quantityToAdd = quantities[item.id] || 1;
      
      // Add to backend cart (user is guaranteed to be authenticated)
      try {
        console.log('📤 Sending to backend cart...');
        await foodDeliveryApi.protected.addToCart(
          item.id,
          restaurantId,
          quantityToAdd,
          ''
        );
        console.log('✅ Item added to backend cart');
      } catch (error) {
        console.error('❌ Error adding to backend cart:', error);
        showNotification('Failed to add to cart. Please try again.', 'error');
        return;
      }

      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (i) => i.id === item.id && i.restaurantId === restaurantId
        );

        if (existingItem) {
          // Show notification for quantity update
          showNotification(`${item.name} quantity updated! (${existingItem.quantity + quantityToAdd} total)`);
          return prevItems.map((i) =>
            i.id === item.id && i.restaurantId === restaurantId
              ? { ...i, quantity: i.quantity + quantityToAdd }
              : i
          );
        }

        return [
          ...prevItems,
          {
            ...item,
            restaurantId,
            restaurantName: restaurant.name,
            quantity: quantityToAdd,
          },
        ];
      });
      
      // Show notification when item is added to cart
      showNotification(`${item.name} added to cart! (${quantityToAdd} item${quantityToAdd > 1 ? 's' : ''})`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Failed to add item to cart. Please try again.', 'error');
    }
  };

  // Cart management functions
  const removeFromCart = (itemId, restaurantId) => {
    const itemToRemove = cartItems.find(
      (i) => i.id === itemId && i.restaurantId === restaurantId
    );
    if (itemToRemove) {
      showNotification(`${itemToRemove.name} removed from cart!`, "info");
    }
    setCartItems((prev) =>
      prev.filter((i) => !(i.id === itemId && i.restaurantId === restaurantId))
    );
  };

  const updateCartItemQuantity = (itemId, restaurantId, change) => {
    setCartItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId && i.restaurantId === restaurantId) {
          return { ...i, quantity: Math.max(1, i.quantity + change) };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
    showNotification("Cart cleared");
  };

  const handlePaymentSubmit = async () => {
    try {
      console.log('🛒 Processing payment...', {
        cartItems: cartItems.length,
        user: !!user,
        userId: user?.id
      });
      
      setCheckoutStep("confirmation");
      
      // Create order in backend (user is guaranteed to be authenticated)
      if (cartItems.length > 0) {
        try {
          const orderData = {
            deliveryAddress: userAddress,
            paymentMethod: paymentMethod,
            deliveryInstructions: ''
          };
          
          console.log('📦 Creating order with data:', orderData);
          const orderResponse = await foodDeliveryApi.protected.createOrder(orderData);
          console.log('📦 Order response:', orderResponse);
          
          if (orderResponse.success) {
            showNotification('Order placed successfully! Order ID: ' + orderResponse.order.id, 'success');
            console.log('✅ Order created successfully:', orderResponse.order);
            
            // Clear cart after successful order
            setTimeout(() => {
              setCartItems([]);
              localStorage.removeItem("cart");
            }, 3000);
          } else {
            console.error('❌ Order creation failed:', orderResponse);
            showNotification('Failed to create order. Please try again.', 'error');
          }
        } catch (error) {
          console.error('❌ Error creating order:', error);
          showNotification('Failed to create order. Please try again.', 'error');
        }
      } else {
        showNotification('Your cart is empty. Please add items first.', 'error');
      }
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      showNotification('Payment processing failed. Please try again.', 'error');
    }
  };

  const renderCartPage = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-orange-50">
      {/* Navbar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="fixed w-full flex justify-between h-[100px] bg-[#ddd6fe] backdrop-blur-sm items-center px-4 z-50 shadow-md shadow-cyan-800"
      >
        <div className="flex items-center justify-between w-full">
          <div className="nav-links">
            <button
              onClick={() => setShowCart(false)}
              className="text-purple-800 font-medium hover:text-purple-600 transition-colors flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Menu
            </button>
          </div>
          <div className="logo">
            <Link to="/home">
              <img src={log} alt="We Cure Consultancy Logo" />
            </Link>
          </div>
          <div className="nav-links flex items-center space-x-4">
            <span className="text-purple-800 font-medium">
              {user?.name || 'User'}'s Cart ({cartItems.length})
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="pt-[100px] pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 my-6 text-center">
            Your Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-600 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-500 mb-6">
                Add some delicious food to get started!
              </p>
              <button
                onClick={() => setShowCart(false)}
                className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Cart Items ({cartItems.length})
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.id}-${item.restaurantId}`}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.restaurantName}
                        </p>
                        <p className="text-sm text-gray-600">
                          ₹{item.price} each
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            updateCartItemQuantity(
                              item.id,
                              item.restaurantId,
                              -1
                            )
                          }
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          <FaMinus className="text-sm" />
                        </button>
                        <span className="text-lg font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartItemQuantity(
                              item.id,
                              item.restaurantId,
                              1
                            )
                          }
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          <FaPlus className="text-sm" />
                        </button>
                        <span className="text-lg font-semibold text-gray-800 w-20 text-right">
                          ₹{item.price * item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            removeFromCart(item.id, item.restaurantId)
                          }
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">
                      Total: ₹
                      {cartItems.reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                      )}
                    </span>
                    <button
                      onClick={clearCart}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Checkout Steps */}
              {checkoutStep === "cart" && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Delivery Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={userAddress.fullName}
                        onChange={(e) =>
                          setUserAddress({
                            ...userAddress,
                            fullName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={userAddress.phone}
                        onChange={(e) =>
                          setUserAddress({
                            ...userAddress,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={userAddress.address}
                        onChange={(e) =>
                          setUserAddress({
                            ...userAddress,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your full address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={userAddress.city}
                        onChange={(e) =>
                          setUserAddress({
                            ...userAddress,
                            city: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={userAddress.pincode}
                        onChange={(e) =>
                          setUserAddress({
                            ...userAddress,
                            pincode: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your pincode"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <span>Credit/Debit Card</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <span>Cash on Delivery</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handlePaymentSubmit}
                      className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition-colors font-semibold"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              )}

              {checkoutStep === "confirmation" && (
                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                  <div className="text-green-500 text-6xl mb-4">✓</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Order Placed Successfully!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Your order has been confirmed and will be delivered soon.
                  </p>
                  <p className="text-sm text-gray-500">
                    Order Total: ₹
                    {cartItems.reduce(
                      (total, item) => total + item.price * item.quantity,
                      0
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFoodDelivery = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-orange-50">
      {/* Navbar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="fixed w-full flex justify-between h-[100px] bg-[#ddd6fe] backdrop-blur-sm items-center px-4 z-50 shadow-md shadow-cyan-800"
      >
        <div className="flex items-center justify-between w-full">
          <div className="nav-links">
            <Link
              to="/home"
              className="text-purple-800 font-medium hover:text-purple-600 transition-colors no-underline hover:no-underline"
            >
              Home
            </Link>
          </div>
          <div className="logo">
            <Link to="/home">
              <img src={log} alt="We Cure Consultancy Logo" />
            </Link>
          </div>
          <div className="nav-links flex items-center space-x-4">
            <span className="text-purple-800 font-medium">
              Welcome, {user?.name || 'User'}
            </span>
            <button
              onClick={() => setShowCart(true)}
              className="text-purple-800 font-medium hover:text-purple-600 transition-colors flex items-center"
            >
              <FaShoppingCart className="mr-2" />
              Cart ({cartItems.length})
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="pt-[100px] pb-8 px-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading delicious food options...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search and Categories */}
        {!loading && !error && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 my-6 text-center">
              Healthy Food, Delivered Fast
            </h1>

            <div className="flex justify-between items-center bg-white rounded-full px-6 py-3 shadow-md w-full max-w-2xl mx-auto mb-8">
              <input
                type="text"
                placeholder="Search for restaurants or dishes..."
                className="w-full px-4 py-1 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="text-xl text-purple-600" />
            </div>

            <div className="flex space-x-6 pb-4 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex flex-col items-center cursor-pointer ${
                    activeCategory === cat.id
                      ? "border-b-2 border-purple-600"
                      : ""
                  }`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <p className="mt-2 text-sm font-medium">{cat.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restaurant List */}
        {!loading && !error && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Recommended for You
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <motion.div
                  key={restaurant.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                  onClick={() => openRestaurantModal(restaurant)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={restaurant.img}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(restaurant.id);
                      }}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md"
                    >
                      <FaHeart
                        className={`text-lg ${
                          favorites.includes(restaurant.id)
                            ? "text-red-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between">
                      <h3 className="text-xl font-bold">{restaurant.name}</h3>
                      <div className="flex items-center bg-green-100 px-2 py-1 rounded">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span>{restaurant.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {restaurant.cuisine}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {restaurant.time} • {restaurant.price}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Restaurant Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-purple-200 bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {selectedRestaurant.name}
                    </h2>
                    <p className="text-gray-600 mt-2">
                      {selectedRestaurant.cuisine}
                    </p>
                    <div className="flex items-center mt-2">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="font-semibold">
                        {selectedRestaurant.rating}
                      </span>
                      <span className="text-gray-500 ml-2">
                        • {selectedRestaurant.time} • {selectedRestaurant.price}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Menu Items
                    </h3>
                    <div className="space-y-4">
                      {menuItems[selectedRestaurant.id]?.map((item) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">
                                {item.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.description}
                              </p>
                              <p className="text-lg font-bold text-purple-600 mt-2">
                                ₹{item.price}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, -1)
                                }
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center"
                              >
                                <FaMinus className="text-sm" />
                              </button>
                              <span className="text-lg font-semibold w-8 text-center">
                                {quantities[item.id] || 1}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, 1)
                                }
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center"
                              >
                                <FaPlus className="text-sm" />
                              </button>
                              <button
                                onClick={() =>
                                  addToCart(item, selectedRestaurant.id)
                                }
                                className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors ml-2"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {showCart ? renderCartPage() : renderFoodDelivery()}

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3 rounded-lg shadow-lg max-w-sm w-auto ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "info"
                ? "bg-blue-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                {notification.type === "success" && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {notification.type === "info" && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {notification.type === "error" && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}