import React, { useState } from "react";
import { Link } from "react-router-dom";
import log from "../assets/log.png";

// Import medicine images
import ashwagandhaImg from "../assets/ayurvedic/ashwagandha.jpg";
import triphalaImg from "../assets/ayurvedic/triphala.jpg";
import brahmiImg from "../assets/ayurvedic/brahmi.jpg";
import giloyImg from "../assets/ayurvedic/giloy.jpg";
import neemImg from "../assets/ayurvedic/neem.jpg";
import turmericImg from "../assets/ayurvedic/turmeric.jpg";
import shilajitImg from "../assets/ayurvedic/shilajit.jpg";
import guggulImg from "../assets/ayurvedic/guggul.jpg";

const SimpleMedicineStore = () => {
  // HARDCODED PRODUCTS - NO API CALLS
  const products = [
    {
      id: 1,
      name: "Ashwagandha",
      price: 299,
      image: ashwagandhaImg,
      category: "Stress Relief",
      dosha: "Vata-Kapha",
      benefits: "Reduces stress, improves sleep, boosts immunity"
    },
    {
      id: 2,
      name: "Triphala",
      price: 199,
      image: triphalaImg,
      category: "Digestion",
      dosha: "All Doshas",
      benefits: "Improves digestion, detoxifies body"
    },
    {
      id: 3,
      name: "Brahmi",
      price: 249,
      image: brahmiImg,
      category: "Brain Health",
      dosha: "Vata-Pitta",
      benefits: "Enhances memory, improves concentration"
    },
    {
      id: 4,
      name: "Giloy",
      price: 179,
      image: giloyImg,
      category: "Immunity",
      dosha: "All Doshas",
      benefits: "Boosts immunity, fights infections"
    },
    {
      id: 5,
      name: "Neem",
      price: 159,
      image: neemImg,
      category: "Skin Health",
      dosha: "Pitta-Kapha",
      benefits: "Purifies blood, treats skin conditions"
    },
    {
      id: 6,
      name: "Turmeric",
      price: 129,
      image: turmericImg,
      category: "Anti-inflammatory",
      dosha: "All Doshas",
      benefits: "Reduces inflammation, antioxidant"
    },
    {
      id: 7,
      name: "Shilajit",
      price: 399,
      image: shilajitImg,
      category: "Energy & Vitality",
      dosha: "Vata",
      benefits: "Boosts energy, enhances stamina"
    },
    {
      id: 8,
      name: "Guggul",
      price: 229,
      image: guggulImg,
      category: "Cholesterol Management",
      dosha: "Kapha",
      benefits: "Lowers cholesterol, supports weight loss"
    }
  ];

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const addToCart = (product) => {
    setCart(prev => [...prev, { ...product, quantity: 1 }]);
    alert(`${product.name} added to cart!`);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-100 shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/home" className="text-purple-800 font-medium">
            ← Home
          </Link>
          <img src={log} alt="WeCure Logo" className="h-12" />
          <div className="text-purple-800 font-medium">
            Cart ({cart.length})
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
          Our Ayurvedic Medicine Store
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Authentic Ayurvedic formulations for holistic wellness
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Search medicines..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Products Count */}
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-green-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {product.category} • {product.dosha}
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  {product.benefits}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-purple-600">
                    ₹{product.price}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Products Message */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-xl">No products found</p>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleMedicineStore;
