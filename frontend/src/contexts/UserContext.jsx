//This would wrap your app and provide auth state and methods to all components
// frontend/src/contexts/UserContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create context
const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [tokenExpiryTime, setTokenExpiryTime] = useState(localStorage.getItem('tokenExpiry'));
  const [loading, setLoading] = useState(true);
  const [refreshTimerId, setRefreshTimerId] = useState(null);
  
  const navigate = useNavigate();

  // Initialize auth state on load
  useEffect(() => {
    const initializeAuth = async () => {
      if (accessToken) {
        try {
          // Fetch user data using the access token
          const response = await fetch('http://localhost:5000/api/users/me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setupRefreshTimer();
          } else {
            // Token might be invalid, try refreshing
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
              await logout();
            }
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          await logout();
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
    
    return () => {
      if (refreshTimerId) clearTimeout(refreshTimerId);
    };
  }, []);

  const setupRefreshTimer = () => {
    if (!tokenExpiryTime) return;
    
    // Clear any existing timer
    if (refreshTimerId) clearTimeout(refreshTimerId);
    
    const currentTime = Date.now();
    const expiryTime = parseInt(tokenExpiryTime);
    const timeToExpiry = expiryTime - currentTime;
    
    // Refresh when 80% of token lifetime has passed
    const refreshTime = timeToExpiry * 0.8;
    
    if (refreshTime > 0) {
      const timerId = setTimeout(() => refreshAccessToken(), refreshTime);
      setRefreshTimerId(timerId);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Extract token expiry time (assuming JWT)
        const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        
        // Set auth state
        setUser(data.user);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setTokenExpiryTime(expiryTime.toString());
        
        // Store tokens in localStorage
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        
        // Set up timer for token refresh
        setupRefreshTimer();
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) return false;
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Extract token expiry time (assuming JWT)
        const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        
        // Update auth state
        setAccessToken(data.accessToken);
        setTokenExpiryTime(expiryTime.toString());
        
        // Update localStorage
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        
        // Reset the refresh timer
        setupRefreshTimer();
        
        // Dispatch event for other components (like TokenWarningModal) to react
        window.dispatchEvent(new CustomEvent('tokenRefreshed'));
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call backend to invalidate the refresh token (optional)
      if (refreshToken) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear user state
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setTokenExpiryTime(null);
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      
      // Clear any refresh timers
      if (refreshTimerId) clearTimeout(refreshTimerId);
      
      // Redirect to login
      navigate('/login');
    }
  };

  const UserContextValue = {
    user,
    accessToken,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    refreshAccessToken
  };

  return (
    <AuthContext.Provider value={UserContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the user context
export const useAuth = () => {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};