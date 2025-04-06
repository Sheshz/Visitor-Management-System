//This contains the modal component from my first response
import React, { useState, useEffect } from 'react';

const TokenWarningModal = ({ 
  warningThreshold = 60, // Show warning when 60 seconds remaining
  onRefresh,
  onLogout
}) => {
  const [visible, setVisible] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [countdownInterval, setCountdownInterval] = useState(null);

  useEffect(() => {
    // Function to check token expiry and show warning if needed
    const checkTokenExpiry = () => {
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      if (!tokenExpiry) return;
      
      const expiryTime = parseInt(tokenExpiry);
      const currentTime = Date.now();
      const timeToExpiry = Math.floor((expiryTime - currentTime) / 1000); // in seconds
      
      if (timeToExpiry <= warningThreshold && timeToExpiry > 0) {
        setSecondsRemaining(timeToExpiry);
        setVisible(true);
        
        // Start countdown timer
        if (!countdownInterval) {
          const interval = setInterval(() => {
            setSecondsRemaining(prev => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          setCountdownInterval(interval);
        }
      } else if (timeToExpiry <= 0) {
        // Token has expired
        onLogout();
      } else {
        // Token is still valid and not close to expiry
        setVisible(false);
        if (countdownInterval) {
          clearInterval(countdownInterval);
          setCountdownInterval(null);
        }
      }
    };
    
    // Initial check
    checkTokenExpiry();
    
    // Set up periodic checks
    const checkInterval = setInterval(checkTokenExpiry, 5000);
    
    // Listen for token refresh events
    const handleTokenRefresh = () => {
      setVisible(false);
      if (countdownInterval) {
        clearInterval(countdownInterval);
        setCountdownInterval(null);
      }
    };
    
    window.addEventListener('tokenRefreshed', handleTokenRefresh);
    
    // Cleanup
    return () => {
      clearInterval(checkInterval);
      if (countdownInterval) clearInterval(countdownInterval);
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
    };
  }, [warningThreshold, countdownInterval, onLogout]);

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Session About to Expire</h3>
        <p className="mb-4">
          Your session will expire in <span className="font-bold text-red-600">{secondsRemaining}</span> seconds.
          Would you like to continue your session?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Logout
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenWarningModal;