import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (formData: FormData) =>
    api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateMeasurements: (data: any) => api.put('/auth/measurements', data),
};

// Tailor endpoints
export const tailorAPI = {
  getTailors: (params?: any) => api.get('/tailors', { params }),
  getTailorDetails: (id: string) => api.get(`/tailors/${id}`),
  getMyServices: () => api.get('/tailors/my/services'),
  createService: (data: any) => api.post('/tailors/my/services', data),
  updateService: (id: string, data: any) => api.put(`/tailors/my/services/${id}`, data),
  deleteService: (id: string) => api.delete(`/tailors/my/services/${id}`),
};

// Order endpoints
export const orderAPI = {
  placeOrder: (formData: FormData) =>
    api.post('/orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getOrders: () => api.get('/orders'),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  updateOrderStatus: (id: string, formData: FormData) =>
    api.put(`/orders/${id}/status`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createReview: (orderId: string, data: { rating: number; comment: string }) =>
    api.post(`/orders/${orderId}/review`, data),
};

// Appointment endpoints
export const appointmentAPI = {
  bookAppointment: (data: { tailorId: string; date: string; timeSlot: string; notes?: string }) =>
    api.post('/appointments', data),
  getAppointments: () => api.get('/appointments'),
  updateAppointmentStatus: (id: string, status: 'Approved' | 'Rejected') =>
    api.put(`/appointments/${id}/status`, { status }),
};

// Categories endpoints
export const categoryAPI = {
  getCategories: () => api.get('/categories'),
};

// Admin endpoints
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  toggleUserBlock: (id: string) => api.put(`/admin/users/${id}/block`),
  toggleTailorVerify: (id: string) => api.put(`/admin/tailors/${id}/verify`),
  createCategory: (formData: FormData) =>
    api.post('/admin/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
};

// AI endpoints
export const aiAPI = {
  chat: (message: string) => api.post('/ai/chat', { message }),
};

export default api;
