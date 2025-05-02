import axios from 'axios';

/**
 * Enhanced SessionManager for secure token management
 * Primary storage: sessionStorage (more secure, cleared when browser closes)
 * Secondary storage: localStorage (for persistence when needed)
 * Supports separate handling for host and user tokens with refresh capability
 */
export class SessionManager {
  // Session timeout - set to 24 hours in ms
  static SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
  
  // Token refresh threshold - 10 minutes before expiration
  static REFRESH_THRESHOLD = 10 * 60 * 1000;
  
  // Storage keys
  static TOKEN_KEY = 'token';
  static USER_TOKEN_KEY = 'userToken';
  static HOST_TOKEN_KEY = 'hostToken';
  static REFRESH_TOKEN_KEY = 'refreshToken';
  static USER_ROLE_KEY = 'userRole';
  static USER_DATA_KEY = 'userData';
  
  // Get an item from session storage
  static getItem(key) {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  }
  
  // Set an item in sessionStorage with expiration
  static setItem(key, value) {
    if (typeof window !== 'undefined' && value !== null) {
      // Store the value
      sessionStorage.getItem(key) !== value && sessionStorage.setItem(key, value);
      
      // Set expiration timestamp
      const expires = new Date().getTime() + this.SESSION_TIMEOUT;
      sessionStorage.setItem(`${key}_expires`, expires.toString());
    }
  }
  
