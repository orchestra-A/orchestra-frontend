import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = 'error') => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Convert complex messages to strings
    const safeMessage = typeof message === 'string' ? message : 
                       (message?.message || message?.toString() || 'An unknown error occurred');

    setToast({ message: safeMessage, type, id: Date.now() });

    // Auto-hide after 10 seconds
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 10000);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast(null);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
