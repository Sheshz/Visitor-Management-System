import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { SessionManager } from '../utils/SessionManager';

/**
 * Handles logout functionality and redirects to specified page
 * @param {Object} props Component props
 * @param {string} props.redirectTo Path to redirect to after logout
 * @param {boolean} props.isHost Whether to perform host logout
 */
const LogoutHandler = ({ redirectTo = '/login', isHost = false }) => {
  useEffect(() => {
    // Clear tokens based on type
    if (isHost) {
      SessionManager.logoutHost();
      localStorage.removeItem('hostToken');
      localStorage.removeItem('hostId');
      localStorage.removeItem('hostName');
    } else {
      SessionManager.logoutUser();
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
    }
    
    // For a full logout, clear everything
    if (redirectTo === '/login' || redirectTo === '/host-login') {
      // Do nothing, we're preserving the other role's tokens if they exist
    } else {
      // Full logout
      SessionManager.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('hostToken');
      localStorage.removeItem('userToken');
    }
    
    // Additional cleanup if needed
    if (!redirectTo.includes('remember=true')) {
      localStorage.removeItem('gp_remember_email');
    }
    
    console.log(`Logged out ${isHost ? 'host' : 'user'}, redirecting to ${redirectTo}`);
  }, [redirectTo, isHost]);

  return <Navigate to={redirectTo} replace />;
};

export default LogoutHandler;