import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserById, updateUser } from '../services/api';

const AuthContext = createContext();

// Custom hook to consume the authentication context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component that manages user authentication state (login, signup, logout)
// and persists sessions using localStorage. After OAuth login, it hydrates the
// full user profile from the backend (skills, platforms_connected, etc.)
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore active session from localStorage on mount
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setLoading(false);
  }, []);

  /**
   * Fetches the full user profile from the backend by user_id and merges it
   * with whatever data came from the OAuth token. Called by OAuthCallback.
   * @param {string} userId - The backend user_id (e.g. "usr_53dc61e9")
   * @param {Object} tokenData - Partial user data already known from OAuth token
   */
  const fetchAndHydrateUser = async (userId, tokenData = {}) => {
    let backendUser = null;
    try {
      backendUser = await fetchUserById(userId);
    } catch (err) {
      console.warn('Could not hydrate user from backend:', err);
    }

    // Merge backend profile over token data (backend is source of truth)
    const hydratedUser = {
      // Fallbacks from OAuth token if backend lookup fails
      id: userId,
      username: tokenData.username || '',
      email: tokenData.email || '',
      platform: tokenData.platform || '',
      // Backend profile fields (overwrite token data if available)
      ...(backendUser || {}),
      // Ensure user_id is always set
      user_id: userId,
    };

    setCurrentUser(hydratedUser);
    localStorage.setItem('currentUser', JSON.stringify(hydratedUser));
    return hydratedUser;
  };

  /**
   * Called by OAuthCallback when a new or returning user arrives.
   * Saves the initial token data and triggers full profile hydration.
   */
  const signup = async (user) => {
    const userId = user.id || user.user_id;
    // Immediately set a lightweight session so the UI isn't blocked
    const lightUser = { ...user, user_id: userId, id: userId };
    setCurrentUser(lightUser);
    localStorage.setItem('currentUser', JSON.stringify(lightUser));

    // Hydrate with full backend profile asynchronously
    if (userId) {
      await fetchAndHydrateUser(userId, user);
    }
    return lightUser;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  /**
   * Update the user's profile both locally and on the backend.
   * @param {Object} updates - Fields to update (e.g. { skills: [...] })
   */
  const updateProfile = async (updates) => {
    if (!currentUser?.user_id) throw new Error('No user logged in.');
    try {
      await updateUser(currentUser.user_id, updates);
    } catch (err) {
      console.warn('Backend profile update failed, updating locally only:', err);
    }
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const value = {
    currentUser,
    signup,
    logout,
    fetchAndHydrateUser,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
