import axios from "axios";

// Define URLs with fallbacks for different environment configurations
const API_URL =
  (window.env && window.env.REACT_APP_API_URL) ||
  (import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://localhost:5000";

const FRONTEND_URL =
  (window.env && window.env.REACT_APP_FRONTEND_URL) ||
  (import.meta.env && import.meta.env.VITE_FRONTEND_URL) ||
  "http://localhost:5173";

/**
 * Axios instance with configured defaults
 */
// Development mode flag - set to true to extend session timeouts
const DEV_MODE = true;

// Then use it to conditionally set timeouts
const API_TIMEOUT = DEV_MODE ? 86400000 : 15000; // 24 hours in dev mode, 15 seconds in production

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  // Add withCredentials to handle cookies properly
  withCredentials: true
});

// Flags to prevent multiple simultaneous operations
let isRedirecting = false;
let isRefreshing = false;
let refreshSubscribers = [];

// Store tokens in sessionStorage instead of localStorage for better security
const storeTokens = (accessToken, refreshToken) => {
  sessionStorage.setItem("token", accessToken);
  if (refreshToken) {
    sessionStorage.setItem("refreshToken", refreshToken);
  }
};

// Get tokens from sessionStorage with localStorage fallback
const getTokens = () => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const refreshToken = sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");
  
  // If token was found in localStorage, migrate it to sessionStorage
  if (!sessionStorage.getItem("token") && localStorage.getItem("token")) {
    storeTokens(localStorage.getItem("token"), localStorage.getItem("refreshToken"));
    // Optionally clear localStorage after migration
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }
  
  return { token, refreshToken };
};

// Remove tokens from both storages
const removeTokens = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("userRole");
  sessionStorage.removeItem("successful_login_endpoint");
  sessionStorage.removeItem("successful_refresh_endpoint");
  // Also clear localStorage for good measure
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("successful_login_endpoint");
  localStorage.removeItem("successful_refresh_endpoint");
};

