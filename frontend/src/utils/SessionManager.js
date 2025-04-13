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
    // Store the value
    sessionStorage.getItem(key) !== value && sessionStorage.setItem(key, value);
    
    // Set expiration timestamp
    const expires = new Date().getTime() + this.SESSION_TIMEOUT;
    sessionStorage.setItem(`${key}_expires`, expires.toString());
  }
  
   // Remove an item from session storage
   static removeItem(key) {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key);
    }
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
  static isUserAuthenticated() {
    return this.hasValidItem("userToken");
  }
  
  // Check if host is authenticated with valid token
  static isHostAuthenticated() {
    return this.hasValidItem("hostToken");
  }
  
  // Set user token
  static setUserToken(token) {
    if (token) {
      this.setItem("userToken", token);
      this.setItem("userRole", "user");
      return true;
    }
    return false;
  }
  
  // Set host token
  static setHostToken(token) {
    if (token) {
      this.setItem("hostToken", token);
      this.setItem("userRole", "host");
      // Also store in localStorage for persistence
      localStorage.setItem('hostToken', token);
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
    
    // Also refresh other related items if needed
    if (refreshed && this.hasValidItem("refreshToken")) {
      const refreshToken = sessionStorage.getItem("refreshToken");
      this.setItem("refreshToken", refreshToken);
    }
    
    return refreshed;
  }
  
  // Transfer auth data from localStorage to sessionStorage if needed
  static transferFromLocalStorage() {
    let transferred = false;
    
    // Transfer user token if exists
    const userToken = localStorage.getItem("token") || localStorage.getItem("userToken");
    if (userToken && !sessionStorage.getItem("userToken")) {
      this.setItem("userToken", userToken);
      this.setItem("userRole", "user");
      transferred = true;
    }
    
    // Transfer host token if exists (key priority)
    const hostToken = localStorage.getItem("hostToken");
    if (hostToken && !sessionStorage.getItem("hostToken")) {
      this.setItem("hostToken", hostToken);
      this.setItem("userRole", "host");
      transferred = true;
    }
    
    // Transfer refresh token if exists
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken && transferred) {
      this.setItem("refreshToken", refreshToken);
    }
    
    // Clear localStorage after transfer for better security
    // but keep hostToken and token separate to avoid conflicts
    if (transferred) {
      if (userToken) localStorage.removeItem("token");
      if (hostToken) localStorage.removeItem("hostToken");
      localStorage.removeItem("refreshToken");
    }
    
    return transferred;
  }
  
  // Get user role if available
  static getUserRole() {
    return this.getItem("userRole") || "guest";
  }
  
  // Get appropriate token based on current role
  static getToken() {
    const role = this.getUserRole();
    
    if (role === "host" && this.hasValidItem("hostToken")) {
      return this.getItem("hostToken");
    } else if (role === "user" && this.hasValidItem("userToken")) {
      return this.getItem("userToken");
    }
    
    // Backwards compatibility with existing code
    if (this.hasValidItem("token")) {
      return this.getItem("token");
    }
    
    return null;
  }
  
  // Get host token specifically (for host-only operations)
  static getHostToken() {
    if (this.hasValidItem("hostToken")) {
      return this.getItem("hostToken");
    }
    // Also check localStorage as fallback
    return localStorage.getItem('hostToken');
  }
  
  // Get user token specifically (for user-only operations)
  static getUserToken() {
    if (this.hasValidItem("userToken")) {
      return this.getItem("userToken");
    }
    return null;
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
  }
}