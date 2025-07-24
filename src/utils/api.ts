import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Optionally redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API clients for different endpoints
export const chatApi = {
  sendMessage: (data: { message: string; session_id?: string }) =>
    api.post('/chat/send', data),
  getHistory: (sessionId?: string) =>
    api.get('/chat/history', { params: { session_id: sessionId } }),
};

export const tasksApi = {
  getTasks: () => api.get('/tasks'),
  createTask: (data: any) => api.post('/tasks', data),
  updateTask: (id: number, data: any) => api.put(`/tasks/${id}`, data),
  deleteTask: (id: number) => api.delete(`/tasks/${id}`),
};

export const calendarApi = {
  getEvents: () => api.get('/calendar/events'),
  createEvent: (data: any) => api.post('/calendar/events', data),
  syncCalendar: () => api.post('/calendar/sync'),
  getUpcomingEvents: () => api.get('/calendar/upcoming'),
};

export const emailApi = {
  getEmails: () => api.get('/email/recent'),
  getSummary: () => api.get('/email/summary'),
  suggestReply: (emailId: string) => api.post(`/email/suggest-reply/${emailId}`),
  sendEmail: (data: any) => api.post('/email/send', data),
  syncGmail: () => api.post('/email/sync'),
};

export const voiceApi = {
  transcribe: (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    return api.post('/voice/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  synthesize: (text: string) => api.post('/voice/synthesize', { text }),
};

export const searchApi = {
  search: (query: string) => api.get('/search', { params: { q: query } }),
  suggestions: (query: string) => api.get('/search/suggestions', { params: { q: query } }),
};

export const suggestionsApi = {
  getSuggestions: () => api.get('/suggestions'),
  acceptSuggestion: (id: string) => api.post(`/suggestions/${id}/accept`),
  dismissSuggestion: (id: string) => api.post(`/suggestions/${id}/dismiss`),
  generateSuggestions: () => api.post('/suggestions/generate'),
};

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  googleLogin: () => api.get('/auth/google/login'),
  googleCallback: (code: string, state?: string) =>
    api.post('/auth/google/callback', { code, state }),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return Promise.resolve();
  },
};

// Helper function to handle Google OAuth flow
export const handleGoogleOAuth = () => {
  return new Promise((resolve, reject) => {
    authApi.googleLogin()
      .then(response => {
        const authUrl = response.data.auth_url;
        const popup = window.open(
          authUrl,
          'google-oauth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for the popup to close or send a message
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Check if we have tokens in localStorage (set by callback)
            const token = localStorage.getItem('authToken');
            if (token) {
              resolve({ success: true, token });
            } else {
              reject(new Error('Authentication was cancelled or failed'));
            }
          }
        }, 1000);

        // Listen for messages from the popup (if callback page sends a message)
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener('message', messageListener);
            
            // Store the tokens
            if (event.data.token) {
              localStorage.setItem('authToken', event.data.token);
            }
            if (event.data.user) {
              localStorage.setItem('user', JSON.stringify(event.data.user));
            }
            
            resolve({ success: true, token: event.data.token });
          } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener('message', messageListener);
            reject(new Error(event.data.error || 'Authentication failed'));
          }
        };

        window.addEventListener('message', messageListener);

        // Cleanup if popup is blocked or fails to open
        if (!popup) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          reject(new Error('Popup was blocked. Please allow popups for this site.'));
        }
      })
      .catch(reject);
  });
};

export default api;