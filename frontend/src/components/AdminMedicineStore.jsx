import { useState } from "react";
import { PlusIcon, UserIcon } from "@heroicons/react/24/outline";

const AddProductModal = ({ onClose, onAddProduct }) => {
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    prescription: false,
    dosha: "",
    benefits: "",
    description: "",
    manufacturer: "",
    image: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock function - just add to local state since backend is removed
    onAddProduct(productData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-purple-100 bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-xl p-6 bg-white w-2/3 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Add New Product</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Product Name
              </label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={productData.name}
                onChange={(e) =>
                  setProductData({ ...productData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price (₹)
              </label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={productData.price}
                onChange={(e) =>
                  setProductData({ ...productData, price: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock Quantity
              </label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={productData.stock}
                onChange={(e) =>
                  setProductData({ ...productData, stock: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={productData.category}
                onChange={(e) =>
                  setProductData({ ...productData, category: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dosha
              </label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={productData.dosha}
                onChange={(e) =>
                  setProductData({ ...productData, dosha: e.target.value })
                }
                placeholder="e.g., Vata-Kapha, All Doshas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Benefits
              </label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={productData.benefits}
                onChange={(e) =>
                  setProductData({ ...productData, benefits: e.target.value })
                }
                rows="2"
                placeholder="e.g., Reduces stress, improves sleep"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={productData.description}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    description: e.target.value,
                  })
                }
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Manufacturer
              </label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={productData.manufacturer}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    manufacturer: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="prescription"
                className="mr-2"
                checked={productData.prescription}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    prescription: e.target.checked,
                  })
                }
              />
              <label
                htmlFor="prescription"
                className="text-sm font-medium text-gray-700"
              >
                Requires Prescription
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Product Image
              </label>
              <input
                type="file"
                className="mt-1 block w-[88px] text-sm text-gray-500 bg-purple-300 rounded-xl p-2"
                onChange={(e) =>
                  setProductData({ ...productData, image: e.target.files[0] })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 bottom-0 bg-white p-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#a78bfa] text-white rounded-md"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminMedicineStore = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Triphala",
      description: "Traditional Ayurvedic formula for digestion",
      price: 199,
      category: "Digestion",
      stock: 75,
      image: "https://via.placeholder.com/150",
      prescription: false,
      dosha: "Vata",
      benefits: "Improves digestion, detoxifies body",
      manufacturer: "Ayurveda Pharma",
      expiryDate: "2026-12-31",
      isActive: true,
    },
    {
      id: 2,
      name: "Ashwagandha",
      description: "Natural stress reliever and energy booster",
      price: 299,
      category: "Immunity",
      stock: 50,
      image: "https://via.placeholder.com/150",
      prescription: false,
      dosha: "Kapha",
      benefits: "Reduces stress, boosts immunity",
      manufacturer: "Herbal Health",
      expiryDate: "2026-10-31",
      isActive: true,
    },
    {
      id: 3,
      name: "Tulsi",
      description: "Holy basil for respiratory health",
      price: 149,
      category: "Respiratory",
      stock: 100,
      image: "https://via.placeholder.com/150",
      prescription: false,
      dosha: "Pitta",
      benefits: "Improves breathing, reduces cough",
      manufacturer: "Natural Remedies",
      expiryDate: "2026-11-30",
      isActive: true,
    },
    {
      id: 4,
      name: "Turmeric",
      description: "Golden spice with powerful anti-inflammatory properties",
      price: 179,
      category: "Immunity",
      stock: 120,
      image: "https://via.placeholder.com/150",
      prescription: false,
      dosha: "All Doshas",
      benefits: "Anti-inflammatory, boosts immunity, improves skin",
      manufacturer: "Ayurveda Pharma",
      expiryDate: "2026-09-30",
      isActive: true,
    },
    {
      id: 5,
      name: "Ginger",
      description: "Natural remedy for nausea and digestive issues",
      price: 89,
      category: "Digestion",
      stock: 85,
      image: "https://via.placeholder.com/150",
      prescription: false,
      dosha: "Vata",
      benefits: "Relieves nausea, improves digestion, reduces inflammation",
      manufacturer: "Herbal Health",
      expiryDate: "2026-08-31",
      isActive: true,
    },
    {
      id: 6,
      name: "Neem",
      description: "Natural blood purifier and skin health booster",
      price: 159,
      category: "Skin Care",
      stock: 60,
      image: "https://via.placeholder.com/150",
      prescription: false,
      dosha: "Pitta",
      benefits: "Blood purification, skin health, dental care",
      manufacturer: "Natural Remedies",
      expiryDate: "2026-10-15",
      isActive: true,
    },
    {
      id: 7,
      name: "Amla",
      description: "Indian gooseberry rich in Vitamin C",
      price: 129,
      category: "Immunity",
      stock: 90,
      image: "https://via.placeholder.com/150",
      prescription: false,
      dosha: "Vata-Pitta",
      benefits: "High Vitamin C, hair health, immunity booster",
      manufacturer: "Ayurveda Pharma",
      expiryDate: "2026-11-15",
      isActive: true,
    },
    {
      id: 8,
      name: "Brahmi",
      description: "Brain tonic for memory and cognitive function",
      price: 249,
      category: "Brain Health",
      stock: 40,
      image: "https://via.placeholder.com/150",
      prescription: false,
      dosha: "Vata",
      benefits: "Improves memory, reduces anxiety, brain tonic",
      manufacturer: "Herbal Health",
      expiryDate: "2026-12-15",
      isActive: true,
    },
    {
      id: 9,
      name: "Shatavari",
      description: "Women's health tonic and adaptogen",
      price: 199,
      category: "Women's Health",
      stock: 55,
      image: "https://via.placeholder.com/150",
      prescription: false,
      dosha: "Vata-Pitta",
      benefits: "Hormonal balance, reproductive health, stress relief",
      manufacturer: "Natural Remedies",
      expiryDate: "2026-10-30",
      isActive: true,
    },
    {
      id: 10,
      name: "Guggulu",
      description: "Natural cholesterol and weight management",
      price: 189,
      category: "Weight Management",
      stock: 35,
      image: "https://via.placeholder.com/150",
      prescription: false,
      dosha: "Kapha",
      benefits: "Cholesterol management, weight loss, joint health",
      manufacturer: "Ayurveda Pharma",
      expiryDate: "2026-09-15",
      isActive: true,
    },
  ]);

  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: "ORD-001",
      customerName: "Rahul Sharma",
      customerEmail: "rahul@example.com",
      totalAmount: 398,
      status: "Delivered",
      orderDate: "2025-08-30",
      deliveryAddress: "123 Main St, Mumbai",
      items: [
        { productName: "Triphala", quantity: 1, price: 199 },
        { productName: "Ashwagandha", quantity: 1, price: 199 },
      ],
    },
    {
      id: 2,
      orderNumber: "ORD-002",
      customerName: "Priya Patel",
      customerEmail: "priya@example.com",
      totalAmount: 149,
      status: "Processing",
      orderDate: "2025-08-31",
      deliveryAddress: "456 Oak Ave, Delhi",
      items: [{ productName: "Tulsi", quantity: 1, price: 149 }],
    },
  ]);

  const [dashboardStats] = useState({
    totalProducts: 10,
    totalOrders: 2,
    totalRevenue: 547,
    lowStockProducts: 2,
    pendingOrders: 1,
    completedOrders: 1,
  });

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedTab, setSelectedTab] = useState("products");

  const handleAddProduct = (newProduct) => {
    // Mock function - just add to local state since backend is removed
    const productWithId = { ...newProduct, id: Date.now() };
    setProducts([...products, productWithId]);
    alert("Product added successfully (mock data)");
  };

  const handleDeleteProduct = (productId) => {
    // Mock function - just remove from local state since backend is removed
    setProducts(products.filter((p) => p.id !== productId));
    alert("Product deleted successfully (mock data)");
  };

  const handleUpdateStock = (productId, newStock) => {
    // Mock function - just update local state since backend is removed
    setProducts(
      products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
    alert("Stock updated successfully (mock data)");
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    // Mock function - just update local state since backend is removed
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    alert("Order status updated successfully (mock data)");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage your medicine store</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#a78bfa] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#8b5cf6]"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Products
            </h3>
            <p className="text-3xl font-bold text-[#a78bfa]">
              {dashboardStats.totalProducts}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Orders
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {dashboardStats.totalOrders}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Revenue
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              ₹{dashboardStats.totalRevenue}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Low Stock Items
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {dashboardStats.lowStockProducts}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setSelectedTab("products")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === "products"
                    ? "border-[#a78bfa] text-[#a78bfa]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setSelectedTab("orders")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === "orders"
                    ? "border-[#a78bfa] text-[#a78bfa]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Orders
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Products Tab */}
            {selectedTab === "products" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Products
                  </h2>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="bg-[#a78bfa] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#8b5cf6]"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Add Product
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ₹{product.price}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {product.category}
                      </p>
                      <p className="text-sm text-gray-500 mb-3">
                        Stock: {product.stock}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newStock = prompt(
                              `Enter new stock for ${product.name}:`,
                              product.stock
                            );
                            if (newStock !== null) {
                              handleUpdateStock(product.id, parseInt(newStock));
                            }
                          }}
                          className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                        >
                          Update Stock
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete ${product.name}?`
                              )
                            ) {
                              handleDeleteProduct(product.id);
                            }
                          }}
                          className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {selectedTab === "orders" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Orders
                </h2>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.customerName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.customerEmail}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{order.totalAmount}
                          </p>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order.id, e.target.value)
                          }
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddProduct && (
        <AddProductModal
          onClose={() => setShowAddProduct(false)}
          onAddProduct={handleAddProduct}
        />
      )}
    </div>
  );
};

export default AdminMedicineStore;
