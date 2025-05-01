// Authentication service in your frontend app
export class UserService {
  constructor() {
    this.accessToken = localStorage.getItem("accessToken");
    this.refreshToken = localStorage.getItem("refreshToken");
    this.tokenExpiryTime = localStorage.getItem("tokenExpiry");
    this.apiBaseUrl = "http://localhost:5001/api";

    // Set up a timer to refresh token before it expires
    this.setupRefreshTimer();
  }

  setupRefreshTimer() {
    if (!this.tokenExpiryTime) return;

    const currentTime = Date.now();
    const expiryTime = parseInt(this.tokenExpiryTime);
    const timeToExpiry = expiryTime - currentTime;

    // Refresh when 80% of token lifetime has passed
    const refreshTime = timeToExpiry * 0.8;

    // Clear any existing timer
    if (this.refreshTimerId) {
      clearTimeout(this.refreshTimerId);
    }

    if (refreshTime > 0) {
      this.refreshTimerId = setTimeout(
        () => this.refreshAccessToken(),
        refreshTime
      );
    } else if (this.refreshToken) {
      // If token has already expired but we have a refresh token
      this.refreshAccessToken();
    }
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/refresh`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Don't use custom headers in the refresh request
        },
        credentials: "include", // This ensures cookies are sent with the request
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        this.accessToken = data.accessToken;

        // Calculate new expiry time (assuming JWT)
        try {
          const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
          this.tokenExpiryTime = payload.exp * 1000; // Convert to milliseconds
        } catch (e) {
          // If token parsing fails, set a default expiry (15 minutes)
          console.warn("Could not parse token expiry, using default");
          this.tokenExpiryTime = Date.now() + 15 * 60 * 1000;
        }

        // Store updated values
        localStorage.setItem("accessToken", this.accessToken);
        localStorage.setItem("tokenExpiry", this.tokenExpiryTime);

        // Reset the refresh timer
        this.setupRefreshTimer();

        // Notify the warning modal to hide if visible
        window.dispatchEvent(new CustomEvent("tokenRefreshed"));
        
        return true;
      } else {
        // Token refresh failed - user needs to login again
        console.error("Token refresh failed:", data.message || "Unknown error");
        this.logout();
        return false;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.logout();
      return false;
    }
  }

  // Get the authorization header for API requests
  getAuthHeader() {
    return {
      'Authorization': `Bearer ${this.accessToken}`
    };
  }

  // Method to make authenticated API requests
  async fetchWithAuth(endpoint, options = {}) {
    if (!this.accessToken) {
      throw new Error("No access token available");
    }

    // Check if token needs refresh before making request
    const currentTime = Date.now();
    const expiryTime = parseInt(this.tokenExpiryTime);
    
    if (currentTime >= expiryTime && this.refreshToken) {
      // Token expired, try to refresh first
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        throw new Error("Session expired. Please login again.");
      }
    }

    // Prepare request with auth header
    const requestOptions = {
      ...options,
      headers: {
        ...options.headers,
        ...this.getAuthHeader(),
        'Content-Type': options.headers?.['Content-Type'] || 'application/json',
      },
      credentials: 'include', // Include cookies
    };

    // Make the request
    try {
      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, requestOptions);
      
      // Handle 401 Unauthorized - token might be invalid
      if (response.status === 401 && this.refreshToken) {
        // Try refreshing the token once
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          requestOptions.headers = {
            ...requestOptions.headers,
            ...this.getAuthHeader()
          };
          return fetch(`${this.apiBaseUrl}${endpoint}`, requestOptions);
        } else {
          this.logout();
          throw new Error("Session expired. Please login again.");
        }
      }
      
      return response;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Use this method for user data fetch to fix CORS issues
  async getUserData() {
    return this.fetchWithAuth('/users/me')
      .then(response => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
      });
  }

  // Method to get notifications
  async getNotifications() {
    return this.fetchWithAuth('/notifications/user')
      .then(response => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
      })
      .catch(err => {
        console.log("Failed to fetch notifications:", err);
        return []; // Return empty array on failure
      });
  }

  logout() {
    // Clear the refresh timer
    if (this.refreshTimerId) {
      clearTimeout(this.refreshTimerId);
    }
    
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    
    // Dispatch logout event before redirecting
    window.dispatchEvent(new CustomEvent("userLogout"));
    
    // Small delay to allow event listeners to respond
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.accessToken && 
           !!this.tokenExpiryTime && 
           Date.now() < parseInt(this.tokenExpiryTime);
  }
}

// Create a singleton instance
export const authService = new UserService();