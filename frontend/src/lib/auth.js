// Authentication helpers for JWT handling

const TOKEN_KEY = 'url_shortener_jwt_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save token to localStorage', e);
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to remove token', e);
  }
};

export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch (e) {
    return null;
  }
};

export const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) {
    removeToken();
    return null;
  }
  // Check token expiration
  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    removeToken();
    return null;
  }
  return {
    id: decoded.id || decoded.userId,
    name: decoded.name || 'User',
    email: decoded.email || '',
  };
};

export const isAuthenticated = () => {
  return !!getCurrentUser();
};
