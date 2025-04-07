/**
 * Enhanced SessionManager for secure token management
 * Uses sessionStorage for sensitive data to improve security
 */
export class SessionManager {
  // Session timeout - set to 24 hours in ms
  static SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
  
  // Get an item from sessionStorage
  static getItem(key) {
    return sessionStorage.getItem(key);
  }
  
  // Set an item in sessionStorage with expiration
  static setItem(key, value) {
    // Store the value
    sessionStorage.getItem(key) !== value && sessionStorage.setItem(key, value);
    
    // Set expiration timestamp
    const expires = new Date().getTime() + this.SESSION_TIMEOUT;
    sessionStorage.setItem(`${key}_expires`, expires.toString());
  }
  
  // Remove an item from sessionStorage
  static removeItem(key) {
    sessionStorage.removeItem(key);
    sessionStorage.removeItem(`${key}_expires`);
  }
  
  // Clear all sessionStorage data
  static clear() {
    sessionStorage.clear();
  }
  
  // Check if a key exists and is not expired
  static hasValidItem(key) {
    const value = sessionStorage.getItem(key);
    if (!value) return false;
    
    const expiresStr = sessionStorage.getItem(`${key}_expires`);
    if (!expiresStr) return false;
    
    const expires = parseInt(expiresStr, 10);
    return expires > new Date().getTime();
  }
  
  // Check if user is authenticated with valid token
  static isAuthenticated() {
    return this.hasValidItem("token");
  }
  
  // Add the missing setToken method
  static setToken(token) {
    if (token) {
      this.setItem("token", token);
      return true;
    }
    return false;
  }
  
  // Refresh token expiration to extend session
  static refreshTokenExpiration() {
    if (this.hasValidItem("token")) {
      const token = sessionStorage.getItem("token");
      this.setItem("token", token); // This updates the expiration
      
      // Also refresh other related items
      const refreshToken = sessionStorage.getItem("refreshToken");
      if (refreshToken) {
        this.setItem("refreshToken", refreshToken);
      }
      
      return true;
    }
    return false;
  }
  
  // Transfer auth data from localStorage to sessionStorage if needed
  static transferFromLocalStorage() {
    const localToken = localStorage.getItem("token");
    
    if (localToken && !sessionStorage.getItem("token")) {
      // Transfer token
      this.setItem("token", localToken);
      
      // Transfer refresh token if exists
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        this.setItem("refreshToken", refreshToken);
      }
      
      // Transfer other important data
      const userRole = localStorage.getItem("userRole");
      if (userRole) {
        this.setItem("userRole", userRole);
      }
      
      // Clear localStorage after transfer for better security
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");
      
      return true;
    }
    
    return false;
  }
  
  // Get user role if available
  static getUserRole() {
    return this.getItem("userRole") || "user";
  }
  
  // Get token with automatic expiration check
  static getToken() {
    if (this.hasValidItem("token")) {
      return this.getItem("token");
    }
    return null;
  }
}