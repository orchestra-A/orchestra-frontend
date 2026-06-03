import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

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
    return new Promise((resolve, reject) => {
      // Check if user already exists
      const exists = users.find(u => u.email === user.email || u.username === user.username);
      if (exists) {
        return reject(new Error("User with that email or username already exists."));
      }

      const newUser = { ...user, id: Date.now().toString() };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      resolve(newUser);
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
