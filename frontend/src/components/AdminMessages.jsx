import { useState } from 'react';
import { FaEnvelope, FaClock, FaUser, FaBuilding, FaRupeeSign, FaCalendarAlt, FaSearch, FaFilter, FaCheck, FaTimes, FaEye } from 'react-icons/fa';

const AdminMessages = () => {
  const [activeTab, setActiveTab] = useState('advertisements');
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Sample data for advertisement requests
  const advertisementRequests = [
    {
      id: 1,
      company: 'Food Express',
      contact: 'john@foodexpress.com',
      budget: '₹50,000',
      duration: '30 days',
      message: 'We want to advertise our new food delivery service on your platform. Targeting health-conscious audience.',
      status: 'pending',
      date: '2024-01-15'
    },
    {
      id: 2,
      company: 'Healthy Bites',
      contact: 'sarah@healthybites.com',
      budget: '₹75,000',
      duration: '45 days',
      message: 'Interested in banner ads for our organic food products. Looking for prime placement on homepage.',
      status: 'approved',
      date: '2024-01-14'
    },
    {
      id: 3,
      company: 'FitLife Supplements',
      contact: 'mark@fitlife.com',
      budget: '₹1,20,000',
      duration: '60 days',
      message: 'Promotional campaign for our new protein supplements. Want to reach fitness enthusiasts.',
      status: 'rejected',
      date: '2024-01-13'
    }
  ];

  // Sample data for career requests
  const careerRequests = [
    {
      id: 1,
      name: 'Raj Sharma',
      email: 'raj.sharma@email.com',
      position: 'Senior Nutritionist',
      experience: '5 years',
      message: 'I have extensive experience in clinical nutrition and would love to join your team to help patients with dietary plans.',
      status: 'pending',
      date: '2024-01-15',
      resume: 'raj_sharma_cv.pdf'
    },
    {
      id: 2,
      name: 'Priya Patel',
      email: 'priya.patel@email.com',
      position: 'Food Safety Officer',
      experience: '3 years',
      message: 'Certified food safety professional with experience in healthcare settings. Interested in ensuring food quality standards.',
      status: 'reviewed',
      date: '2024-01-14',
      resume: 'priya_patel_resume.pdf'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      email: 'amit.kumar@email.com',
      position: 'Dietitian',
      experience: '2 years',
      message: 'Recently certified dietitian looking to start my career in healthcare nutrition services.',
      status: 'pending',
      date: '2024-01-13',
      resume: 'amit_kumar_cv.pdf'
    }
  ];

  
  
  const handleViewDetails = (message, type) => {
    setSelectedMessage({ ...message, type });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Messages & Requests</h1>
          <p className="text-gray-600">Manage advertisement and career requests</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('advertisements')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'advertisements'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaBuilding className="inline mr-2" />
            Advertisement Requests ({advertisementRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('careers')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'careers'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaUser className="inline mr-2" />
            Career Requests ({careerRequests.length})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  {activeTab === 'advertisements' ? 'Advertisement Requests' : 'Career Applications'}
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <FaFilter />
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {(activeTab === 'advertisements' ? advertisementRequests : careerRequests).map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(item, activeTab)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {activeTab === 'advertisements' ? item.company : item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {activeTab === 'advertisements' ? item.contact : item.email}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">{item.message}</p>
                    </div>
                    
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {item.date}
                      </span>
                      {activeTab === 'advertisements' ? (
                        <span className="flex items-center">
                          <FaRupeeSign className="mr-1" />
                          {item.budget}
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <FaClock className="mr-1" />
                          {item.experience}
                        </span>
                      )}
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Request Details</h2>
            </div>
            
            <div className="p-6">
              {selectedMessage ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {selectedMessage.type === 'advertisements' 
                        ? selectedMessage.company 
                        : selectedMessage.name
                      }
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {selectedMessage.type === 'advertisements' 
                        ? selectedMessage.contact 
                        : selectedMessage.email
                      }
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <p className="text-gray-900">{selectedMessage.date}</p>
                      </div>
                    </div>

                    {selectedMessage.type === 'advertisements' && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Budget</label>
                          <p className="text-gray-900">{selectedMessage.budget}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Duration</label>
                          <p className="text-gray-900">{selectedMessage.duration}</p>
                        </div>
                      </div>
                    )}

                    {selectedMessage.type === 'careers' && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Position</label>
                          <p className="text-gray-900">{selectedMessage.position}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Experience</label>
                          <p className="text-gray-900">{selectedMessage.experience}</p>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Message</label>
                      <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
                        {selectedMessage.message}
                      </p>
                    </div>

                    {selectedMessage.type === 'careers' && selectedMessage.resume && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Resume</label>
                        <a
                          href={`/resumes/${selectedMessage.resume}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaEye className="mr-2" />
                          View Resume
                        </a>
                      </div>
                    )}
                  </div>

                  
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaEnvelope className="mx-auto text-gray-400 text-4xl mb-4" />
                  <p className="text-gray-500">Select a request to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;