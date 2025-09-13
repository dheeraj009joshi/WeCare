// Updated for FastAPI backend
import { appointmentsAPI } from '../config/api';

// Create a new appointment/booking
export const createBooking = async (bookingData) => {
  try {
    // Get user ID from localStorage and add it to patient_id if not provided
    const userId = localStorage.getItem('userId');
    if (userId && !bookingData.patient_id) {
      bookingData.patient_id = userId;
    }

    // Map old booking data format to new FastAPI format
    const appointmentData = {
      patient_id: bookingData.userId || bookingData.patient_id,
      doctor_id: bookingData.doctorId || bookingData.doctor_id,
      appointment_date: bookingData.date || bookingData.appointment_date,
      appointment_time: bookingData.time || bookingData.appointment_time,
      symptoms: bookingData.symptoms || bookingData.notes || '',
      consultation_fee: bookingData.consultation_fee || 500.0, // Default fee
      ...bookingData
    };

    const response = await appointmentsAPI.bookAppointment(appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error.response?.data || error;
  }
};

// Get available time slots for a doctor
export const getAvailableSlots = async (doctorId, date) => {
  try {
    const response = await appointmentsAPI.getDoctorAvailableSlots(doctorId, date);
    return {
      slots: response.data.available_slots || [],
      doctor_name: response.data.doctor_name,
      total_slots: response.data.total_slots
    };
  } catch (error) {
    console.error('Error getting available slots:', error);
    // Return empty slots if API fails
    return { 
      slots: [],
      doctor_name: 'Doctor',
      total_slots: 0
    };
  }
};

// Get weekly availability for a doctor
export const getDoctorWeeklyAvailability = async (doctorId, startDate = null) => {
  try {
    const response = await appointmentsAPI.getDoctorWeeklyAvailability(doctorId, startDate);
    return response.data;
  } catch (error) {
    console.error('Error getting weekly availability:', error);
    return {
      weekly_availability: {},
      doctor_name: 'Doctor'
    };
  }
};

// Get appointment by ID (may need implementation in FastAPI)
export const getAppointmentById = async (appointmentId) => {
  try {
    // This specific endpoint may need to be implemented in FastAPI
    console.warn('getAppointmentById may need implementation in FastAPI backend');
    const response = await appointmentsAPI.getUserAppointments();
    const appointment = response.data.find(apt => apt.id === appointmentId);
    return appointment || null;
  } catch (error) {
    console.error('Error getting appointment:', error);
    throw error.response?.data || error;
  }
};

// Get user profile for booking form
export const getUserProfileForBooking = async (userId) => {
  try {
    // Get user from localStorage as profile endpoints may need implementation
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    throw new Error('User profile not found');
  } catch (error) {
    console.error('Error getting user profile for booking:', error);
    throw error;
  }
};

// Get appointments for a user
export const getUserAppointments = async (userId) => {
  try {
    const response = await appointmentsAPI.getUserAppointments();
    return response.data;
  } catch (error) {
    console.error('Error getting user appointments:', error);
    throw error.response?.data || error;
  }
};

// Cancel appointment
export const cancelAppointment = async (appointmentId, reason = '') => {
  try {
    const response = await appointmentsAPI.cancelAppointment(appointmentId);
    return response.data;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error.response?.data || error;
  }
};

// Update appointment status (for doctors)
export const updateAppointmentStatus = async (appointmentId, statusData) => {
  try {
    const response = await appointmentsAPI.updateAppointment(appointmentId, statusData);
    return response.data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error.response?.data || error;
  }
}; 