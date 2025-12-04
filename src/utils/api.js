// API Configuration and Base Setup
const API_BASE_URL = 'http://localhost:5001/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Save token to localStorage
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Save user data to localStorage
export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Get user data from localStorage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Remove user data from localStorage
export const removeUser = () => {
  localStorage.removeItem('user');
};

// Base fetch wrapper with authentication
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API Methods
export const api = {
  // GET request
  get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),

  // POST request
  post: (endpoint, body) =>
    apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // PUT request
  put: (endpoint, body) =>
    apiFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // PATCH request
  patch: (endpoint, body) =>
    apiFetch(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // DELETE request
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};

export default api;
