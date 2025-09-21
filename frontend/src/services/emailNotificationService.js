import api from '../config/api';

// Email notification service for frontend
class EmailNotificationService {
  // Get user's email notification preferences
  async getEmailPreferences() {
    try {
      const response = await api.get('/api/user/email-preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching email preferences:', error);
      throw error;
    }
  }

  // Update user's email notification preferences
  async updateEmailPreferences(preferences) {
    try {
      const response = await api.put('/api/user/email-preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating email preferences:', error);
      throw error;
    }
  }

  // Test email notification
  async testEmailNotification(type) {
    try {
      const response = await api.post('/api/user/test-email', { type });
      return response.data;
    } catch (error) {
      console.error('Error testing email notification:', error);
      throw error;
    }
  }

  // Get email notification history
  async getEmailHistory(page = 1, limit = 10) {
    try {
      const response = await api.get(`/api/user/email-history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching email history:', error);
      throw error;
    }
  }

  // Resend email notification
  async resendEmail(notificationId) {
    try {
      const response = await api.post(`/api/user/resend-email/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error resending email:', error);
      throw error;
    }
  }

  // Get email statistics
  async getEmailStats() {
    try {
      const response = await api.get('/api/user/email-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching email stats:', error);
      throw error;
    }
  }
}

export default new EmailNotificationService();
