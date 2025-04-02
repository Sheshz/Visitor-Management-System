import axios from "axios";

// Define frontend URL with fallbacks for different environment configurations
const FRONTEND_URL =
  (window.env && window.env.REACT_APP_FRONTEND_URL) ||
  (import.meta.env && import.meta.env.VITE_FRONTEND_URL) ||
  "http://localhost:5173"; // Default to the typical Vite development port

// Define the API URL with the correct path structure
const API_URL =
  (window.env && window.env.REACT_APP_API_URL) ||
  (import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://localhost:5000";

/**
 * Axios instance with configured defaults
 */
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 3600000, // 1 hour timeout
 // timeout: 30000, // 30 seconds timeout // Increased timeout to handle slower connections
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple simultaneous redirects
let isRedirecting = false;

/**
 * Request interceptor to add auth token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Add token if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`Request to: ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Try different endpoint patterns if the initial request fails with 404
 * This is especially useful for login where the pattern might vary
 */
const tryAlternativeEndpoints = async (originalUrl, data, options = {}) => {
  // List of possible endpoint patterns to try
  const endpointVariations = [
    originalUrl,                        // Original: /api/user/login
    originalUrl.replace('/api/', '/'),  // Try: /user/login 
    `/auth${originalUrl.includes('login') ? '/login' : '/register'}`, // Try: /auth/login
    `/api/auth${originalUrl.includes('login') ? '/login' : '/register'}`, // Try: /api/auth/login
    originalUrl.replace('/api/user/', '/api/users/') // Try: /api/users/login
  ];

  let lastError = null;
  
  // Try each endpoint variation
  for (const endpoint of endpointVariations) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      const response = await apiClient.post(endpoint, data, options);
      console.log(`Success with endpoint: ${endpoint}`);
      // If successful, remember this endpoint for future use
      localStorage.setItem('successful_login_endpoint', endpoint);
      return response;
    } catch (error) {
      console.log(`Failed with endpoint: ${endpoint}`, error.message);
      lastError = error;
      // If not 404, don't try other endpoints as it might be a legitimate error
      if (error.response && error.response.status !== 404) {
        throw error;
      }
    }
  }
  
  // If we've tried all variations and none worked, throw the last error
  throw lastError;
};

/**
 * Response interceptor to handle errors and authentication issues
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Don't attempt redirection if we're already redirecting
    if (isRedirecting) {
      return Promise.reject(error);
    }

    // Handle authentication errors
    if (error.response && [401, 403].includes(error.response.status)) {
      console.log("Authentication error - dispatching expired event");

      // Only dispatch if not already on login page and not already redirecting
      if (!window.location.pathname.includes("/login") && !isRedirecting) {
        isRedirecting = true;

        // Store the current path for redirect after login
        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          sessionStorage.setItem("redirectAfterLogin", currentPath);
        }

        // Clean up local storage
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");

        // Dispatch custom event instead of direct redirection
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("auth:expired"));
          isRedirecting = false;
        }, 100);
      }
    }

    // Handle 404 errors for the login endpoint specifically
    if (error.response && error.response.status === 404 && 
        error.config.url.includes("login")) {
      console.error("Login endpoint not found. This could indicate the server is not running or the API routes are misconfigured.");
    }

    // Log specific API errors with more context
    if (error.response) {
      console.error(
        `API Error: ${error.config.url} - Status: ${error.response.status}`,
        error.response.data
      );
    } else if (error.request) {
      console.error(
        `Network Error: ${error.config.url} - No response received`,
        error.request
      );
    } else {
      console.error(`Error: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper methods for common API operations
 */
const apiHelper = {
  // Check if an endpoint is available
  checkEndpointAvailability: async (endpoint) => {
    try {
      await apiClient.head(endpoint);
      return true;
    } catch (error) {
      console.log(`${endpoint} endpoint not available`);
      return false;
    }
  },

  // Fetch data with fallback and error handling
  fetchWithFallback: async (endpoint, fallbackData = null) => {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.log(`Error fetching from ${endpoint}:`, error.message);
      return fallbackData;
    }
  },

  // Try login with multiple endpoint variations
  tryLogin: async (credentials) => {
    // Try to use previously successful endpoint if available
    const previousEndpoint = localStorage.getItem('successful_login_endpoint');
    if (previousEndpoint) {
      try {
        return await apiClient.post(previousEndpoint, credentials);
      } catch (error) {
        // If previous endpoint fails, fall back to trying all variations
        console.log("Previous successful endpoint failed, trying alternatives");
      }
    }
    
    return await tryAlternativeEndpoints("/api/user/login", credentials);
  },

  // Check authentication status
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get current auth token
  getToken: () => localStorage.getItem("token"),

  // Force logout - also dispatches an event instead of direct redirect
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("successful_login_endpoint");
    window.dispatchEvent(new CustomEvent("auth:logout"));
  },
};

export { apiHelper, FRONTEND_URL, API_URL };
export default apiClient;