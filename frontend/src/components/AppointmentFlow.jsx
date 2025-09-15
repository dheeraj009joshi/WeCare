import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";
import Notification from "./Notification";
import { appointmentsAPI, doctorsAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';

function AppointmentFlow() {
  const { doctorName } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Main view states: 'dashboard', 'create', 'edit'
  const [currentView, setCurrentView] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create/Edit appointment states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({ symptoms: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    // Auto-dismiss after 5 seconds for success messages
    if (type === 'success') {
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  }, []);

  const fetchUserAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getUserAppointments();
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllDoctors = useCallback(async () => {
    try {
      // Only fetch active doctors for appointment booking
      const params = {
        is_active: true,
        limit: 50 // Get up to 50 doctors
      };
      const response = await doctorsAPI.getAllDoctors(params);
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  }, []);

  const fetchDoctorForBooking = useCallback(async () => {
    try {
      setLoading(true);
      const response = await doctorsAPI.getAllDoctors();
      const doctorData = response.data.find(doc => 
        doc.full_name?.toLowerCase().includes(decodeURIComponent(doctorName).toLowerCase()) ||
        doc.name?.toLowerCase().includes(decodeURIComponent(doctorName).toLowerCase())
      );
      
      if (doctorData) {
        setDoctor(doctorData);
      } else {
        setError('Doctor not found');
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      setError('Failed to load doctor information');
    } finally {
      setLoading(false);
    }
  }, [doctorName]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (doctorName) {
      // If doctorName param exists, go to create view with that doctor
      setCurrentView('create');
      fetchDoctorForBooking();
    } else {
      // Default to dashboard view
      setCurrentView('dashboard');
      fetchUserAppointments();
      fetchAllDoctors();
    }
  }, [doctorName, isAuthenticated, navigate, fetchUserAppointments, fetchAllDoctors, fetchDoctorForBooking]);

  const fetchAvailableSlots = useCallback(async () => {
    if (!doctor || !selectedDate) return;
    
    try {
      setSlotsLoading(true);
      const doctorId = doctor._id || doctor.id;
      const response = await appointmentsAPI.getDoctorAvailableSlots(doctorId, selectedDate);
      setAvailableSlots(response.data.available_slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [doctor, selectedDate]);

  useEffect(() => {
    if (doctor && selectedDate && (currentView === 'create' || currentView === 'edit')) {
      fetchAvailableSlots();
    }
  }, [doctor, selectedDate, currentView, fetchAvailableSlots]);

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedSlot || !formData.symptoms.trim()) {
      showNotification('Please select a time slot and describe your symptoms', 'warning');
      return;
    }

    try {
      setFormLoading(true);
      
      const appointmentData = {
        doctor_id: doctor._id || doctor.id,
        appointment_date: selectedDate,
        appointment_time: selectedSlot,
        symptoms: formData.symptoms.trim(),
        consultation_fee: parseFloat(doctor.consultation_fee) || 500
      };

      console.log('Booking appointment with data:', appointmentData);
      const response = await appointmentsAPI.bookAppointment(appointmentData);
      console.log('Booking response:', response);
      
      // Check if the response indicates success
      if (response && (response.status === 200 || response.status === 201)) {
        showNotification('🎉 Appointment booked successfully! You will receive a confirmation shortly.', 'success');
        resetForm();
        // Navigate immediately but refresh data in background
        setCurrentView('dashboard');
        fetchUserAppointments();
      } else {
        // Handle unexpected response format
        console.error('Unexpected response format:', response);
        showNotification('✅ Appointment booked successfully!', 'success');
        setCurrentView('dashboard');
        fetchUserAppointments();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to book appointment';
      showNotification(errorMessage, 'error');
      // Don't redirect on error - stay on the form
    } finally {
      setFormLoading(false);
    }
  };

  const handleRescheduleAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedSlot || !selectedAppointment) {
      showNotification('Please select a new time slot', 'warning');
      return;
    }

    try {
      setFormLoading(true);
      
      const rescheduleData = {
        appointment_date: selectedDate,
        appointment_time: selectedSlot,
        symptoms: formData.symptoms.trim() || selectedAppointment.symptoms
      };

      console.log('Rescheduling appointment:', selectedAppointment.id, 'with data:', rescheduleData);
      const response = await appointmentsAPI.rescheduleAppointment(selectedAppointment.id, rescheduleData);
      console.log('Reschedule response:', response);
      
      if (response && response.status === 200) {
        showNotification('🎉 Appointment rescheduled successfully!', 'success');
        resetForm();
        // Navigate immediately but refresh data in background
        setCurrentView('dashboard');
        fetchUserAppointments();
      } else {
        // Handle unexpected response format
        console.error('Unexpected reschedule response format:', response);
        showNotification('✅ Appointment rescheduled successfully!', 'success');
        setCurrentView('dashboard');
        fetchUserAppointments();
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to reschedule appointment';
      showNotification(errorMessage, 'error');
      // Don't redirect on error - stay on the form
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    // Simple confirmation without browser confirm - you could implement a custom modal here
    const shouldCancel = window.confirm('Are you sure you want to cancel this appointment?');
    if (!shouldCancel) return;

    try {
      console.log('Cancelling appointment with ID:', appointmentId);
      const result = await appointmentsAPI.cancelAppointment(appointmentId);
      console.log('Cancel result:', result);
      showNotification('Appointment cancelled successfully', 'success');
      fetchUserAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to cancel appointment';
      showNotification(errorMessage, 'error');
    }
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    
    // Find the doctor for this appointment
    const appointmentDoctor = doctors.find(doc => 
      (doc._id || doc.id) === appointment.doctor_id
    );
    
    if (appointmentDoctor) {
      setDoctor(appointmentDoctor);
      setSelectedDate(appointment.appointment_date.split('T')[0]);
      setSelectedSlot(appointment.appointment_time);
      setFormData({ symptoms: appointment.symptoms || '' });
      setCurrentView('edit');
    } else {
      showNotification('Doctor information not found for this appointment', 'error');
    }
  };

  const resetForm = () => {
    setDoctor(null);
    setSelectedAppointment(null);
    setSelectedSlot(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setFormData({ symptoms: '' });
    setAvailableSlots([]);
  };

  const getNext7Days = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return days;
  }, []);

  const formatDate = (dateStr) => {
    const dateOnly = dateStr.split('T')[0];
    const date = new Date(dateOnly + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  🩺 Appointment Portal
                </h1>
                <p className="text-gray-600">
                  Manage all your medical appointments in one place
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('create')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                + New Appointment
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { title: 'Total Appointments', count: appointments.length, icon: '📅', color: 'blue' },
              { title: 'Upcoming', count: appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length, icon: '⏰', color: 'green' },
              { title: 'Completed', count: appointments.filter(a => a.status === 'completed').length, icon: '✅', color: 'purple' },
              { title: 'Cancelled', count: appointments.filter(a => a.status === 'cancelled').length, icon: '❌', color: 'red' }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.count}</p>
                  </div>
                  <div className="text-4xl">{stat.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Appointments List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Your Appointments</h2>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-8xl mb-4">📅</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">No appointments yet</h3>
                <p className="text-gray-600 mb-8">Book your first appointment with our doctors</p>
                <button
                  onClick={() => setCurrentView('create')}
                  className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Book Your First Appointment
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {appointments.map((appointment, index) => (
                  <motion.div
                    key={appointment._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-8 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-6">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                          👨‍⚕️
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-800">
                              Dr. {appointment.doctor_name || appointment.doctor_full_name || 'Unknown Doctor'}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                          
                          <p className="text-purple-600 mb-3">{appointment.doctor_specialization}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-medium text-gray-800">{formatDate(appointment.appointment_date)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Time</p>
                              <p className="font-medium text-gray-800">{appointment.appointment_time}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Fee</p>
                              <p className="font-medium text-green-600">₹{appointment.consultation_fee}</p>
                            </div>
                          </div>

                          {appointment.symptoms && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-500">Symptoms</p>
                              <p className="text-gray-700">{appointment.symptoms}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-6">
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <>
                            <button
                              onClick={() => handleEditAppointment(appointment)}
                              className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Create/Edit Appointment Form
  const isEditing = currentView === 'edit';
  const availableDates = getNext7Days;

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => {
            resetForm();
            setCurrentView('dashboard');
          }}
          className="mb-6 text-purple-600 hover:text-purple-800 flex items-center transition-colors"
        >
          ← Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isEditing ? 'Reschedule Appointment' : 'Book New Appointment'}
            </h2>
            <p className="text-gray-600">
              {isEditing ? 'Update your appointment details' : 'Schedule your consultation'}
            </p>
          </div>

          {/* Doctor Selection for Create */}
          {!isEditing && !doctor && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Choose Your Doctor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map(doc => (
                  <div
                    key={doc._id || doc.id}
                    onClick={() => setDoctor(doc)}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-purple-400 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">👨‍⚕️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">
                          {doc.full_name || doc.name}
                        </h4>
                        <p className="text-purple-600 font-medium mb-2">{doc.specialization}</p>
                        {doc.bio && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {doc.bio.length > 80 ? `${doc.bio.substring(0, 80)}...` : doc.bio}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              {doc.experience_years ? `${doc.experience_years} years exp.` : doc.experience ? `${doc.experience} years exp.` : 'Experienced doctor'}
                            </p>
                            {doc.qualification && doc.qualification.length > 0 && (
                              <p className="text-xs text-gray-500 mb-1">
                                {doc.qualification.slice(0, 2).join(', ')}
                                {doc.qualification.length > 2 && '...'}
                              </p>
                            )}
                            {doc.clinic_address && (
                              <p className="text-xs text-gray-500 truncate max-w-32">
                                📍 {doc.clinic_address}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              ₹{doc.consultation_fee || 500}
                            </p>
                            <p className="text-xs text-gray-500">consultation fee</p>
                            {doc.is_verified && (
                              <p className="text-xs text-blue-600 mt-1">
                                ✓ Verified
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                            Select Doctor
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {doctors.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👨‍⚕️</div>
                  <p className="text-gray-500 text-lg">No doctors available at the moment</p>
                </div>
              )}
            </div>
          )}

          {/* Doctor Information */}
          {doctor && (
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {isEditing ? 'Current Doctor' : 'Selected Doctor'}
              </h3>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {doctor.full_name || doctor.name}
                  </h4>
                  <p className="text-purple-600">{doctor.specialization}</p>
                  <p className="text-green-600 font-medium">₹{doctor.consultation_fee || 500} consultation fee</p>
                </div>
              </div>
            </div>
          )}

          {doctor && (
            <form onSubmit={isEditing ? handleRescheduleAppointment : handleCreateAppointment} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Select Date</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {availableDates.map(date => (
                    <option key={date.date} value={date.date}>{date.display}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Available Time Slots</label>
                {slotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableSlots.filter(slot => slot.is_available).map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                          selectedSlot === slot.time
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-300"
                        }`}
                        onClick={() => setSelectedSlot(slot.time)}
                      >
                        {slot.display_range || slot.display_time || `${slot.time} - ${slot.end_time}`}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 py-4">No slots available for selected date</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {isEditing ? 'Update symptoms (optional)' : 'Describe your symptoms'} 
                  {!isEditing && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows="4"
                  name="symptoms"
                  placeholder="Describe symptoms, history, or concerns..."
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  required={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <Button
                type="submit"
                disabled={formLoading || !selectedSlot || (!isEditing && !formData.symptoms.trim())}
                className="w-full py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? (isEditing ? 'Rescheduling...' : 'Booking...') : (isEditing ? 'Reschedule Appointment' : 'Book Appointment')}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
    </>
  );
}

export default AppointmentFlow;