import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient, {
  apiHelper,
  API_URL,
  getTokens,
  storeTokens,
} from "../../utils/apiClient";
import "../../CSS/Login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverTesting, setServerTesting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking"); // "checking", "online", "offline"
  const navigate = useNavigate();
  const location = useLocation();

  // Check server status on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Try to access the base API URL to check if server is running
        await fetch(API_URL, { method: "HEAD", mode: "no-cors" });
        setServerStatus("online");
      } catch (error) {
        console.error("Server connection error:", error);
        setServerStatus("offline");
        setMessage({
          type: "error",
          text: "Cannot connect to the server. Please make sure the backend server is running.",
        });
      }
    };

    checkServerStatus();
  }, []);

  // Check for URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Handle expired session message
    if (params.get("expired")) {
      const reason = params.get("reason") || "session_expired";
      let errorMessage = "Your session has expired. Please log in again.";

      if (reason === "inactivity") {
        errorMessage =
          "You've been logged out due to inactivity. Please log in again.";
      }

      setMessage({ type: "warning", text: errorMessage });
    }
    // Handle logout message
    else if (params.get("logout") === "true") {
      setMessage({
        type: "info",
        text: "You have been successfully logged out.",
      });
    }
  }, [location.search]);

  // Add event listener for auth expired events
  useEffect(() => {
    const handleAuthExpired = () => {
      setMessage({
        type: "warning",
        text: "Your session has expired. Please log in again.",
      });
    };

    window.addEventListener("user:expired", handleAuthExpired);

    return () => {
      window.removeEventListener("user:expired", handleAuthExpired);
    };
  }, []);

  // Check for remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setCredentials((prev) => ({
        ...prev,
        email: rememberedEmail,
      }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const testServerConnection = async () => {
    setServerTesting(true);
    setMessage({ type: "info", text: "Testing server connection..." });

    try {
      // Try different API endpoints to see if any respond
      const endpoints = ["/", "/api", "/health", "/api/health", "/api/status"];
      let serverFound = false;

      for (const endpoint of endpoints) {
        try {
          await fetch(`${API_URL}${endpoint}`, {
            method: "HEAD",
            mode: "no-cors",
            timeout: 2000,
          });
          serverFound = true;
          console.log(`Server responded at: ${endpoint}`);
          break;
        } catch (err) {
          console.log(`Endpoint ${endpoint} not available`);
        }
      }

      if (serverFound) {
        setServerStatus("online");
        setMessage({
          type: "success",
          text: "Server is reachable! You can now attempt to login.",
        });
      } else {
        setServerStatus("offline");
        setMessage({
          type: "error",
          text: "Cannot connect to the server. Please verify the backend server is running.",
        });
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      setServerStatus("offline");
      setMessage({
        type: "error",
        text: "Server connection test failed. The backend may be unreachable.",
      });
    } finally {
      setServerTesting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!credentials.email || !credentials.password) {
      setMessage({
        type: "error",
        text: "Please enter both email and password.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Attempting to log in..." });

    try {
      console.log("Attempting login with:", credentials.email);

      // Try login with multiple possible endpoints using the enhanced tryLogin method
      const response = await apiHelper.tryLogin(credentials);
      console.log("Login response:", response);

      if (response.status === 200 && response.data.token) {
        // Store user role if available
        if (response.data.role) {
          localStorage.setItem("userRole", response.data.role);
        }

        // Remember me functionality
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", credentials.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        setMessage({
          type: "success",
          text: "Login successful! Redirecting...",
        });

        // Check if there's a saved redirect path
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");

        // Redirect after a short delay
        setTimeout(() => {
          if (redirectPath) {
            sessionStorage.removeItem("redirectAfterLogin");
            navigate(redirectPath);
          } else {
            // Redirect based on role
            const role = response.data.role || localStorage.getItem("userRole");
            if (role === "host") {
              navigate("/host-dashboard");
            } else {
              navigate("/dashboard");
            }
          }
        }, 1000);
      } else {
        setMessage({
          type: "error",
          text:
            response.data.message ||
            "Login failed. Please check your credentials.",
        });
      }
    } catch (err) {
      console.error("Login error:", err);

      // Enhanced error handling
      if (!err.response) {
        setMessage({
          type: "error",
          text: "Network error: Cannot connect to the server. Please check your internet connection and ensure the server is running.",
        });
        setServerStatus("offline");
      } else if (err.response.status === 404) {
        setMessage({
          type: "error",
          text: "The login service could not be found. The system will try alternative endpoints automatically.",
        });

        // Try to find alternative endpoints
        try {
          setMessage({
            type: "info",
            text: "Attempting to find login endpoint...",
          });
          const loginEndpoints = [
            "/api/users/login",
            "/users/login",
            "/api/user/signin",
            "/api/users/signin",
            "/api/login",
            "/login",
          ];

          for (const endpoint of loginEndpoints) {
            try {
              console.log(`Trying alternative login endpoint: ${endpoint}`);
              const altResponse = await apiClient.post(endpoint, credentials);

              if (altResponse.status === 200 && altResponse.data.token) {
                // Store the successful endpoint
                localStorage.setItem("successful_login_endpoint", endpoint);

                // Store tokens
                if (altResponse.data.refreshToken) {
                  storeTokens(
                    altResponse.data.token,
                    altResponse.data.refreshToken
                  );
                } else {
                  storeTokens(altResponse.data.token);
                }

                if (altResponse.data.role) {
                  localStorage.setItem("userRole", altResponse.data.role);
                }

                // Remember email if needed
                if (rememberMe) {
                  localStorage.setItem("rememberedEmail", credentials.email);
                }

                setMessage({
                  type: "success",
                  text: "Login successful! Redirecting...",
                });

                setTimeout(() => {
                  const redirectPath =
                    sessionStorage.getItem("redirectAfterLogin");
                  if (redirectPath) {
                    sessionStorage.removeItem("redirectAfterLogin");
                    navigate(redirectPath);
                  } else {
                    navigate(
                      altResponse.data.role === "host"
                        ? "/host-dashboard"
                        : "/dashboard"
                    );
                  }
                }, 1000);

                return; // Exit the function if successful
              }
            } catch (altErr) {
              console.log(
                `Alternative endpoint ${endpoint} failed:`,
                altErr.message
              );
            }
          }

          // If we get here, all alternatives failed
          setMessage({
            type: "error",
            text: "Could not find a working login endpoint. Please contact your system administrator.",
          });
        } catch (altAttemptErr) {
          setMessage({
            type: "error",
            text: "Failed to try alternative login methods. Please try again later.",
          });
        }
      } else {
        setMessage({
          type: "error",
          text:
            err.response?.data?.message ||
            "Invalid email or password. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
        padding: "3rem 1rem",
      }}
    >
      <div
        className="login-form-wrapper"
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "0.5rem",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "24rem",
          transition: "transform 0.3s ease",
        }}
      >
        <h2
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            textAlign: "center",
            color: "#1f2937",
            marginBottom: "1.5rem",
          }}
        >
          Sign In
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#4b5563",
            marginBottom: "1rem",
          }}
        >
          Please enter your credentials
        </p>

        {/* Server status indicator */}
        {serverStatus === "offline" && (
          <div
            style={{
              padding: "0.75rem",
              borderRadius: "0.375rem",
              marginBottom: "1rem",
              backgroundColor: "#FEE2E2",
              color: "#B91C1C",
              fontSize: "0.875rem",
            }}
          >
            ⚠️ Server connection error. Please make sure the backend server is
            running.
            <button
              type="button"
              onClick={testServerConnection}
              disabled={serverTesting}
              style={{
                display: "block",
                width: "100%",
                marginTop: "0.5rem",
                padding: "0.375rem",
                fontSize: "0.75rem",
                backgroundColor: "#DC2626",
                color: "white",
                border: "none",
                borderRadius: "0.25rem",
                cursor: serverTesting ? "default" : "pointer",
              }}
            >
              {serverTesting ? "Testing..." : "Test Connection"}
            </button>
          </div>
        )}

        {/* Display message notifications */}
        {message && (
          <div
            style={{
              padding: "0.75rem",
              borderRadius: "0.375rem",
              marginBottom: "1rem",
              backgroundColor:
                message.type === "warning"
                  ? "#FEF3C7"
                  : message.type === "error"
                  ? "#FEE2E2"
                  : message.type === "success"
                  ? "#D1FAE5"
                  : message.type === "info"
                  ? "#E0F2FE"
                  : "#E0F2FE",
              color:
                message.type === "warning"
                  ? "#92400E"
                  : message.type === "error"
                  ? "#B91C1C"
                  : message.type === "success"
                  ? "#065F46"
                  : message.type === "info"
                  ? "#1E40AF"
                  : "#1E40AF",
              fontSize: "0.875rem",
            }}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          style={{ marginTop: "1.5rem" }}
          className="login-form"
        >
          <div style={{ marginBottom: "1.5rem" }} className="form-group">
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              autoComplete="email"
              style={{
                display: "block",
                width: "100%",
                padding: "0.625rem 1rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                outline: "none",
                transition: "all 0.3s ease-in-out",
                fontSize: "1rem",
                marginTop: "0.5rem",
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.3)";
                e.target.style.borderColor = "#3b82f6";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }} className="form-group">
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              style={{
                display: "block",
                width: "100%",
                padding: "0.625rem 1rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                outline: "none",
                transition: "all 0.3s ease-in-out",
                fontSize: "1rem",
                marginTop: "0.5rem",
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.3)";
                e.target.style.borderColor = "#3b82f6";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                style={{
                  height: "1rem",
                  width: "1rem",
                  borderRadius: "0.25rem",
                  accentColor: "#2563eb",
                }}
              />
              <label
                htmlFor="remember"
                style={{
                  marginLeft: "0.5rem",
                  fontSize: "0.875rem",
                  color: "#4b5563",
                }}
              >
                Remember Me
              </label>
            </div>

            <a
              href="/forgot-password"
              style={{
                fontSize: "0.875rem",
                color: "#2563eb",
                textDecoration: "none",
                transition: "color 0.3s",
              }}
              onMouseOver={(e) => (e.target.style.color = "#1d4ed8")}
              onMouseOut={(e) => (e.target.style.color = "#2563eb")}
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading || serverStatus === "offline"}
            className="login-button"
            style={{
              width: "100%",
              backgroundColor:
                loading || serverStatus === "offline" ? "#93C5FD" : "#2563eb",
              color: "white",
              padding: "0.75rem",
              borderRadius: "0.375rem",
              border: "none",
              fontWeight: "500",
              cursor:
                loading || serverStatus === "offline" ? "default" : "pointer",
              transition: "background-color 0.3s",
              marginBottom: "1.5rem",
              fontSize: "1rem",
            }}
            onMouseOver={(e) => {
              if (!loading && serverStatus !== "offline")
                e.target.style.backgroundColor = "#1d4ed8";
            }}
            onMouseOut={(e) => {
              if (!loading && serverStatus !== "offline")
                e.target.style.backgroundColor = "#2563eb";
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <div
            style={{
              textAlign: "center",
              margin: "1.5rem 0",
              position: "relative",
            }}
          >
            <span
              style={{
                backgroundColor: "white",
                padding: "0 0.75rem",
                color: "#6b7280",
                position: "relative",
                zIndex: "1",
              }}
            >
              Or sign in with
            </span>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                right: "0",
                height: "1px",
                backgroundColor: "#e5e7eb",
                zIndex: "0",
              }}
            ></div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <button
              type="button"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                color: "#4b5563",
                cursor: "pointer",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                backgroundColor: "white",
                fontSize: "0.875rem",
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.color = "#2563eb";
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.color = "#4b5563";
              }}
            >
              <i className="fab fa-google"></i> Google
            </button>
            <button
              type="button"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                color: "#4b5563",
                cursor: "pointer",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                backgroundColor: "white",
                fontSize: "0.875rem",
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.color = "#2563eb";
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.color = "#4b5563";
              }}
            >
              <i className="fab fa-facebook-f"></i> Facebook
            </button>
          </div>

          <div className="login-links">
            <p
              style={{
                textAlign: "center",
                color: "#6b7280",
                marginTop: "1rem",
                fontSize: "0.875rem",
              }}
            >
              Don't have an account?
              <a
                href="/register"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  transition: "color 0.3s",
                  marginLeft: "0.25rem",
                }}
                onMouseOver={(e) => (e.target.style.color = "#1d4ed8")}
                onMouseOut={(e) => (e.target.style.color = "#2563eb")}
              >
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
