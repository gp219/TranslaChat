
import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const styles = {
    success: 'bg-green-700 border-green-500 shadow-green-600/50',
    error: 'bg-red-700 border-red-500 shadow-red-600/50',
    warning: 'bg-yellow-600 border-yellow-400 shadow-yellow-500/50',
    info: 'bg-indigo-700 border-indigo-500 shadow-indigo-600/50',
};

/**
 * Reusable Toast/Alert Message Component
 * @param {string} message - The message content.
 * @param {string} type - 'success', 'error', 'warning', or 'info'.
 * @param {number} duration - Time in milliseconds before auto-close (default 3000ms).
 * @param {function} onClose - Callback function to notify parent when closed.
 */
const Toast = ({ 
    message, 
    type = 'info', 
    duration = 3000, 
    onClose 
}) => {
    const [isVisible, setIsVisible] = useState(true);
    
    // Determine the icon and background styles based on type
    const IconComponent = icons[type] || Info;
    const toastStyle = styles[type] || styles.info;

    const handleClose = useCallback(() => {
        setIsVisible(false);
        // Call the parent component's close handler after animation
        setTimeout(onClose, 300); 
    }, [onClose]);

    // Auto-close effect
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            
            // Cleanup the timer when the component unmounts or duration/type changes
            return () => clearTimeout(timer);
        }
    }, [duration, handleClose]);


    if (!isVisible) {
        return null;
    }

    return (
        <div 
            className={`
                fixed bottom-6 right-6 z-50 p-4 w-full max-w-sm 
                rounded-xl border-2 text-white font-medium 
                flex items-center space-x-4 shadow-xl 
                transition-all duration-300 transform 
                ${toastStyle}
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}
            // Add a subtle slide-in animation via Tailwind
            style={{ animation: 'slideIn 0.3s forwards' }} 
        >
            {/* Type Icon */}
            <IconComponent className="w-6 h-6 flex-shrink-0" />
            
            {/* Message Content */}
            <span className="flex-1">{message}</span>
            
            {/* Close Button */}
            <button 
                onClick={handleClose}
                className="p-1 rounded-full text-white/80 hover:bg-white/20 transition duration-150 flex-shrink-0"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Toast;