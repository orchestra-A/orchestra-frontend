import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Custom hook to consume the authentication context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component that manages user authentication state (login, signup, logout)
// and persists sessions using localStorage.
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(storedUsers);

    // Check for an active session
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setLoading(false);
  }, []);

  const signup = (user) => {
    return new Promise((resolve) => {
      // Check if user already exists
      const existingIndex = users.findIndex(u => u.email === user.email || u.username === user.username);
      
      let updatedUsers = [...users];
      let finalUser;

      if (existingIndex >= 0) {
        finalUser = { ...users[existingIndex], ...user };
        updatedUsers[existingIndex] = finalUser;
      } else {
        finalUser = { ...user, id: user.id || Date.now().toString() };
        updatedUsers.push(finalUser);
      }

      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      setCurrentUser(finalUser);
      localStorage.setItem('currentUser', JSON.stringify(finalUser));
      resolve(finalUser);
    });
  };

  const login = (identifier, password) => {
    return new Promise((resolve, reject) => {
      const user = users.find(u => 
        (u.email === identifier || u.username === identifier) && u.password === password
      );

      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error("Invalid credentials. Please try again."));
      }
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const updatePassword = (currentPassword, newPassword) => {
    return new Promise((resolve, reject) => {
      if (currentUser.password !== currentPassword) {
        return reject(new Error("Current password is incorrect."));
      }
      
      const updatedUser = { ...currentUser, password: newPassword };
      const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      resolve(true);
    });
  };

  const deleteAccount = () => {
    return new Promise((resolve) => {
      const updatedUsers = users.filter(u => u.id !== currentUser.id);
      
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      resolve(true);
    });
  };

  const updateProfile = (updates) => {
    return new Promise((resolve) => {
      const updatedUser = { ...currentUser, ...updates };
      const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      resolve(true);
    });
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    updatePassword,
    deleteAccount,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
