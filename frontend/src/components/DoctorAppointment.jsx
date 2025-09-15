import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { appointmentsAPI } from '../config/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const DoctorAppointment = () => {
  const navigate = useNavigate();
  const { date } = useParams();
  const calendarRef = useRef(null);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState('timeGridWeek');

  useEffect(() => {
    fetchAppointments();
  }, [date]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if doctor is logged in
      const doctorToken = localStorage.getItem('doctorToken');
      const doctorData = localStorage.getItem('doctorData');
      if (!doctorToken || !doctorData) {
        setError('Authentication required. Redirecting to login...');
        setTimeout(() => {
          navigate('/doctors/login');
        }, 2000);
        return;
      }
      
      console.log('Fetching doctor appointments...');
      const params = date ? { date } : {};
      const response = await appointmentsAPI.getDoctorAppointments(params);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response format:', response);
        setError('Invalid response format from server');
        return;
      }
      
      setAppointments(response.data);
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (clickInfo) => {
    const appointment = clickInfo.event.extendedProps;
    setSelectedAppointment({
      ...appointment,
      id: clickInfo.event.id,
      _id: clickInfo.event.id
    });
    setShowModal(true);
  };

  const handleDateClick = (arg) => {
    // Optional: Handle date click for creating new appointments
    console.log('Date clicked:', arg.date);
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await appointmentsAPI.updateAppointmentStatusByDoctor(appointmentId, { status: newStatus });
      fetchAppointments(); // Refresh the calendar
      setShowModal(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment status');
    }
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#10b981'; // green
      case 'pending': return '#f59e0b'; // yellow/orange
      case 'cancelled': return '#ef4444'; // red
      case 'completed': return '#3b82f6'; // blue
      default: return '#6b7280'; // gray
    }
  };

  // Transform appointments into calendar events
  const calendarEvents = appointments.map(appointment => ({
    id: appointment.id || appointment._id,
    title: `${appointment.patient_name || 'Unknown Patient'} - ${appointment.symptoms || 'Consultation'}`,
    start: `${appointment.appointment_date}T${appointment.appointment_time}`,
    end: `${appointment.appointment_date}T${appointment.appointment_time}`,
    backgroundColor: getStatusColor(appointment.status),
    borderColor: getStatusColor(appointment.status),
    textColor: '#ffffff',
    extendedProps: appointment
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Calendar
            </h1>
            <p className="text-gray-600">Manage your appointments and patient consultations</p>
          </div>
          
          {/* View Toggle Buttons - Teams style */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setCurrentView('timeGridDay');
                if (calendarRef.current) {
                  calendarRef.current.getApi().changeView('timeGridDay');
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'timeGridDay' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => {
                setCurrentView('timeGridWeek');
                if (calendarRef.current) {
                  calendarRef.current.getApi().changeView('timeGridWeek');
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'timeGridWeek' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => {
                setCurrentView('dayGridMonth');
                if (calendarRef.current) {
                  calendarRef.current.getApi().changeView('dayGridMonth');
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'dayGridMonth' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          aspectRatio={1.35}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }}
          dayHeaderFormat={{
            weekday: 'short',
            month: 'numeric',
            day: 'numeric'
          }}
          eventDisplay="block"
          eventBackgroundColor="#3b82f6"
          eventBorderColor="#3b82f6"
          eventTextColor="#ffffff"
          nowIndicator={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday - Saturday
            startTime: '09:00',
            endTime: '18:00',
          }}
          // Teams-like styling
          themeSystem="standard"
          eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
          dayHeaderClassNames="bg-gray-50 border-b"
          slotLabelClassNames="text-gray-600 text-xs"
        />
      </div>

      {/* Modal for appointment details */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-semibold">Appointment Details</h2>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedAppointment.patient_name || 'Unknown Patient'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <p className="text-gray-900">
                      {new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <p className="text-gray-900">{formatTime(selectedAppointment.appointment_time)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    selectedAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    selectedAppointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedAppointment.status || 'pending'}
                  </span>
                </div>
                
                {selectedAppointment.symptoms && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {selectedAppointment.symptoms}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                  <p className="text-gray-900">₹{selectedAppointment.consultation_fee || 500}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusUpdate(selectedAppointment._id || selectedAppointment.id, 'confirmed')}
                  className="flex-1 min-w-0 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedAppointment._id || selectedAppointment.id, 'completed')}
                  className="flex-1 min-w-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Complete
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedAppointment._id || selectedAppointment.id, 'cancelled')}
                  className="flex-1 min-w-0 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 min-w-0 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointment;