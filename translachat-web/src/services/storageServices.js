const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'user';

export const setAuthTokenInLs = (token) => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};
export const getAuthToken = () => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};
export const removeAuthToken = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
};
export const setUserDataInLs = (user) => {
  try {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error setting user data:", error);
  }
};

export const getUserData = () => {
  try {
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};
export const removeUserData = () => {
  try {
    localStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error("Error removing user data:", error);
  }
};

export const setItem = (key, value) => {
    try {
        const serializedValue = typeof value === 'object' && value !== null
            ? JSON.stringify(value)
            : String(value);
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error(`Error setting item for key "${key}":`, error);
    }
};

export const getItem = (key) => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            try {
                return JSON.parse(storedValue);
            } catch (e) {
                return storedValue;
            }
        }
        return null;
    } catch (error) {
        console.error(`Error getting item for key "${key}":`, error);
        return null;
    }
};

export const removeItem = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing item for key "${key}":`, error);
    }
};

export const clearAuthStorage = () => {
  removeAuthToken();
  removeUserData();
  localStorage.clear();
};