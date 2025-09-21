import api from './api';

const FOOTER_BASE_URL = '/api/footer';

export const footerApi = {
  // Newsletter subscription
  subscribeNewsletter: async (email) => {
    try {
      const response = await api.post(`${FOOTER_BASE_URL}/newsletter/subscribe`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  unsubscribeNewsletter: async (email) => {
    try {
      const response = await api.get(`${FOOTER_BASE_URL}/newsletter/unsubscribe/${email}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Contact form submission
  submitContact: async (contactData) => {
    try {
      const response = await api.post(`${FOOTER_BASE_URL}/contact`, contactData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get footer content
  getFooterContent: async () => {
    try {
      const response = await api.get(`${FOOTER_BASE_URL}/content`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Admin endpoints (require authentication)
  getAllContacts: async (params = {}) => {
    try {
      const response = await api.get(`${FOOTER_BASE_URL}/contacts`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateContactStatus: async (contactId, updateData) => {
    try {
      const response = await api.put(`${FOOTER_BASE_URL}/contacts/${contactId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateFooterContent: async (contentData) => {
    try {
      const response = await api.put(`${FOOTER_BASE_URL}/content`, contentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getNewsletterStats: async () => {
    try {
      const response = await api.get(`${FOOTER_BASE_URL}/newsletter/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default footerApi;
