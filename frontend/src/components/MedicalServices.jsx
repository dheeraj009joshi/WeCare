import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHospital, FaUserMd, FaClock, FaMoneyBillWave, FaStar } from 'react-icons/fa';

const MedicalServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/services');
      const data = await response.json();
      
      if (data.services) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(services.map(service => service.category))];
  
  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Medical Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our comprehensive medical services. Each service automatically shows 
            available doctors based on their specializations and availability.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {category === 'all' ? 'All Services' : category}
            </button>
          ))}
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Service Image */}
              {service.image && (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Service Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {service.category}
                  </span>
                  <div className="flex items-center text-yellow-400">
                    <FaStar className="w-4 h-4" />
                    <span className="ml-1 text-sm text-gray-600">4.8</span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {service.description}
                </p>

                {/* Service Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMoneyBillWave className="w-4 h-4 mr-2" />
                    <span className="font-medium">₹{service.price}</span>
                  </div>
                  
                  {service.duration && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="w-4 h-4 mr-2" />
                      <span>{service.duration} minutes</span>
                    </div>
                  )}
                </div>

                {/* Available Doctors */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUserMd className="w-4 h-4 mr-2" />
                      <span className="font-medium">{service.availableDoctors}</span>
                      <span className="ml-1">doctors available</span>
                    </div>
                  </div>

                  {/* Doctor List */}
                  {service.doctors && service.doctors.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {service.doctors.slice(0, 3).map((doctor) => (
                        <div
                          key={doctor.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              Dr. {doctor.name}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {doctor.specializations?.join(', ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-600">
                              ₹{doctor.consultationFee}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {doctor.experience} years exp
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {service.doctors.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{service.doctors.length - 3} more doctors
                        </p>
                      )}
                    </div>
                  )}

                  {/* Book Appointment Button */}
                  <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
                    Book Appointment
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Services Message */}
        {filteredServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FaHospital className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-600">
              {selectedCategory === 'all' 
                ? 'No services are currently available.'
                : `No services found in the ${selectedCategory} category.`
              }
            </p>
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-blue-50 rounded-lg p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Service Creation</h3>
              <p className="text-blue-800 text-sm">
                Services are created with specific medical specializations and requirements
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Automatic Matching</h3>
              <p className="text-blue-800 text-sm">
                Doctors are automatically matched based on their specializations and availability
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Real-time Updates</h3>
              <p className="text-blue-800 text-sm">
                Available doctors are shown in real-time for each service
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MedicalServices;