  // Remove an item from session storage
  static removeItem(key) {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(`${key}_expires`);
    }
  }
  
  // Clear all sessionStorage data
  static clear() {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  }
  
  // Check if a key exists and is not expired
  static hasValidItem(key) {
    if (typeof window === 'undefined') return false;
    
    const value = sessionStorage.getItem(key);
    if (!value) return false;
    
    const expiresStr = sessionStorage.getItem(`${key}_expires`);
    if (!expiresStr) return false;
    
    const expires = parseInt(expiresStr, 10);
    return expires > new Date().getTime();
  }
  
  // Check if user is authenticated with valid token
  static isUserAuthenticated() {
    return this.hasValidItem(this.USER_TOKEN_KEY);
  }
  
  // Check if host is authenticated with valid token
  static isHostAuthenticated() {
    return this.hasValidItem(this.HOST_TOKEN_KEY);
  }
  
  // General authentication check
  static isAuthenticated() {
    return this.isUserAuthenticated() || this.isHostAuthenticated() || this.hasValidItem(this.TOKEN_KEY);
  }
  
  // Set user token
  static setUserToken(token, expiresIn = null) {
    if (token) {
      this.setItem(this.USER_TOKEN_KEY, token);
      this.setItem(this.USER_ROLE_KEY, "user");
      
      // For backward compatibility, also set the general token
      this.setItem(this.TOKEN_KEY, token);
      
      // If expiration time is provided, set it
      if (expiresIn) {
        const expiryTime = new Date(Date.now() + expiresIn * 1000).toISOString();
        this.setItem(`${this.USER_TOKEN_KEY}_expires`, expiryTime);
      }
      
      return true;
    }
    return false;
  }
  
  // Set host token
  static setHostToken(token, expiresIn = null) {
    if (token) {
      this.setItem(this.HOST_TOKEN_KEY, token);
      this.setItem(this.USER_ROLE_KEY, "host");
      
      // For backward compatibility, also set the general token
      this.setItem(this.TOKEN_KEY, token);
      
      // If expiration time is provided, set it
      if (expiresIn) {
        const expiryTime = new Date(Date.now() + expiresIn * 1000).toISOString();
        this.setItem(`${this.HOST_TOKEN_KEY}_expires`, expiryTime);
      }
      
      // Also store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.HOST_TOKEN_KEY, token);
      }
      return true;
    }
    return false;
  }
  
  // Set general token (for backward compatibility)
  static setToken(token, expiresIn = null) {
    if (token) {
      this.setItem(this.TOKEN_KEY, token);
      
      // If expiration time is provided, set it
      if (expiresIn) {
        const expiryTime = new Date(Date.now() + expiresIn * 1000).toISOString();
        this.setItem(`${this.TOKEN_KEY}_expires`, expiryTime);
      }
      
      return true;
    }
    return false;
  }
  
  // Set refresh token
  static setRefreshToken(refreshToken) {
    if (refreshToken) {
      this.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      
      // Also store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }
      
      return true;
    }
    return false;
  }
  
  // Store complete auth data (token, user data, expiry, refresh token)
  static setAuthData(token, userData, expiresIn, refreshToken = null, role = "user") {
    // Store token based on role
    if (role === "host") {
      this.setHostToken(token, expiresIn);
    } else {
      this.setUserToken(token, expiresIn);
    }
    
    // Store user data
    if (userData) {
      this.setUserData(userData);
    }
    
    // Store refresh token if provided
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  }
  
  // Store user data
  static setUserData(userData) {
    if (userData) {
      if (typeof window !== 'undefined') {
        // Store in sessionStorage
        this.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
        
        // Also store in localStorage for persistence
        localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
        
        // Store individual user properties for compatibility
        if (userData.id) this.setItem('userId', userData.id);
        if (userData.email) this.setItem('userEmail', userData.email);
        if (userData.name) this.setItem('userName', userData.name);
      }
    }
  }
  
  // Refresh token expiration to extend session
  static refreshTokenExpiration() {
    let refreshed = false;
    
    if (this.hasValidItem(this.USER_TOKEN_KEY)) {
      const token = sessionStorage.getItem(this.USER_TOKEN_KEY);
      this.setItem(this.USER_TOKEN_KEY, token); // This updates the expiration
      refreshed = true;
    }
    
    if (this.hasValidItem(this.HOST_TOKEN_KEY)) {
      const token = sessionStorage.getItem(this.HOST_TOKEN_KEY);
      this.setItem(this.HOST_TOKEN_KEY, token); // This updates the expiration
      refreshed = true;
    }
    
    // Also refresh token if using legacy token
    if (this.hasValidItem(this.TOKEN_KEY)) {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      this.setItem(this.TOKEN_KEY, token);
      refreshed = true;
    }
    
    // Also refresh other related items if needed
    if (refreshed && this.hasValidItem(this.REFRESH_TOKEN_KEY)) {
      const refreshToken = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
      this.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    
    return refreshed;
  }
  
  // Transfer auth data from localStorage to sessionStorage if needed
  static transferFromLocalStorage() {
    if (typeof window === 'undefined') return false;
    
    let transferred = false;
    
    // Check for token in localStorage first
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.setItem(this.TOKEN_KEY, token);
      transferred = true;
      
      // Also set as user token for new system
      if (!sessionStorage.getItem(this.USER_TOKEN_KEY)) {
        this.setItem(this.USER_TOKEN_KEY, token);
        this.setItem(this.USER_ROLE_KEY, "user");
      }
    }
    
    // Transfer user token if exists
    const userToken = localStorage.getItem(this.USER_TOKEN_KEY);
    if (userToken && !sessionStorage.getItem(this.USER_TOKEN_KEY)) {
      this.setItem(this.USER_TOKEN_KEY, userToken);
      this.setItem(this.USER_ROLE_KEY, "user");
      transferred = true;
      
      // Also set general token if it doesn't exist
      if (!this.hasValidItem(this.TOKEN_KEY)) {
        this.setItem(this.TOKEN_KEY, userToken);
      }
    }
    
    // Transfer host token if exists
    const hostToken = localStorage.getItem(this.HOST_TOKEN_KEY);
    if (hostToken && !sessionStorage.getItem(this.HOST_TOKEN_KEY)) {
      this.setItem(this.HOST_TOKEN_KEY, hostToken);
      this.setItem(this.USER_ROLE_KEY, "host");
      transferred = true;
      
      // Also set general token if it doesn't exist
      if (!this.hasValidItem(this.TOKEN_KEY)) {
        this.setItem(this.TOKEN_KEY, hostToken);
      }
    }
    
    // Transfer refresh token if exists
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (refreshToken) {
      this.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    
    // Transfer user data if exists
    const userDataString = localStorage.getItem(this.USER_DATA_KEY);
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        this.setUserData(userData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    
    return transferred;
  }
  
  // Get user role if available
  static getUserRole() {
    return this.getItem(this.USER_ROLE_KEY) || "guest";
  }
  
  // Get appropriate token based on current role
  static getToken() {
    // First check for general token (highest priority for backward compatibility)
    if (this.hasValidItem(this.TOKEN_KEY)) {
      return this.getItem(this.TOKEN_KEY);
    }
    
    const role = this.getUserRole();
    
    if (role === "host" && this.hasValidItem(this.HOST_TOKEN_KEY)) {
      return this.getItem(this.HOST_TOKEN_KEY);
    } else if (role === "user" && this.hasValidItem(this.USER_TOKEN_KEY)) {
      return this.getItem(this.USER_TOKEN_KEY);
    }
    
    // As a last resort, check localStorage
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem(this.TOKEN_KEY);
      if (localToken) {
        // Migrate to sessionStorage
        this.setItem(this.TOKEN_KEY, localToken);
        return localToken;
      }
    }
    
    return null;
  }
  
  // Get host token specifically (for host-only operations)
  static getHostToken() {
    if (this.hasValidItem(this.HOST_TOKEN_KEY)) {
      return this.getItem(this.HOST_TOKEN_KEY);
    }
    // Also check localStorage as fallback
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.HOST_TOKEN_KEY);
    }
    return null;
  }
  
  // Get user token specifically (for user-only operations)
  static getUserToken() {
    if (this.hasValidItem(this.USER_TOKEN_KEY)) {
      return this.getItem(this.USER_TOKEN_KEY);
    }
    return null;
  }
  
  // Get refresh token
  static getRefreshToken() {
    if (this.hasValidItem(this.REFRESH_TOKEN_KEY)) {
      return this.getItem(this.REFRESH_TOKEN_KEY);
    }
    // Also check localStorage as fallback
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }
  
  // Get current user information
  static getCurrentUser() {
    try {
      // Try to get user data from sessionStorage first
      if (typeof window !== 'undefined') {
        const userDataString = this.getItem(this.USER_DATA_KEY);
        if (userDataString) {
          return JSON.parse(userDataString);
        }
        
        // Try localStorage if not in sessionStorage
        const localUserDataString = localStorage.getItem(this.USER_DATA_KEY);
        if (localUserDataString) {
          // Migrate to sessionStorage
          this.setItem(this.USER_DATA_KEY, localUserDataString);
          return JSON.parse(localUserDataString);
        }
        
        // Check if we can get user ID from session
        const userRole = this.getUserRole();
        if (userRole === 'user' || userRole === 'host') {
          // Create a minimal user object based on session data
          const userId = sessionStorage.getItem('userId');
          const userEmail = sessionStorage.getItem('userEmail');
          const userName = sessionStorage.getItem('userName');
          
          if (userId || userEmail || userName) {
            return {
              id: userId || '',
              email: userEmail || '',
              name: userName || ''
            };
          }
        }
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
    }
    
    return null; // Return null if no user data found or error occurs
  }
  
  // Check if token needs refreshing and refresh if needed
  static async refreshTokenIfNeeded() {
    // If not authenticated, nothing to refresh
    if (!this.isAuthenticated()) {
      return false;
    }
    
    const role = this.getUserRole();
    let tokenKey = this.TOKEN_KEY;
    
    if (role === 'user') {
      tokenKey = this.USER_TOKEN_KEY;
    } else if (role === 'host') {
      tokenKey = this.HOST_TOKEN_KEY;
    }
    
    const expiresStr = sessionStorage.getItem(`${tokenKey}_expires`);
    if (!expiresStr) {
      return false;
    }
    
    const expiryTime = parseInt(expiresStr, 10);
    const currentTime = new Date().getTime();
    
    // If token expires in less than refresh threshold, refresh it
    if (expiryTime - currentTime < this.REFRESH_THRESHOLD) {
      return await this.refreshToken();
    }
    
    return true;
  }
  
  // Refresh the token
  static async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        console.error('No refresh token available');
        return false;
      }
      
      const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';
      const response = await axios.post(
        `${apiBaseUrl}/auth/refresh-token`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const { token, expiresIn, user, role = 'user' } = response.data;
      
      // Update auth data
      this.setAuthData(token, user, expiresIn, refreshToken, role);
      
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }
  
  // Log out user - clear user-specific tokens
  static logoutUser() {
    this.removeItem(this.USER_TOKEN_KEY);
    if (this.getUserRole() === "user") {
      this.removeItem(this.USER_ROLE_KEY);
    }
    
    // Remove from localStorage too
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_TOKEN_KEY);
    }
  }
  
  // Log out host - clear host-specific tokens
  static logoutHost() {
    this.removeItem(this.HOST_TOKEN_KEY);
    if (this.getUserRole() === "host") {
      this.removeItem(this.USER_ROLE_KEY);
    }
    
    // Remove from localStorage too
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.HOST_TOKEN_KEY);
    }
  }
  
  // Complete logout - clear all auth tokens
  static logout() {
    this.removeItem(this.USER_TOKEN_KEY);
    this.removeItem(this.HOST_TOKEN_KEY);
    this.removeItem(this.TOKEN_KEY);
    this.removeItem(this.REFRESH_TOKEN_KEY);
    this.removeItem(this.USER_ROLE_KEY);
    this.removeItem(this.USER_DATA_KEY);
    this.removeItem('userId');
    this.removeItem('userEmail');
    this.removeItem('userName');
    this.removeItem('hostId');
    this.removeItem('hostName');
    this.removeItem('hostEmail');
    this.removeItem('hostProfileImage');
    
    // Also clear localStorage tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_TOKEN_KEY);
      localStorage.removeItem(this.HOST_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_DATA_KEY);
    }
  }
}

// Add a named export for the getCurrentUser function for backward compatibility
export const getCurrentUser = SessionManager.getCurrentUser.bind(SessionManager);

// Default export for backward compatibility
export default SessionManager;