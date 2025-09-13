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
    const response = await api.get(`/about-doctor/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    throw error;
  }
};

// Get doctor availability
export const getDoctorAvailability = async (doctorId) => {
  try {
    const response = await api.get(`/about-doctor/${doctorId}/availability`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    throw error;
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

