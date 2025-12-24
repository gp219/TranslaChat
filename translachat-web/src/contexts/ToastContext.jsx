import React, { useState, useCallback } from 'react';
import { ToastContext } from './ToastContextDefinition';
import Toast from '../components/Toast';
// 3. Provider Component (The "Manager")
export const ToastProvider = ({ children }) => {
    // State to hold the toast configuration
    const [toast, setToast] = useState(null);

    // Function to set the toast state (the service function)
    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        setToast({ message, type, duration, key: Date.now() });
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    // The context value provides the showToast function
    const contextValue = { showToast };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {/* Render the Toast component here, managed by the state */}
            {toast && (
                <Toast 
                    key={toast.key}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={hideToast}
                />
            )}
        </ToastContext.Provider>
    );
};