// Subscribe to token refresh
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Notify subscribers that token has been refreshed
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Helper function to decode token
const decodeToken = (token) => {
  try {
    if (!token || !token.includes(".")) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Check if token is expired or will expire soon
const isTokenExpired = (token, bufferSeconds = 86400) => {
  // Set to 86400 seconds (24 hours) for token expiration buffer
  if (!token) return true;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  return payload.exp < Date.now() / 1000 + bufferSeconds;
};

// List of known endpoints and their fallbacks
const endpointMappings = {
  "/api/users/refresh": [
    "/api/users/token/refresh",
    "/api/user/refresh",
    "/users/refresh",
    "/api/users/refresh-token",
    "/api/auth/refresh",
  ],
  "/api/notifications": ["/api/notifications/all", "/api/users/notifications"],
  "/api/visitors/current": ["/api/visitors/current", "/api/visitors/active"],
  "/api/hosts/me": ["/api/hosts/me", "/api/users/host"],
  "/api/user/login": [
    "/api/users/login",
    "/api/user/login",
    "/user/login",
    "/login",
    "/api/auth/login",
  ],
};

// Find the best alternative endpoint
const findAlternativeEndpoint = (originalEndpoint) => {
  for (const [key, alternatives] of Object.entries(endpointMappings)) {
    if (originalEndpoint.includes(key)) {
      return alternatives;
    }
  }
  return [];
};

// Try to refresh the token
const refreshToken = async () => {
  try {
    const { token, refreshToken } = getTokens();
    if (!token || !refreshToken) {
      console.error("Missing token or refresh token for refresh attempt");
      return null;
    }

    // Use the successful refresh endpoint if we have one stored
    const storedRefreshEndpoint = sessionStorage.getItem(
      "successful_refresh_endpoint"
    ) || localStorage.getItem("successful_refresh_endpoint");
    
    const refreshEndpoints = storedRefreshEndpoint
      ? [
          storedRefreshEndpoint,
          ...findAlternativeEndpoint("/api/users/refresh"),
        ]
      : [
          "/api/users/refresh-token",
          "/api/auth/refresh",
          ...findAlternativeEndpoint("/api/users/refresh"),
        ];

    // Try each refresh endpoint until one works
    for (const endpoint of refreshEndpoints) {
      try {
        console.log(`Trying refresh endpoint: ${endpoint}`);

        const response = await axios.post(
          `${API_URL}${endpoint}`,
          { refreshToken },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true
          }
        );

        if (response.data && response.data.token) {
          // Store both tokens (keeping the same refresh token if a new one isn't provided)
          const newRefreshToken = response.data.refreshToken || refreshToken;
          storeTokens(response.data.token, newRefreshToken);

          // Save successful endpoint for future use
          sessionStorage.setItem("successful_refresh_endpoint", endpoint);
          console.log(
            `Token refreshed successfully using endpoint: ${endpoint}`
          );

          return response.data.token;
        }
      } catch (endpointError) {
        console.log(
          `Refresh attempt failed with endpoint ${endpoint}:`,
          endpointError.message
        );
      }
    }

    // If we get here, all refresh attempts failed
    console.error("All token refresh attempts failed");
    return null;
  } catch (error) {
    console.error("Error in refreshToken function:", error);
    return null;
  }
};

/**
 * Request interceptor to add auth token to all requests
 */
apiClient.interceptors.request.use(
  async (config) => {
    const { token } = getTokens();

    // If no token, continue with request (for public endpoints)
    if (!token) {
      return config;
    }

    // Check if token is about to expire and try to refresh it
    if (
      isTokenExpired(token) &&
      !isRefreshing &&
      !config.url.includes("refresh")
    ) {
      isRefreshing = true;

      try {
        const newToken = await refreshToken();

        // If refresh successful, use new token
        if (newToken) {
          onTokenRefreshed(newToken);
          // Update this request's token
          config.headers.Authorization = `Bearer ${newToken}`;
          // Remove the custom header that's causing CORS issues
          // config.headers["x-user-token"] = newToken;
        }
      } catch (refreshError) {
        console.error("Error during token refresh:", refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Add token to request using only the standard Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Remove the custom header that's causing CORS issues
      // config.headers["x-user-token"] = token;
    }

    // Track request time for performance monitoring
    config._requestTime = Date.now();

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Try different endpoint patterns if the initial request fails with 404
 */
const tryAlternativeEndpoints = async (
  originalUrl,
  data,
  options = {},
  method = "post"
) => {
  // List of possible endpoint patterns to try
  let urlObj;
  let endpointPath;

  try {
    urlObj = new URL(originalUrl);
    endpointPath = urlObj.pathname;
  } catch (e) {
    // If originalUrl is not a full URL, treat it as a path
    endpointPath = originalUrl.startsWith("/")
      ? originalUrl
      : `/${originalUrl}`;
  }

  // Get specific alternatives for this endpoint if available
  const specificAlternatives = findAlternativeEndpoint(endpointPath);

  const endpointVariations = [
    endpointPath, // Original
    endpointPath.replace("/api/", "/"), // Without api prefix
    ...specificAlternatives,
    // Generic patterns
    `/users${endpointPath.includes("login") ? "/login" : "/register"}`,
    `/api/users${endpointPath.includes("login") ? "/login" : "/register"}`,
    endpointPath.replace("/api/users/", "/api/auth/"),
    endpointPath.replace("/api/users/", "/user/"),
  ];

  let lastError = null;

  // Try each endpoint variation
  for (const endpoint of endpointVariations) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      let response;

      // Add withCredentials to all requests
      const configWithCredentials = {
        ...options,
        withCredentials: true
      };

      if (method.toLowerCase() === "get") {
        response = await apiClient.get(endpoint, configWithCredentials);
      } else if (method.toLowerCase() === "post") {
        response = await apiClient.post(endpoint, data, configWithCredentials);
      } else if (method.toLowerCase() === "put") {
        response = await apiClient.put(endpoint, data, configWithCredentials);
      } else {
        response = await apiClient[method.toLowerCase()](endpoint, configWithCredentials);
      }

      console.log(`Success with endpoint: ${endpoint}`);

      // Store successful endpoint mapping for future use
      const storedMappings = JSON.parse(
        sessionStorage.getItem("endpoint_mappings") || "{}"
      );
      storedMappings[endpointPath] = endpoint;
      sessionStorage.setItem("endpoint_mappings", JSON.stringify(storedMappings));

      return response;
    } catch (error) {
      lastError = error;
      console.log(`Failed with endpoint ${endpoint}:`, error.message);

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
  (response) => {
    // Record response time for performance monitoring
    if (response.config._requestTime) {
      const duration = Date.now() - response.config._requestTime;
      console.log(`Response from ${response.config.url} took ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    // Don't attempt redirection if we're already redirecting
    if (isRedirecting) {
      return Promise.reject(error);
    }

    // For 404 errors, try alternative endpoints if this is a GET request
    if (
      error.response &&
      error.response.status === 404 &&
      error.config.method === "get"
    ) {
      try {
        // Extract just the path from the full URL
        let path;
        try {
          const urlObj = new URL(error.config.url, API_URL);
          path = urlObj.pathname;
        } catch (e) {
          path = error.config.url.startsWith("/")
            ? error.config.url
            : `/${error.config.url}`;
        }

        // Check if we have a known mapping for this endpoint
        const storedMappings = JSON.parse(
          sessionStorage.getItem("endpoint_mappings") || "{}"
        );
        if (storedMappings[path]) {
          // Try the known working endpoint
          const newConfig = { ...error.config, url: storedMappings[path] };
          return apiClient(newConfig);
        }

        // Try alternatives
        const specificAlternatives = findAlternativeEndpoint(path);
        if (specificAlternatives.length > 0) {
          for (const altPath of specificAlternatives) {
            try {
              const newConfig = { ...error.config, url: altPath };
              const response = await apiClient(newConfig);

              // Store successful mapping
              storedMappings[path] = altPath;
              sessionStorage.setItem(
                "endpoint_mappings",
                JSON.stringify(storedMappings)
              );

              return response;
            } catch (altError) {
              // Continue to next alternative
            }
          }
        }
      } catch (retryError) {
        console.log("Error trying alternative endpoints:", retryError);
      }
    }

    // Handle authentication errors - 401 and 403
    if (error.response && [401, 403].includes(error.response.status)) {
      // Skip refresh if the original request was already a refresh attempt
      if (error.config.url.includes("refresh")) {
        isRedirecting = true;

        // Clean up and trigger redirect
        removeTokens();

        window.dispatchEvent(new CustomEvent("user:expired"));

        setTimeout(() => {
          isRedirecting = false;
          // Redirect to login page with expired parameter
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login?expired=true";
          }
        }, 500);

        return Promise.reject(error);
      }

      // Try token refresh if not already refreshing
      if (!isRefreshing) {
        isRefreshing = true;
        const originalRequest = error.config;
        originalRequest._retry = true;

        try {
          const newToken = await refreshToken();

          // If refresh successful, retry the original request
          if (newToken) {
            // Update headers with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            // Remove problematic custom header
            // originalRequest.headers["x-auth-token"] = newToken;

            isRefreshing = false;
            onTokenRefreshed(newToken);

            return apiClient(originalRequest);
          } else {
            // If refresh fails, redirect to login
            throw new Error("Token refresh failed");
          }
        } catch (refreshError) {
          isRefreshing = false;
          console.error("Token refresh failed:", refreshError);

          // Redirect to login if refresh token is invalid or expired
          if (!window.location.pathname.includes("/login") && !isRedirecting) {
            isRedirecting = true;

            // Clean up tokens
            removeTokens();

            // Dispatch events
            window.dispatchEvent(new CustomEvent("user:expired"));

            setTimeout(() => {
              isRedirecting = false;
              // Redirect to login page with expired parameter
              window.location.href = "/login?expired=true";
            }, 500);
          }
        }
      } else {
        // If already refreshing, wait for the new token then retry
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            error.config.headers.Authorization = `Bearer ${token}`;
            // Remove problematic custom header
            // error.config.headers["x-user-token"] = token;
            resolve(apiClient(error.config));
          });
        });
      }
    }

    // Log API errors with context
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
      // First check if we have a known working alternative
      const storedMappings = JSON.parse(
        sessionStorage.getItem("endpoint_mappings") || "{}"
      );
      if (storedMappings[endpoint]) {
        try {
          await apiClient.head(storedMappings[endpoint]);
          return true;
        } catch (mappedError) {
          // Continue with original endpoint if mapped one fails
        }
      }

      await apiClient.head(endpoint);
      return true;
    } catch (error) {
      console.log(`${endpoint} endpoint not available`);

      // Try alternatives
      try {
        const specificAlternatives = findAlternativeEndpoint(endpoint);
        for (const altEndpoint of specificAlternatives) {
          try {
            await apiClient.head(altEndpoint);
            console.log(`Found working alternative: ${altEndpoint}`);

            // Store this mapping
            const storedMappings = JSON.parse(
              sessionStorage.getItem("endpoint_mappings") || "{}"
            );
            storedMappings[endpoint] = altEndpoint;
            sessionStorage.setItem(
              "endpoint_mappings",
              JSON.stringify(storedMappings)
            );

            return true;
          } catch (altError) {
            // Continue to next alternative
          }
        }
      } catch (retryError) {
        // Ignore errors in the retry logic
      }

      return false;
    }
  },

  // Fetch data with fallback and error handling
  fetchWithFallback: async (endpoint, fallbackData = null) => {
    try {
      // Check for known working endpoint
      const storedMappings = JSON.parse(
        sessionStorage.getItem("endpoint_mappings") || "{}"
      );
      if (storedMappings[endpoint]) {
        try {
          const response = await apiClient.get(storedMappings[endpoint]);
          return response.data;
        } catch (mappedError) {
          // Fall through to try original endpoint
        }
      }

      // Try original endpoint
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      // Try alternatives if 404
      if (error.response && error.response.status === 404) {
        try {
          const response = await tryAlternativeEndpoints(
            endpoint,
            null,
            {},
            "get"
          );
          return response.data;
        } catch (altError) {
          console.log(
            `Error fetching from ${endpoint} and alternatives:`,
            altError.message
          );
        }
      } else {
        console.log(`Error fetching from ${endpoint}:`, error.message);
      }

      return fallbackData;
    }
  },

  // Try login with multiple endpoint variations
  tryLogin: async (credentials) => {
    // Try to use previously successful endpoint if available
    const previousEndpoint = sessionStorage.getItem("successful_login_endpoint") || 
                             localStorage.getItem("successful_login_endpoint");
    if (previousEndpoint) {
      try {
        const response = await apiClient.post(previousEndpoint, credentials);

        // Store both access and refresh tokens if available
        if (response.data && response.data.token) {
          const refreshToken = response.data.refreshToken || null;
          storeTokens(response.data.token, refreshToken);

          // Save the endpoint for future use
          sessionStorage.setItem("successful_login_endpoint", previousEndpoint);
          return response;
        }
      } catch (error) {
        // If previous endpoint fails, fall back to trying all variations
        console.log("Previous successful endpoint failed, trying alternatives");
      }
    }

    try {
      const response = await tryAlternativeEndpoints(
        "/api/user/login",
        credentials,
        {},
        "post"
      );

      // Store both access and refresh tokens if available
      if (response.data && response.data.token) {
        const refreshToken = response.data.refreshToken || null;
        storeTokens(response.data.token, refreshToken);

        // Extract the endpoint path from the full URL
        try {
          // Make sure we have a valid URL by prepending API_URL if needed
          const fullUrl = response.config.url.startsWith("http")
            ? response.config.url
            : `${API_URL}${response.config.url}`;
          const urlObj = new URL(fullUrl);
          sessionStorage.setItem("successful_login_endpoint", urlObj.pathname);
        } catch (urlError) {
          // Fallback: just store the raw path if URL parsing fails
          console.log("Error parsing URL:", urlError.message);
          const path = response.config.url || "";
          // Extract just the path portion if it contains a full URL
          const pathOnly = path.includes("://")
            ? path.split("/").slice(3).join("/")
            : path;
          sessionStorage.setItem(
            "successful_login_endpoint",
            pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`
          );
        }
      }

      return response;
    } catch (error) {
      console.error("All login attempts failed:", error);
      throw error;
    }
  },

  // Check authentication status
  isAuthenticated: () => {
    const { token } = getTokens();
    if (!token) return false;
    return !isTokenExpired(token);
  },

  // Get current auth token
  getToken: () => getTokens().token,

  // Get refresh token
  getRefreshToken: () => getTokens().refreshToken,

  // Force logout
  logout: () => {
    removeTokens();
    window.dispatchEvent(new CustomEvent("user:logout"));
  },

  // External function to refresh token that can be called from components
  refreshAuthToken: async () => {
    if (isRefreshing) {
      // If already refreshing, wait for it to complete
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          resolve(!!token);
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshToken();
      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);
        return true;
      }
      return false;
    } catch (error) {
      isRefreshing = false;
      console.error("Error refreshing token:", error);
      return false;
    }
  },

  // Check if token needs refreshing and refresh it if needed
  refreshTokenIfNeeded: async () => {
    const { token } = getTokens();
    if (token && isTokenExpired(token) && !isRefreshing) {
      return await apiHelper.refreshAuthToken();
    }
    return true; // Token either valid or not present
  },

  // Handle missing endpoints gracefully
  handleMissingEndpoint: async (endpoint, fallbackData = null) => {
    // Check if we know this endpoint is unavailable (to avoid repeated attempts)
    const unavailableEndpoints = JSON.parse(
      sessionStorage.getItem("unavailable_endpoints") || "[]"
    );

    if (unavailableEndpoints.includes(endpoint)) {
      console.log(`Skipping known unavailable endpoint: ${endpoint}`);
      return fallbackData;
    }

    try {
      return await apiHelper.fetchWithFallback(endpoint, fallbackData);
    } catch (error) {
      // Add better error handling from second snippet
      if (error.response && error.response.status === 404) {
        console.log(`Endpoint ${endpoint} not found (404)`);
      } else if (error.response && error.response.status === 400) {
        console.log(`Bad request for endpoint ${endpoint} (400)`);
      } else {
        console.error(`Error accessing ${endpoint}:`, error.message);
      }

      // Mark as unavailable for future reference
      unavailableEndpoints.push(endpoint);
      sessionStorage.setItem(
        "unavailable_endpoints",
        JSON.stringify([...new Set(unavailableEndpoints)])
      );
      return fallbackData;
    }
  },

  // Try multiple endpoints for the same resource
  tryAlternateEndpoints: async (endpoints, fallbackValue = null) => {
    for (const endpoint of endpoints) {
      try {
        const isAvailable = await apiHelper.checkEndpointAvailability(endpoint);

        if (isAvailable) {
          const response = await apiClient.get(endpoint);
          return response.data;
        }
      } catch (error) {
        console.log(
          `Failed to fetch from alternate endpoint ${endpoint}:`,
          error.message
        );
        // Continue to next endpoint
      }
    }

    // If all endpoints fail, return the fallback
    console.log(`All alternate endpoints failed, using fallback`);
    return fallbackValue;
  },
};

export { apiHelper, FRONTEND_URL, API_URL, getTokens, storeTokens };
export default apiClient;