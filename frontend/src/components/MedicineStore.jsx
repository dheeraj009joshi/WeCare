import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaSearch,
  FaShoppingCart,
  FaRupeeSign,
  FaPlus,
  FaMinus,
  FaTimes,
  FaFileUpload,
  FaBolt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import {
  cartApi,
  orderApi,
  addressApi,
  paymentApi,
  productApi,
  isAuthenticated,
} from "../services/medicineStoreApi";
// Ayurvedic medicine images
import ashwagandhaImg from "../assets/ayurvedic/ashwagandha.jpg";
import triphalaImg from "../assets/ayurvedic/triphala.jpg";
import brahmiImg from "../assets/ayurvedic/brahmi.jpg";
import giloyImg from "../assets/ayurvedic/giloy.jpg";
import neemImg from "../assets/ayurvedic/neem.jpg";
import turmericImg from "../assets/ayurvedic/turmeric.jpg";
import shilajitImg from "../assets/ayurvedic/shilajit.jpg";
import guggulImg from "../assets/ayurvedic/guggul.jpg";
import { Link } from "react-router-dom";
import log from "../assets/log.png";
const AyurvedicStore = () => {
  // FORCE BROWSER REFRESH - NEW VERSION WITH HARDCODED PRODUCTS
  console.log("🚀 NEW VERSION: AyurvedicStore component loaded with hardcoded products!");
  
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [expandedPayment, setExpandedPayment] = useState("card");
  const [selectedUpi, setSelectedUpi] = useState("");
  const [customUpiId, setCustomUpiId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addresses, setAddresses] = useState([]);
  // Ayurvedic medicine data - HARDCODED for immediate display
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: "Ashwagandha",
      price: 299,
      stock: 50,
      category: "Stress Relief",
      prescription: false,
      image: ashwagandhaImg,
      dosha: "Vata-Kapha",
      benefits: "Reduces stress, improves sleep, boosts immunity",
      description: "Ashwagandha is an ancient medicinal herb that has been used for thousands of years in Ayurveda. It's classified as an adaptogen, meaning it can help your body manage stress.",
      manufacturer: "Ayurvedic Herbs Co.",
      isActive: true
    },
    {
      id: 2,
      name: "Triphala",
      price: 199,
      stock: 75,
      category: "Digestion",
      prescription: false,
      image: triphalaImg,
      dosha: "All Doshas",
      benefits: "Improves digestion, detoxifies body, supports gut health",
      description: "Triphala is a traditional Ayurvedic herbal formulation consisting of three fruits: Amalaki, Bibhitaki, and Haritaki.",
      manufacturer: "Ayurvedic Herbs Co.",
      isActive: true
    },
    {
      id: 3,
      name: "Brahmi",
      price: 249,
      stock: 40,
      category: "Brain Health",
      prescription: false,
      image: brahmiImg,
      dosha: "Vata-Pitta",
      benefits: "Enhances memory, improves concentration, reduces anxiety",
      description: "Brahmi is a traditional Ayurvedic herb known for its cognitive-enhancing properties.",
      manufacturer: "Ayurvedic Herbs Co.",
      isActive: true
    },
    {
      id: 4,
      name: "Giloy",
      price: 179,
      stock: 60,
      category: "Immunity",
      prescription: false,
      image: giloyImg,
      dosha: "All Doshas",
      benefits: "Boosts immunity, fights infections, reduces fever",
      description: "Giloy, also known as Guduchi, is a powerful immunomodulator in Ayurveda.",
      manufacturer: "Ayurvedic Herbs Co.",
      isActive: true
    },
    {
      id: 5,
      name: "Neem",
      price: 159,
      stock: 80,
      category: "Skin Health",
      prescription: false,
      image: neemImg,
      dosha: "Pitta-Kapha",
      benefits: "Purifies blood, treats skin conditions, antibacterial",
      description: "Neem is a versatile herb known for its purifying properties.",
      manufacturer: "Ayurvedic Herbs Co.",
      isActive: true
    },
    {
      id: 6,
      name: "Turmeric",
      price: 129,
      stock: 100,
      category: "Anti-inflammatory",
      prescription: false,
      image: turmericImg,
      dosha: "All Doshas",
      benefits: "Reduces inflammation, antioxidant, supports joint health",
      description: "Turmeric is a golden spice with powerful anti-inflammatory and antioxidant properties.",
      manufacturer: "Ayurvedic Herbs Co.",
      isActive: true
    },
    {
      id: 7,
      name: "Shilajit",
      price: 399,
      stock: 30,
      category: "Energy & Vitality",
      prescription: false,
      image: shilajitImg,
      dosha: "Vata",
      benefits: "Boosts energy, enhances stamina, anti-aging",
      description: "Shilajit is a natural substance found in the Himalayas, known for its rejuvenating properties.",
      manufacturer: "Ayurvedic Herbs Co.",
      isActive: true
    },
    {
      id: 8,
      name: "Guggul",
      price: 229,
      stock: 45,
      category: "Cholesterol Management",
      prescription: false,
      image: guggulImg,
      dosha: "Kapha",
      benefits: "Lowers cholesterol, supports weight loss, anti-inflammatory",
      description: "Guggul is a traditional Ayurvedic herb used for managing cholesterol levels.",
      manufacturer: "Ayurvedic Herbs Co.",
      isActive: true
    }
  ]);
  const [loading, setLoading] = useState(false);

  // Fallback images for products that don't have images from backend
  const fallbackImages = {
    "Ashwagandha": ashwagandhaImg,
    "Triphala": triphalaImg,
    "Brahmi": brahmiImg,
    "Giloy": giloyImg,
    "Neem": neemImg,
    "Turmeric": turmericImg,
    "Shilajit": shilajitImg,
    "Guggul": guggulImg,
  };

  const [cart, setCart] = useState(() => {
    // Load cart from localStorage on component mount

    const savedCart = localStorage.getItem("ayurvedicCart");

    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [showCart, setShowCart] = useState(false);

  const [prescriptionFile, setPrescriptionFile] = useState(null);

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  const [doshaFilter, setDoshaFilter] = useState("all");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Products are now hardcoded above - no function needed!

  // Load user addresses if authenticated
  const loadAddresses = async () => {
    try {
      // Skip API call if backend is not available
      console.log("Skipping address loading - backend not available");
      setAddresses([]);
    } catch (error) {
      console.error("Error loading addresses:", error);
      setAddresses([]);
    }
  };

  // Products are hardcoded in useState - no useEffect needed!

  // Load user addresses if authenticated
  // Disabled API calls - using localStorage and fallback data
  // useEffect(() => {
  //   if (isAuthenticated()) {
  //     loadAddresses();
  //   }
  // }, []);

  // // Load cart if authenticated
  // useEffect(() => {
  //   if (isAuthenticated()) {
  //     loadCart();
  //   }
  // }, []);

  // Function to save cart to localStorage

  const saveCartToStorage = (newCart) => {
    localStorage.setItem("ayurvedicCart", JSON.stringify(newCart));
  };

  const loadCart = async () => {
    try {
      // Skip API call if backend is not available, use localStorage cart
      console.log("Skipping cart API - using localStorage cart");
      // Cart is already loaded from localStorage in the useState initialization
    } catch (error) {
      console.error("Error loading cart:", error);
      // Keep existing cart from localStorage if API fails
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);

    setShowAddressForm(true);
  };

  const handleSaveAddress = async (addressData) => {
    try {
      console.log("Saving address data:", addressData);

      if (!isAuthenticated()) {
        // For guest checkout, create a temporary address object
        console.log("Creating temporary address for guest checkout");
        
        const tempAddress = {
          id: 'temp-' + Date.now(),
          name: addressData.name,
          address: addressData.address,
          phone: addressData.phone,
          city: addressData.city,
          state: addressData.state,
          pincode: addressData.pincode,
          type: addressData.type || 'home',
          isDefault: false,
          isTemporary: true
        };
        
        // Add to local addresses array and select it
        setAddresses([...addresses, tempAddress]);
        setSelectedAddress(tempAddress);
        setShowAddressForm(false);
        return;
      }

      if (editingAddress) {
        // Update existing address
        console.log("Updating existing address:", editingAddress.id);

        const response = await addressApi.updateAddress(
          editingAddress.id,
          addressData
        );

        if (response.success) {
          setAddresses(
            addresses.map((addr) =>
              addr.id === editingAddress.id
                ? { ...response.data, id: editingAddress.id }
                : addr
            )
          );
        }
      } else {
        // Add new address for authenticated users
        console.log("Adding new address");

        const response = await addressApi.addAddress(addressData);

        if (response.success) {
          setAddresses([...addresses, response.data]);
        }
      }

      setShowAddressForm(false);
    } catch (error) {
      console.error("Error saving address:", error);

      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response,
      });

      // Show more specific error message
      if (error.message && error.message.includes("No token")) {
        alert("Authentication required to save addresses. Please login and try again.");
      } else {
        alert("Failed to save address. Please try again.");
      }
    }
  };

  // Filter medicines based on search and dosha
  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDosha =
      doshaFilter === "all" || medicine.dosha.toLowerCase().includes(doshaFilter.toLowerCase());

    return matchesSearch && matchesDosha;
  });

  // Add to cart function - FIXED VERSION

  const addToCart = (medicine, quantity = 1) => {
    if (medicine.prescription && !prescriptionFile) {
      setShowPrescriptionModal(true);

      return;
    }

    // Add to local cart state for immediate UI update

    const existingItem = cart.find((item) => item.id === medicine.id);

    let updatedCart;

    if (existingItem) {
      // Update quantity if item already exists

      updatedCart = cart.map((item) =>
        item.id === medicine.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // Add new item to cart

      const newItem = { ...medicine, quantity };

      updatedCart = [...cart, newItem];
    }

    setCart(updatedCart);

    // Save to localStorage

    saveCartToStorage(updatedCart);

    // Success message removed - no more alert popup
  };

  // Remove from cart - FIXED VERSION

  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);

    setCart(updatedCart);

    // Save to localStorage

    saveCartToStorage(updatedCart);
  };

  // Update quantity - FIXED VERSION

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    const medicine = medicines.find((m) => m.id === id);

    if (newQuantity <= medicine.stock) {
      const updatedCart = cart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );

      setCart(updatedCart);

      // Save to localStorage

      saveCartToStorage(updatedCart);
    }
  };

  // Calculate total

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handle prescription upload

  const handlePrescriptionUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setPrescriptionFile(file);

      setShowPrescriptionModal(false);
    }
  };

  // Sync local cart with server cart before placing order
  const syncCartToServer = async () => {
    try {
      await cartApi.clearCart();
      for (const item of cart) {
        await cartApi.addToCart(item.id, item.quantity);
      }
    } catch (err) {
      console.error("Failed to sync cart to server:", err);
      throw err;
    }
  };

  // Checkout function
  const handleCheckout = async () => {
    if (!isAuthenticated() && !selectedAddress?.isTemporary) {
      alert("Please login to proceed with checkout or add a delivery address for guest checkout");
      return;
    }

    if (!selectedAddress) {
      alert("Please select address");
      return;
    }

    // Infer paymentMethod from expanded section if not chosen explicitly
    const method = paymentMethod || expandedPayment || "cod";
    setPaymentMethod(method);

    try {
      setIsPlacingOrder(true);
      
      // Only sync cart to server for authenticated users
      if (isAuthenticated()) {
        await syncCartToServer();
      }

      const orderData = {
        deliveryAddress: selectedAddress.address,

        deliveryPhone: selectedAddress.phone,

        deliveryName: selectedAddress.name,

        notes: `Order placed via ${method}`,
      };

      let response;

      // Handle guest checkout differently
      if (!isAuthenticated()) {
        // For guest checkout, create a local order (no server call)
        response = {
          success: true,
          data: {
            orderNumber: 'GUEST-' + Date.now(),
            id: 'guest-' + Date.now(),
            status: 'pending'
          }
        };
      } else {
        // Handle COD payment for authenticated users
        if (method === "cod") {
          response = await paymentApi.processCODPayment(orderData);
        } else {
          // For other payment methods, use the regular order API
          orderData.paymentMethod = method;
          response = await orderApi.createOrder(orderData);
        }
      }

      if (response.success) {
        const orderData = {
          items: [...cart],

          total: total,

          date: new Date().toLocaleString(),

          orderId:
            response.data.orderNumber || Math.floor(Math.random() * 1000000),
        };

        setOrderDetails(orderData);

        setShowOrderSuccess(true);

        setCart([]);

        // Clear cart from localStorage after successful order

        localStorage.removeItem("ayurvedicCart");

        setPrescriptionFile(null);

        setCheckoutStep("cart");

        setSelectedAddress(null);

        setPaymentMethod(null);
      }
    } catch (error) {
      console.error("Error creating order:", error);

      alert("Failed to create order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const buyNow = (medicine) => {
    if (medicine.prescription && !prescriptionFile) {
      setShowPrescriptionModal(true);

      return;
    }

    // Set cart to contain only this item with quantity 1

    const newCart = [{ ...medicine, quantity: 1 }];

    setCart(newCart);

    // Save to localStorage

    saveCartToStorage(newCart);

    // Immediately show the cart

    setShowCart(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e4e8ed] ">
      {/* Header */}

      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="fixed w-full flex flex-col h-auto md:h-[100px] bg-[#ddd6fe] backdrop-blur-sm items-center px-4 z-50 shadow-md shadow-cyan-800"
      >
        {/* Main Navbar Row */}

        <div className="flex items-center justify-between w-full h-[80px] md:h-[100px]">
          {/* Home Link - Always visible */}

          <div className="nav-links ">
            <Link
              to="/home"
              className="text-purple-800 font-medium hover:text-purple-600 transition-colors no-underline hover:no-underline text-sm md:text-base"
            >
              Home
            </Link>
          </div>

          {/* Logo */}

          <div className="flex">
            <div className="md:w-[215px]"></div>

            <Link to="/home">
              <img
                src={log}
                alt="We Cure Consultancy Logo"
                className="h-20 md:h-[100px]"
              />
            </Link>
          </div>

          {/* Desktop Search and Cart */}

          <div className="flex items-center space-x-4">
            {/* Desktop Search - Hidden on small screens, visible on medium+ */}

            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search ayurvedic products..."
                className="pl-10 pr-4 py-2 rounded-full bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] w-64 shadow-sm text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            {/* Mobile Search Toggle */}

            <button
              className="md:hidden p-2 text-purple-800"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              {mobileSearchOpen ? (
                <FaTimes className="text-lg" />
              ) : (
                <FaSearch className="text-lg" />
              )}
            </button>

            {/* Cart Button */}

            <motion.button
              className="relative p-3 rounded-full bg-[#7c3aed] shadow-md"
              onClick={() => setShowCart(!showCart)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaShoppingCart className="text-white text-lg" />

              {cart.length > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {cart.length}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Bar - Appears below navbar when active */}

        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full md:hidden bg-[#ddd6fe] px-4 pb-3"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search ayurvedic products..."
                className="pl-10 pr-4 py-2 rounded-full bg-white w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />

              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Main Content */}

      <div className="pt-[140px] container mx-auto px-4 py-8">
        {/* Title Section */}

        <div className="mb-6 md:mb-8 text-center px-4">
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-[#4f7cac] mb-1 md:mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Our Ayurvedic Collection
          </motion.h2>

          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Authentic Ayurvedic formulations for holistic wellness
          </p>
          
        </div>

        {/* Dosha Filter - Responsive */}

        <div className="flex justify-center mb-6 md:mb-8 px-2">
          <div className="flex flex-wrap justify-center gap-2 md:gap-0 md:space-x-2 bg-[#c9bded] p-1 md:p-2 rounded-full shadow-md w-full md:w-auto max-w-full overflow-x-auto">
            <button
              onClick={() => setDoshaFilter("all")}
              className={`px-3 py-1 md:px-4 rounded-full text-xs md:text-sm min-w-[80px] ${
                doshaFilter === "all"
                  ? "bg-[#8a69ec] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Doshas
            </button>

            <button
              onClick={() => setDoshaFilter("Vata")}
              className={`px-3 py-1 md:px-4 rounded-full text-xs md:text-sm min-w-[80px] ${
                doshaFilter === "Vata"
                  ? "bg-[#8a69ec] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Vata
            </button>

            <button
              onClick={() => setDoshaFilter("Pitta")}
              className={`px-3 py-1 md:px-4 rounded-full text-xs md:text-sm min-w-[80px] ${
                doshaFilter === "Pitta"
                  ? "bg-[#8a69ec] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pitta
            </button>

            <button
              onClick={() => setDoshaFilter("Kapha")}
              className={`px-3 py-1 md:px-4 rounded-full text-xs md:text-sm min-w-[80px] ${
                doshaFilter === "Kapha"
                  ? "bg-[#8a69ec] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Kapha
            </button>
          </div>
        </div>

        {/* Ayurvedic Product Grid */}
        <div className="text-center mb-4">
          <p className="text-gray-600">
            Debug: {medicines.length} total products, {filteredMedicines.length} filtered products, Loading: {loading.toString()}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin h-12 w-12 rounded-full border-4 border-[#7c3aed] border-t-transparent"></div>
            <span className="ml-4 text-gray-600">Loading products...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMedicines.map((medicine, index) => (
            <motion.div
              key={medicine.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all border border-gray-100 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedProduct(medicine)}
            >
              {/* Product Image */}

              <div className="h-48 bg-gray-100 overflow-hidden">
                <img
                  src={medicine.image}
                  alt={medicine.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl text-[#4f7cac] mb-1">
                      {medicine.name}
                    </h3>

                    <span className="inline-block bg-[#f3e8ff] text-[#7c3aed] text-xs px-2 py-1 rounded-full mb-2">
                      {medicine.category}
                    </span>
                  </div>

                  {medicine.prescription && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                      <FaFileUpload className="mr-1" size={10} /> RX
                    </span>
                  )}
                </div>

                {/* Ayurvedic Specific Info */}

                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">
                    Balances: {medicine.dosha}
                  </p>

                  <p className="text-xs text-gray-500 italic">
                    {medicine.benefits}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    <FaRupeeSign className="text-gray-500 mr-1" />

                    <span className="font-bold text-lg">{medicine.price}</span>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      medicine.stock > 10
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {medicine.stock > 10 ? "In Stock" : "Low Stock"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        )}
      </div>

      {/* Shopping Cart Sidebar */}

      {showCart && (
        <motion.div
          className="pt-[100px] fixed inset-0 backdrop-blur z-20 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowCart(false)}
        >
          <motion.div
            className="relative bg-white h-full w-full max-w-md shadow-xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {isPlacingOrder && (
              <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                <div className="animate-spin h-10 w-10 rounded-full border-4 border-[#7c3aed] border-t-transparent mb-4"></div>
                <div className="w-full max-w-sm space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Placing your order...
                </p>
              </div>
            )}

            {/* Cart Header */}

            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-[#a78bfa] to-[#a78bfa]">
              <h2 className="text-xl font-bold text-white">
                {checkoutStep === "cart" && "Your Ayurvedic Cart"}

                {checkoutStep === "address" && "Select Delivery Address"}

                {checkoutStep === "payment" && "Select Payment Method"}
              </h2>

              <button
                onClick={() => {
                  if (checkoutStep === "cart") {
                    setShowCart(false);
                  } else {
                    setCheckoutStep("cart");
                  }
                }}
                className="text-white hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],

                    y: [0, -5, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <FaShoppingCart className="mx-auto text-5xl mb-4 text-gray-300" />
                </motion.div>

                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  Your cart is empty
                </h3>

                <p className="text-gray-400 mb-6">
                  Add some Ayurvedic products to begin your wellness journey
                </p>

                <button
                  onClick={() => setShowCart(false)}
                  className="px-6 py-2 bg-[#7c3aed] text-white rounded-lg font-medium shadow-md hover:bg-[#6d28d9] transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <>
                {checkoutStep === "cart" && (
                  <>
                    <div className="flex-1 overflow-y-auto p-4">
                      {cart.map((item) => (
                        <motion.div
                          key={item.id}
                          className="mb-4 pb-4 border-b border-gray-100"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          {/* Product Image and Name - Left Side */}

                          <div className="flex items-center mb-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain"
                              />
                            </div>

                            <div className="flex-1">
                              <h3 className="font-medium text-[#4f7cac]">
                                {item.name}
                              </h3>

                              <div className="flex items-center mt-1">
                                <span className="text-sm text-gray-600 mr-3">
                                  {item.category}
                                </span>

                                {item.prescription && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    Prescription
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls - Right Side */}

                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="p-1 text-gray-500 hover:text-[#7c3aed]"
                              >
                                <FaMinus size={12} />
                              </button>

                              <span className="mx-2 w-8 text-center font-medium">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="p-1 text-gray-500 hover:text-[#7c3aed]"
                                disabled={item.quantity >= item.stock}
                              >
                                <FaPlus size={12} />
                              </button>
                            </div>

                            <div className="text-right font-bold text-[#4f7cac]">
                              <FaRupeeSign className="inline mr-1" />

                              {item.price * item.quantity}
                            </div>
                          </div>

                          {/* Action Buttons - Below */}

                          <div className="flex gap-2">
                            {/* Buy This Now Button */}

                            <motion.button
                              onClick={() => {
                                // Set cart to contain only this item

                                const singleItemCart = [
                                  { ...item, quantity: 1 },
                                ];

                                setCart(singleItemCart);

                                saveCartToStorage(singleItemCart);

                                setCheckoutStep("address");
                              }}
                              className="flex-1 py-2 bg-[#e9d5ff] text-[#7c3aed] text-sm rounded-lg font-medium shadow hover:bg-[#d8b4fe] active:bg-[#c084fc] transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Buy This Now
                            </motion.button>

                            {/* Remove Button */}

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="flex-1 py-2 bg-red-100 text-red-600 text-sm rounded-lg font-medium shadow hover:bg-red-200 active:bg-red-300 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="p-5 border-t border-gray-200 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium text-gray-700">
                          Subtotal:
                        </span>

                        <span className="font-bold text-xl text-[#4f7cac]">
                          <FaRupeeSign className="inline mr-1" />

                          {total}
                        </span>
                      </div>

                      <motion.button
                        onClick={() => setCheckoutStep("address")}
                        className="w-full py-3 bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Continue
                      </motion.button>
                    </div>
                  </>
                )}

                {checkoutStep === "address" && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <button
                      onClick={handleAddAddress}
                      className="w-full mb-4 p-3 border-2 border-dashed border-[#4f7cac] rounded-lg text-[#4f7cac] font-medium flex items-center justify-center"
                    >
                      <FaPlus className="mr-2" />
                      {isAuthenticated() ? "ADD NEW ADDRESS" : "ENTER DELIVERY ADDRESS"}
                    </button>

                    {!isAuthenticated() && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Guest Checkout:</strong> Your address will be used for this order only. 
                          <span className="text-blue-600 cursor-pointer hover:underline ml-1">
                            Login to save addresses for future orders.
                          </span>
                        </p>
                      </div>
                    )}

                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="mb-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start mb-2">
                          <input
                            type="radio"
                            id={`address-${address.id}`}
                            name="address"
                            checked={selectedAddress?.id === address.id}
                            onChange={() => setSelectedAddress(address)}
                            className="mt-1 mr-3"
                          />

                          <div className="flex-1">
                            <label
                              htmlFor={`address-${address.id}`}
                              className="font-medium text-[#4f7cac]"
                            >
                              {address.name} {address.isDefault && "(Default)"} {address.isTemporary && "(Guest Address)"}
                            </label>

                            <p className="text-sm text-gray-600 mt-1">
                              {address.address}
                            </p>

                            <p className="text-sm text-gray-600">
                              {address.phone}
                            </p>
                          </div>
                        </div>

                        {!address.isTemporary && (
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="text-[#4f7cac] text-sm font-medium"
                          >
                            EDIT
                          </button>
                        )}
                      </div>
                    ))}

                    <div className="p-5 border-t border-gray-200 bg-gray-50">
                      <div className="mb-4">
                        <h3 className="font-medium text-gray-700 mb-2">
                          Price Details ({cart.length} Items)
                        </h3>

                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Total Product Price</span>

                          <span>₹{total}</span>
                        </div>

                        <div className="flex justify-between text-sm text-green-600 mb-1">
                          <span>Total Discounts</span>

                          <span>-₹{Math.floor(total * 0.2)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium text-gray-700">
                          Order Total
                        </span>

                        <span className="font-bold text-xl text-[#4f7cac]">
                          ₹{Math.floor(total * 0.8)}
                        </span>
                      </div>

                      <motion.button
                        onClick={() => setCheckoutStep("payment")}
                        className="w-full py-3 bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!selectedAddress}
                      >
                        Deliver to this Address
                      </motion.button>
                    </div>
                  </div>
                )}

                {checkoutStep === "payment" && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-6 space-y-3">
                      <h3 className="font-medium text-gray-700 mb-3">
                        Choose Payment Method
                      </h3>

                      {/* Card */}
                      <div className="border rounded-lg">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-4"
                          onClick={() =>
                            setExpandedPayment(
                              expandedPayment === "card" ? "" : "card"
                            )
                          }
                        >
                          <span className="font-medium">
                            Credit / Debit / ATM Card
                          </span>
                          <span>{expandedPayment === "card" ? "▾" : "▸"}</span>
                        </button>
                        {expandedPayment === "card" && (
                          <div className="px-4 pb-4">
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                placeholder="Card Number"
                                className="col-span-2 p-3 border rounded-lg"
                              />
                              <input
                                placeholder="MM / YY"
                                className="p-3 border rounded-lg"
                              />
                              <input
                                placeholder="CVV"
                                className="p-3 border rounded-lg"
                              />
                            </div>

                            <button className="mt-3 w-full py-2 bg-[#fbbf24] text-black rounded-lg font-semibold">
                              Pay ₹{Math.floor(total * 0.8)}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* UPI */}
                      <div className="border rounded-lg">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-4"
                          onClick={() =>
                            setExpandedPayment(
                              expandedPayment === "upi" ? "" : "upi"
                            )
                          }
                        >
                          <span className="font-medium">UPI</span>
                          <span className="text-sm text-gray-500">
                            Pay by any UPI app
                          </span>
                          <span>{expandedPayment === "upi" ? "▾" : "▸"}</span>
                        </button>
                        {expandedPayment === "upi" && (
                          <div className="px-4 pb-4 space-y-3">
                            <div
                              className="border rounded-lg p-3"
                              onClick={() => setSelectedUpi("paytm")}
                            >
                              <label className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="upi-select"
                                    checked={selectedUpi === "paytm"}
                                    onChange={() => setSelectedUpi("paytm")}
                                  />
                                  <span className="font-medium">Paytm</span>
                                </div>
                                <img
                                  src="https://upload.wikimedia.org/wikipedia/commons/5/55/Paytm_logo.png"
                                  alt="Paytm"
                                  className="h-5"
                                />
                              </label>
                              {selectedUpi === "paytm" && (
                                <button className="mt-3 w-full py-2 bg-[#fbbf24] text-black rounded-lg font-semibold">
                                  Pay ₹{Math.floor(total * 0.8)}
                                </button>
                              )}
                            </div>

                            <div
                              className="border rounded-lg p-3"
                              onClick={() => setSelectedUpi("gpay")}
                            >
                              <label className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="upi-select"
                                    checked={selectedUpi === "gpay"}
                                    onChange={() => setSelectedUpi("gpay")}
                                  />
                                  <span className="font-medium">
                                    Google Pay
                                  </span>
                                </div>
                                <img
                                  src="https://upload.wikimedia.org/wikipedia/commons/5/5a/Google_Pay_Logo.svg"
                                  alt="GPay"
                                  className="h-5"
                                />
                              </label>
                              {selectedUpi === "gpay" && (
                                <button className="mt-3 w-full py-2 bg-[#fbbf24] text-black rounded-lg font-semibold">
                                  Pay ₹{Math.floor(total * 0.8)}
                                </button>
                              )}
                            </div>

                            <div
                              className="border rounded-lg p-3"
                              onClick={() => setSelectedUpi("phonepe")}
                            >
                              <label className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="upi-select"
                                    checked={selectedUpi === "phonepe"}
                                    onChange={() => setSelectedUpi("phonepe")}
                                  />
                                  <span className="font-medium">PhonePe</span>
                                </div>
                                <img
                                  src="https://upload.wikimedia.org/wikipedia/commons/2/2b/PhonePe_Logo.svg"
                                  alt="PhonePe"
                                  className="h-5"
                                />
                              </label>
                              {selectedUpi === "phonepe" && (
                                <button className="mt-3 w-full py-2 bg-[#fbbf24] text-black rounded-lg font-semibold">
                                  Pay ₹{Math.floor(total * 0.8)}
                                </button>
                              )}
                            </div>

                            <div
                              className="border rounded-lg p-3"
                              onClick={() => setSelectedUpi("custom")}
                            >
                              <label className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="upi-select"
                                  checked={selectedUpi === "custom"}
                                  onChange={() => setSelectedUpi("custom")}
                                />
                                <span className="font-medium">
                                  Add new UPI ID
                                </span>
                              </label>
                              {selectedUpi === "custom" && (
                                <div className="mt-2 flex gap-2">
                                  <input
                                    value={customUpiId}
                                    onChange={(e) =>
                                      setCustomUpiId(e.target.value)
                                    }
                                    placeholder="name@bank"
                                    className="flex-1 p-3 border rounded-lg"
                                  />
                                  <button className="px-4 py-2 bg-[#fbbf24] text-black rounded-lg font-semibold">
                                    Pay ₹{Math.floor(total * 0.8)}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* COD */}
                      <div className="border rounded-lg">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-4"
                          onClick={() =>
                            setExpandedPayment(
                              expandedPayment === "cod" ? "" : "cod"
                            )
                          }
                        >
                          <span className="font-medium">Cash on Delivery</span>
                          <span>{expandedPayment === "cod" ? "▾" : "▸"}</span>
                        </button>
                        {expandedPayment === "cod" && (
                          <div className="px-4 pb-4">
                            <button
                              className="w-full py-2 bg-[#7c3aed] text-white rounded-lg font-semibold"
                              onClick={() => {
                                setPaymentMethod("cod");
                                handleCheckout();
                              }}
                              disabled={isPlacingOrder}
                            >
                              Continue
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">
                        Price Details ({cart.length} Items)
                      </h3>

                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Total Product Price</span>

                        <span>₹{total}</span>
                      </div>

                      <div className="flex justify-between text-sm text-green-600 mb-1">
                        <span>Total Discounts</span>

                        <span>-₹{Math.floor(total * 0.2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-gray-700">
                        Order Total
                      </span>

                      <span className="font-bold text-xl text-[#4f7cac]">
                        ₹{Math.floor(total * 0.8)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Product Detail Modal */}

      {selectedProduct && (
        <motion.div
          className="fixed inset-0 bg-gray-300 bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}

            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex items-center z-10">
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 rounded-full hover:bg-gray-100 mr-2"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>

              <h2 className="text-xl font-bold text-[#4f7cac]">
                {selectedProduct.name}
              </h2>
            </div>

            {/* Product Content */}

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Product Image */}

                <div className="md:w-1/2">
                  <div className="bg-gray-100 rounded-lg overflow-hidden h-64 md:h-96">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Product Details */}

                <div className="md:w-1/2">
                  <div className="mb-6">
                    <span className="inline-block bg-[#f3e8ff] text-[#7c3aed] text-xs px-2 py-1 rounded-full mb-2">
                      {selectedProduct.category}
                    </span>

                    {selectedProduct.prescription && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full inline-flex items-center">
                        <FaFileUpload className="mr-1" size={10} /> Prescription
                        Required
                      </span>
                    )}

                    <h1 className="text-2xl font-bold text-gray-800 mt-2">
                      {selectedProduct.name}
                    </h1>

                    <div className="flex items-center mt-3">
                      <FaRupeeSign className="text-gray-600 mr-1" />

                      <span className="text-2xl font-bold">
                        {selectedProduct.price}
                      </span>

                      <span
                        className={`ml-4 text-xs px-2 py-1 rounded-full ${
                          selectedProduct.stock > 10
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedProduct.stock > 10 ? "In Stock" : "Low Stock"}
                      </span>
                    </div>
                  </div>

                  {/* Ayurvedic Specific Info */}

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Dosha Balance
                    </h3>

                    <p className="text-gray-600">
                      Balances: {selectedProduct.dosha}
                    </p>

                    <h3 className="font-semibold text-gray-800 mt-4 mb-2">
                      Key Benefits
                    </h3>

                    <p className="text-gray-600">{selectedProduct.benefits}</p>
                  </div>

                  {/* Quantity Selector */}

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Quantity
                    </h3>

                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          const currentQty = 1; // Default quantity for now

                          if (currentQty > 1) {
                            // Handle quantity change if needed
                          }
                        }}
                        className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-100"
                        disabled={true}
                      >
                        <FaMinus className="text-gray-600" />
                      </button>

                      <div className="px-4 py-2 border-t border-b border-gray-300 bg-gray-50">
                        1
                      </div>

                      <button
                        onClick={() => {
                          const currentQty = 1; // Default quantity for now

                          if (currentQty < selectedProduct.stock) {
                            // Handle quantity change if needed
                          }
                        }}
                        className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-100"
                        disabled={true}
                      >
                        <FaPlus className="text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      onClick={() => {
                        addToCart(selectedProduct, 1);

                        setSelectedProduct(null);
                      }}
                      className="flex-1 py-3 bg-[#f3e8ff] text-[#7c3aed] rounded-lg font-bold border border-[#7c3aed] hover:bg-[#e9d5ff] transition-colors flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaShoppingCart className="mr-2" />
                      Add to Cart
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        buyNow(selectedProduct);

                        setSelectedProduct(null);
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white rounded-lg font-bold shadow hover:shadow-md transition-all flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Buy Now
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Detailed Description */}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-bold text-[#4f7cac] mb-4">
                  Product Details
                </h3>

                <div className="prose max-w-none text-gray-600">
                  <p>
                    {selectedProduct.name} is a traditional Ayurvedic
                    formulation that has been used for centuries to promote{" "}
                    {selectedProduct.category.toLowerCase()}. This authentic
                    preparation follows ancient Ayurvedic texts to deliver
                    holistic benefits.
                  </p>

                  <h4 className="font-semibold mt-4">Key Ingredients:</h4>

                  <ul className="list-disc pl-5">
                    <li>Pure, organically grown herbs</li>

                    <li>No artificial additives or preservatives</li>

                    <li>Traditional preparation methods</li>
                  </ul>

                  <h4 className="font-semibold mt-4">Recommended Usage:</h4>

                  <p>
                    Take 1-2 tablets/capsules twice daily with warm water or as
                    directed by your Ayurvedic practitioner. Best taken after
                    meals for optimal absorption.
                  </p>

                  <h4 className="font-semibold mt-4">Safety Information:</h4>

                  <p>
                    Consult your doctor before use if you are pregnant, nursing,
                    or taking any medications. Store in a cool, dry place away
                    from direct sunlight.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Order Success Modal */}

      {showOrderSuccess && (
        <div className="fixed inset-0 bg-purple-100 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl shadow-gray-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Order Placed Successfully!
            </h2>

            <p className="text-gray-600 mb-6">
              Thank you for choosing Ayurveda!
            </p>

            <button
              onClick={() => setShowOrderSuccess(false)}
              className="px-6 py-2 bg-[#7c3aed] text-white rounded-lg font-medium hover:bg-[#6d28d9] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Address Form Modal */}

      {showAddressForm && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 z-30 flex items-center justify-center p-4 pt-32">
          <div className="bg-white rounded-xl w-full max-h-[80vh] overflow-y-auto shadow-lg shadow-gray-300">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#4f7cac] mb-4">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  const formData = {
                    name: e.target.name.value,

                    address: e.target.address.value,

                    phone: e.target.phone.value,

                    city: e.target.city.value,

                    state: e.target.state.value,

                    pincode: e.target.pincode.value,

                    type: e.target.type?.value || "home",

                    isDefault: e.target.isDefault.checked,
                  };

                  console.log("Form submitted with data:", formData);

                  handleSaveAddress(formData);
                }}
              >
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    defaultValue={editingAddress?.name || ""}
                    placeholder="Enter your full name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f7cac] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Street Address <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    name="address"
                    defaultValue={editingAddress?.address || ""}
                    placeholder="Enter your complete street address, apartment number, building name, etc."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f7cac] focus:border-transparent transition-all resize-none"
                    rows="3"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingAddress?.phone || ""}
                    placeholder="Enter 10-digit mobile number"
                    pattern="[0-9]{10}"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f7cac] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      City <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="city"
                      defaultValue={editingAddress?.city || ""}
                      placeholder="City name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f7cac] focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      State <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="state"
                      defaultValue={editingAddress?.state || ""}
                      placeholder="State name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f7cac] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Pincode <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    defaultValue={editingAddress?.pincode || ""}
                    placeholder="6-digit pincode"
                    pattern="[0-9]{6}"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f7cac] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Type{" "}
                    <span className="text-gray-400 text-sm">(Optional)</span>
                  </label>

                  <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="home"
                        defaultChecked={
                          editingAddress?.type === "home" || false
                        }
                        className="mr-2 w-4 h-4 text-[#4f7cac] border-gray-300 focus:ring-[#4f7cac] focus:ring-2"
                      />

                      <span className="text-gray-700">Home</span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="work"
                        defaultChecked={
                          editingAddress?.type === "work" || false
                        }
                        className="mr-2 w-4 h-4 text-[#4f7cac] border-gray-300 focus:ring-[#4f7cac] focus:ring-2"
                      />

                      <span className="text-gray-700">Work</span>
                    </label>
                  </div>
                </div>

                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    defaultChecked={editingAddress?.isDefault || false}
                    className="mr-3 w-4 h-4 text-[#4f7cac] border-gray-300 rounded focus:ring-[#4f7cac] focus:ring-2"
                  />

                  <label
                    htmlFor="isDefault"
                    className="text-gray-700 font-medium cursor-pointer"
                  >
                    Set as default address
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg font-medium"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AyurvedicStore;
