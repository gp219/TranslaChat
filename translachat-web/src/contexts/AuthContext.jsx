import React, { useState } from 'react';
import { AuthContext } from './AuthContextDefinition';
import { getAuthToken, getUserData, setAuthTokenInLs, setUserDataInLs } from '../services/storageServices';
import { useCallback } from 'react';
import { useMemo } from 'react';


 // --- HYDRATION EFFECT: Runs once on component mount ---
const getInitialAuthState = () => {
    const storedToken = getAuthToken();
    const storedUserJson = getUserData();
    let user = null;
    if (storedToken && storedUserJson) {
        try {
            user = storedUserJson;
        } catch (error) {
            console.error('Failed to parse stored user data during initial load. Clearing storage.', error);
            localStorage.clear();
            return { authToken: null, currentUser: null, isLoading: false };
        }
    }

    return {
        authToken: storedToken && user ? storedToken : null,
        currentUser: user,
        isLoading: false, 
    };
};

export const AuthProvider = ({ children }) => {
  const initialState = getInitialAuthState();
  const [authToken, setAuthToken] = useState(initialState.authToken);
  const [currentUser, setCurrentUser] = useState(initialState.currentUser); 
  const [isLoading, setIsLoading] = useState(initialState.isLoading);

  // --- LOGIN FUNCTION: Saves data to both state and storage ---
  const login = useCallback((apiResponseData) => {
    const { token, user } = apiResponseData;
    setAuthToken(token);
    setCurrentUser(user);
    setAuthTokenInLs(token);
    setUserDataInLs(user);
  },[setAuthToken, setCurrentUser]);

  // --- LOGOUT FUNCTION: Clears data from both state and storage ---
  const logout = useCallback(() => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.clear();
    console.log('User logged out and storage cleared.');
  }, [setAuthToken, setCurrentUser]);
  
  // --- Context Value ---
  const contextValue = useMemo(() => ({
    currentUser,
    authToken,
    isLoggedIn: !!authToken,
    isLoading,
    // Pass the memoized function references
    logout, 
    login,
}), [currentUser, authToken, isLoading, logout, login]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};