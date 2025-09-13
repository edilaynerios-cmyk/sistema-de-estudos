import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

// Instância do Axios para rotas públicas (não precisa de token)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
});

// Instância do Axios para rotas protegidas (precisa de token)
const protectedApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Interceptor para adicionar o token nas rotas protegidas
protectedApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para renovar o token
protectedApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await publicApi.post('/auth/refresh', { refresh_token: refreshToken });
          localStorage.setItem('token', data.access_token);
          protectedApi.defaults.headers.common['Authorization'] = 'Bearer ' + data.access_token;
          originalRequest.headers['Authorization'] = 'Bearer ' + data.access_token;
          return protectedApi(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  signup: (email, password) => publicApi.post('/auth/signup', { email, password }),
  login: (email, password) => publicApi.post('/auth/login', { email, password }),
};

export const dashboardService = { getDashboard: () => protectedApi.get('/dashboard') };

export const studyService = {
  createStudySession: (data) => protectedApi.post('/studies/', data),
  getStudySessions: () => protectedApi.get('/studies/'),
  updateStudySession: (sessionId, data) => protectedApi.put(`/studies/${sessionId}`, data),
  deleteStudySession: (sessionId) => protectedApi.delete(`/studies/${sessionId}`),
};

export const reviewService = {
  getReviews: () => protectedApi.get('/reviews/'),
  completeReview: (reviewId) => protectedApi.post(`/reviews/${reviewId}/complete`),
  undoReview: (reviewId) => protectedApi.post(`/reviews/${reviewId}/undo`),
};

export const analyticsService = { getSummary: () => protectedApi.get('/analytics/summary') };

export const cycleService = {
  getCycles: () => protectedApi.get('/cycles/'),
  createCycle: (data) => protectedApi.post('/cycles/', data),
  updateCycle: (cycleId, data) => protectedApi.put(`/cycles/${cycleId}`, data),
  deleteCycle: (cycleId) => protectedApi.delete(`/cycles/${cycleId}`),
};

export const subjectService = {
  getSubjectDetails: (subjectName) => protectedApi.get(`/subject/${subjectName}`),
  getAllSubjects: () => protectedApi.get('/subjects/'),
};