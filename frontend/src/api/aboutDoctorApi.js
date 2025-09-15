import api from '../config/api';

// Get all doctors for Services page
export const getAllDoctors = async () => {
  try {
    const response = await api.get('/doctors');
    return response.data;
  } catch (error) {
    console.error('Error fetching all doctors:', error);
    throw error;
  }
};

// Get detailed doctor information
export const getDoctorDetails = async (doctorId) => {
  try {
    const response = await api.get(`/doctors/${doctorId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    return { success: false, error: error.message };
  }
};

// Get doctor availability
export const getDoctorAvailability = async (doctorId) => {
  try {
    const response = await api.get(`/appointments/doctor/${doctorId}/availability-week`);
    
    // Transform the API response to match what the AboutDoctor component expects
    const availabilityData = response.data.weekly_availability;
    const transformedData = Object.keys(availabilityData).map(date => {
      const dayData = availabilityData[date];
      const availableSlots = dayData.available_slots
        .filter(slot => slot.is_available && !slot.is_booked)
        .map(slot => ({
          time: slot.time,
          display: slot.display_range,
          isAvailable: slot.is_available,
          isBooked: slot.is_booked
        }));
      
      console.log(`Available slots for ${date}:`, availableSlots.length, 'out of', dayData.available_slots.length);
      
      return {
        date: date,
        day: dayData.day_name,
        timeSlots: availableSlots
      };
    });
    
    return { success: true, data: transformedData };
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    return { success: false, error: error.message };
  }
};

// Book appointment
export const bookAppointment = async (doctorId, appointmentData) => {
  try {
    const response = await api.post(`/about-doctor/${doctorId}/book`, appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

