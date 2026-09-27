// Centralized API Client for URL Shortener
import { getToken, removeToken } from './auth';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || response.statusText };
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          removeToken();
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (!error.status) {
        // Network/connection error
        error.message = error.message === 'Failed to fetch' 
          ? 'Unable to connect to backend server. Please verify the backend is running at ' + this.baseUrl
          : error.message;
      }
      throw error;
    }
  }

  // Public Endpoints
  async getHealth() {
    return this.request('/');
  }

  async register({ name, email, password }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login({ email, password }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Protected Endpoints
  async createUrl({ title, originalUrl }) {
    return this.request('/url', {
      method: 'POST',
      body: JSON.stringify({ title, originalUrl }),
    });
  }

  async getMyUrls() {
    return this.request('/url/my', {
      method: 'GET',
    });
  }

  async getAnalytics(shortId) {
    return this.request(`/url/analytics/${encodeURIComponent(shortId)}`, {
      method: 'GET',
    });
  }

  async deleteUrl(shortId) {
    return this.request(`/url/${encodeURIComponent(shortId)}`, {
      method: 'DELETE',
    });
  }

  // Helper to format full public short link
  getPublicShortUrl(shortId) {
    return `${this.baseUrl}/${shortId}`;
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
