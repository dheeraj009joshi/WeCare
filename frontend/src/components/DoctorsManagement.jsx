import { PlusIcon, UserCircleIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const DoctorsManagement = () => {
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: 'Dr. Sharma',
      specialty: 'Physician',
      phone: '+91 9876543210',
      status: 'Active',
      consultations: 45,
    },
    {
      id: 2,
      name: 'Dr. Rajesh Kumar',
      specialty: 'Mental Health',
      phone: '+91 8765432109',
      status: 'Active',
      consultations: 32,
    },
    {
      id: 3,
      name: 'Dr. Anita Singh',
      specialty: 'General Medicine',
      phone: '+91 7654321098',
      status: 'Pending',
      consultations: 0,
    }
  ]);

  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: '',
    phone: ''
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoctors = doctors.filter(doctor => {
    const matchesFilter = filter === 'All' || doctor.status === filter;
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const addDoctor = () => {
    const doctor = {
      id: doctors.length + 1,
      ...newDoctor,
      status: 'Pending',
      consultations: 0
    };
    setDoctors([...doctors, doctor]);
    setShowAddModal(false);
    setNewDoctor({ name: '', specialty: '', phone: '' });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#a78bfa]">Doctors Management</h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search doctors..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 bg-[#a78bfa] text-white px-4 py-2 rounded-lg hover:bg-[#997dec]"
          >
            <PlusIcon className="w-5 h-5" />
            Add Doctor
          </button>
        </div>
      </div>

      {/* Doctors List */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 mb-8">
        <div className="grid grid-cols-12 bg-gray-100 p-4 font-medium text-gray-700">
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Specialty</div>
          <div className="col-span-3">Phone Number</div>
          <div className="col-span-2 text-center">Consultations</div>
          <div className="col-span-2">Status</div>
        </div>
        
        {filteredDoctors.map(doctor => (
          <div key={doctor.id} className="grid grid-cols-12 p-4 border-b items-center hover:bg-gray-50">
            <div className="col-span-3 flex items-center gap-3">
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              <span>{doctor.name}</span>
            </div>
            <div className="col-span-2 text-gray-600">{doctor.specialty}</div>
            <div className="col-span-3 text-gray-600">{doctor.phone}</div>
            <div className="col-span-2 text-center font-medium">{doctor.consultations}</div>
            <div className="col-span-2">
              <span className={`text-sm px-2 py-1 rounded ${
                doctor.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {doctor.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Doctors Summary */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-[#a78bfa]">Active Doctors Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {doctors
            .filter(d => d.status === 'Active')
            .map(doctor => (
              <div key={doctor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {doctor.consultations} consults
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{doctor.phone}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-[#a78bfa]">Add New Doctor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 mt-1"
                  placeholder="Dr. Firstname Lastname"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Specialty</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 mt-1"
                  placeholder="Cardiology, Neurology, etc."
                  value={newDoctor.specialty}
                  onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  className="w-full border rounded p-2 mt-1"
                  placeholder="+91 9876543210"
                  value={newDoctor.phone}
                  onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={addDoctor}
                className="px-4 py-2 bg-[#a78bfa] text-white rounded-lg hover:bg-[#987fe3]"
              >
                Add Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsManagement;