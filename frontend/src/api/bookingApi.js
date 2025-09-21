const API_BASE_URL = 'http://localhost:5000/api';

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    // Get user ID from localStorage if available
    const userId = localStorage.getItem('userId');
    if (userId) {
      bookingData.userId = userId;
    }

    const response = await fetch(`${API_BASE_URL}/booking/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Get available time slots for a doctor
export const getAvailableSlots = async (doctorId, date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/booking/available-slots?doctorId=${doctorId}&date=${encodeURIComponent(date)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting available slots:', error);
    throw error;
  }
};

// Get appointment by ID
export const getAppointmentById = async (appointmentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/booking/appointment/${appointmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting appointment:', error);
    throw error;
  }
};

// Get user profile for booking form
export const getUserProfileForBooking = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/booking/user-profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting user profile for booking:', error);
    throw error;
  }
};

// Get appointments for a user
export const getUserAppointments = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/booking/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting user appointments:', error);
    throw error;
  }
};

// Cancel appointment
export const cancelAppointment = async (appointmentId, reason = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/booking/cancel/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

// Update appointment status (for doctors)
export const updateAppointmentStatus = async (appointmentId, statusData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/booking/status/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
}; 