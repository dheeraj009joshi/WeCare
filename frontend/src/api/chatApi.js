import axios from "axios";

const API_BASE = "http://localhost:8000/api/chat";

// Add timeout and better error handling
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const createChatSession = (userId, title = "Chat") =>
  apiClient.post(`/session`, { userId, title });

export const fetchChatMessages = (sessionId) =>
  apiClient.get(`/${sessionId}/messages`);

export const sendMessage = (sessionId, sender, text) =>
  apiClient.post(`/message`, { sessionId, sender, text });

export const getAIReply = (sessionId, message) =>
  apiClient.post(`/ai`, { message, sessionId });

export const getAIGreet = () =>
  apiClient.post(`/ai`, { greet: true });

export const updateChatTitle = (sessionId, title) =>
  apiClient.put(`/session/${sessionId}/title`, { title });

export const getAITitle = (message) =>
  apiClient.post(`/title`, { message }); 