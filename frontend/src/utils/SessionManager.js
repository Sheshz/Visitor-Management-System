/**
 * Enhanced SessionManager for secure token management
 * Uses sessionStorage for sensitive data to improve security
 * With separate handling for host and user tokens
 */
export class SessionManager {
  // Session timeout - set to 24 hours in ms
  static SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
  
  // Get an item from session storage
  static getItem(key) {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  }
  
  // Set an item in sessionStorage with expiration
  static setItem(key, value) {
    if (typeof window !== 'undefined') {
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
    return this.hasValidItem("userToken");
  }
  
  // Check if host is authenticated with valid token
  static isHostAuthenticated() {
    return this.hasValidItem("hostToken");
  }
  
  // General authentication check
  static isAuthenticated() {
    return this.isUserAuthenticated() || this.isHostAuthenticated() || this.hasValidItem("token");
  }
  
  // Set user token
  static setUserToken(token) {
    if (token) {
      this.setItem("userToken", token);
      this.setItem("userRole", "user");
      
      // For backward compatibility, also set the general token
      this.setItem("token", token);
      
      return true;
    }
    return false;
  }
  
  // Set host token
  static setHostToken(token) {
    if (token) {
      this.setItem("hostToken", token);
      this.setItem("userRole", "host");
      
      // For backward compatibility, also set the general token
      this.setItem("token", token);
      
      // Also store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('hostToken', token);
      }
      return true;
    }
    return false;
  }
  
  // Set general token (for backward compatibility)
  static setToken(token) {
    if (token) {
      this.setItem("token", token);
      return true;
    }
    return false;
  }
  
  // Refresh token expiration to extend session
  static refreshTokenExpiration() {
    let refreshed = false;
    
    if (this.hasValidItem("userToken")) {
      const token = sessionStorage.getItem("userToken");
      this.setItem("userToken", token); // This updates the expiration
      refreshed = true;
    }
    
    if (this.hasValidItem("hostToken")) {
      const token = sessionStorage.getItem("hostToken");
      this.setItem("hostToken", token); // This updates the expiration
      refreshed = true;
    }
    
    // Also refresh token if using legacy token
    if (this.hasValidItem("token")) {
      const token = sessionStorage.getItem("token");
      this.setItem("token", token);
      refreshed = true;
    }
    
    // Also refresh other related items if needed
    if (refreshed && this.hasValidItem("refreshToken")) {
      const refreshToken = sessionStorage.getItem("refreshToken");
      this.setItem("refreshToken", refreshToken);
    }
    
    return refreshed;
  }
  
  // Transfer auth data from localStorage to sessionStorage if needed
  static transferFromLocalStorage() {
    if (typeof window === 'undefined') return false;
    
    let transferred = false;
    
    // Check for token in localStorage first
    const token = localStorage.getItem("token");
    if (token) {
      this.setItem("token", token);
      transferred = true;
      
      // Also set as user token for new system
      if (!sessionStorage.getItem("userToken")) {
        this.setItem("userToken", token);
        this.setItem("userRole", "user");
      }
    }
    
    // Transfer user token if exists
    const userToken = localStorage.getItem("userToken");
    if (userToken && !sessionStorage.getItem("userToken")) {
      this.setItem("userToken", userToken);
      this.setItem("userRole", "user");
      transferred = true;
      
      // Also set general token if it doesn't exist
      if (!this.hasValidItem("token")) {
        this.setItem("token", userToken);
      }
    }
    
    // Transfer host token if exists
    const hostToken = localStorage.getItem("hostToken");
    if (hostToken && !sessionStorage.getItem("hostToken")) {
      this.setItem("hostToken", hostToken);
      this.setItem("userRole", "host");
      transferred = true;
      
      // Also set general token if it doesn't exist
      if (!this.hasValidItem("token")) {
        this.setItem("token", hostToken);
      }
    }
    
    // Transfer refresh token if exists
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      this.setItem("refreshToken", refreshToken);
    }
    
    return transferred;
  }
  
  // Get user role if available
  static getUserRole() {
    return this.getItem("userRole") || "guest";
  }
  
  // Get appropriate token based on current role
  static getToken() {
    // First check for general token (highest priority for backward compatibility)
    if (this.hasValidItem("token")) {
      return this.getItem("token");
    }
    
    const role = this.getUserRole();
    
    if (role === "host" && this.hasValidItem("hostToken")) {
      return this.getItem("hostToken");
    } else if (role === "user" && this.hasValidItem("userToken")) {
      return this.getItem("userToken");
    }
    
    // As a last resort, check localStorage
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem("token");
      if (localToken) {
        // Migrate to sessionStorage
        this.setItem("token", localToken);
        return localToken;
      }
    }
    
    return null;
  }
  
  // Get host token specifically (for host-only operations)
  static getHostToken() {
    if (this.hasValidItem("hostToken")) {
      return this.getItem("hostToken");
    }
    // Also check localStorage as fallback
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hostToken');
    }
    return null;
  }
  
  // Get user token specifically (for user-only operations)
  static getUserToken() {
    if (this.hasValidItem("userToken")) {
      return this.getItem("userToken");
    }
    return null;
  }
  
  // Get current user information
  static getCurrentUser() {
    try {
      // Try to get user data from localStorage first
      if (typeof window !== 'undefined') {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          return JSON.parse(userDataString);
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
  
  // Log out user - clear user-specific tokens
  static logoutUser() {
    this.removeItem("userToken");
    if (this.getUserRole() === "user") {
      this.removeItem("userRole");
    }
  }
  
  // Log out host - clear host-specific tokens
  static logoutHost() {
    this.removeItem("hostToken");
    if (this.getUserRole() === "host") {
      this.removeItem("userRole");
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hostToken');
    }
  }
  
  // Complete logout - clear all auth tokens
  static logout() {
    this.removeItem("userToken");
    this.removeItem("hostToken");
    this.removeItem("token");
    this.removeItem("refreshToken");
    this.removeItem("userRole");
    this.removeItem('hostId');
    this.removeItem('hostName');
    this.removeItem('hostEmail');
    this.removeItem('hostProfileImage');
    
    // Also clear localStorage tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      localStorage.removeItem("userToken");
      localStorage.removeItem("hostToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData"); // Also clear userData
    }
  }
}

// Add a named export for the getCurrentUser function for backward compatibility
export const getCurrentUser = SessionManager.getCurrentUser.bind(SessionManager);

// Default export for backward compatibility
export default SessionManager;