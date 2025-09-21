const API_BASE_URL = 'http://localhost:5000/api';

// Get all doctors with optional specialization filter
export const getDoctors = async (specialization = '') => {
  try {
    const url = specialization 
      ? `${API_BASE_URL}/services/doctors?specialization=${encodeURIComponent(specialization)}`
      : `${API_BASE_URL}/services/doctors`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

// Get all specializations
export const getSpecializations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/services/specializations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching specializations:', error);
    throw error;
  }
};

// Get doctor by ID
export const getDoctorById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/services/doctors/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching doctor:', error);
    throw error;
  }
};

// Search doctors
export const searchDoctors = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/services/doctors/search?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching doctors:', error);
    throw error;
  }
}; 