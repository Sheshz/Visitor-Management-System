import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import apiClient, {
  apiHelper,
  API_URL,
  getTokens,
  storeTokens,
} from "../../utils/apiClient";
import "../../CSS/Login.css";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiRefreshCw,
  FiAlertTriangle,
  FiKey,
  FiHome,
} from "react-icons/fi";

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
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [inputFocus, setInputFocus] = useState({
    email: false,
    password: false,
  });
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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFocus = (field) => {
    setInputFocus(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleBlur = (field) => {
    setInputFocus(prev => ({
      ...prev,
      [field]: false
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!credentials.email || !credentials.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

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

        setSuccess(true);

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
        setError(
          response.data.message ||
          "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error("Login error:", err);

      // Enhanced error handling
      if (!err.response) {
        setError("Network error: Cannot connect to the server. Please check your internet connection and ensure the server is running.");
        setServerStatus("offline");
      } else if (err.response.status === 404) {
        setError("The login service could not be found. The system will try alternative endpoints automatically.");

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

                setSuccess(true);

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
          setError("Could not find a working login endpoint. Please contact your system administrator.");
        } catch (altAttemptErr) {
          setError("Failed to try alternative login methods. Please try again later.");
        }
      } else {
        setError(
          err.response?.data?.message ||
          "Invalid email or password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="userlogin-container">
      {/* Added additional Back to Home button for better visibility */}
      <div className="userlogin-top-home-button">
        <Link to="/" className="userlogin-back-home">
          <FiHome className="userlogin-home-icon" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="userlogin-wrapper">
        <div className="userlogin-card">
          <div className="userlogin-header">
            <div className="userlogin-logo-container">
              <div className="userlogin-logo-box">
                <div className="userlogin-gp-text">GP</div>
              </div>
              <span className="userlogin-logo-text">GetPass Pro</span>
            </div>
            <h1>Welcome Back</h1>
            <p>Enter your credentials to access your secure vault</p>
          </div>

          {error && (
            <div className="userlogin-error-message" role="alert">
              <FiAlertTriangle className="userlogin-error-icon" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="userlogin-success-message" role="status">
              <span>Login successful! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="userlogin-form">
            <div className="userlogin-form-group">
              <label htmlFor="email">Email Address</label>
              <div
                className={`userlogin-input-wrapper ${
                  inputFocus.email ? "focused" : ""
                }`}
              >
                <div className="userlogin-input-icon">
                  <FiMail />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  value={credentials.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus("email")}
                  onBlur={() => handleBlur("email")}
                  required
                  autoComplete="email"
                  aria-required="true"
                />
              </div>
            </div>

            <div className="userlogin-form-group">
              <label htmlFor="password">Password</label>
              <div
                className={`userlogin-input-wrapper ${
                  inputFocus.password ? "focused" : ""
                }`}
              >
                <div className="userlogin-input-icon">
                  <FiLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus("password")}
                  onBlur={() => handleBlur("password")}
                  required
                  autoComplete="current-password"
                  aria-required="true"
                />
                <button
                  type="button"
                  className="userlogin-toggle-password"
                  onClick={toggleShowPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="userlogin-form-actions">
              <div className="userlogin-remember-me">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgot-password" className="userlogin-forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className={`userlogin-button ${loading ? "loading" : ""}`}
              disabled={loading || success}
            >
              {loading
                ? "Signing in..."
                : success
                ? "Signed in!"
                : "Sign in securely"}
            </button>
          </form>

          <div className="userlogin-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="userlogin-signup-link">
                Create account
              </Link>
            </p>
          </div>
        </div>

        <div className="userlogin-features">
          <h2>Secure Your Digital Life</h2>
          <ul className="userlogin-features-list">
            <li>
              <div className="userlogin-feature-icon">
                <FiShield />
              </div>
              <div className="userlogin-feature-text">
                <h3>Military-Grade Encryption</h3>
                <p>Your passwords are protected with AES-256 encryption</p>
              </div>
            </li>
            <li>
              <div className="userlogin-feature-icon">
                <FiRefreshCw />
              </div>
              <div className="userlogin-feature-text">
                <h3>Sync Across Devices</h3>
                <p>Access your passwords on all your devices</p>
              </div>
            </li>
            <li>
              <div className="userlogin-feature-icon">
                <FiAlertTriangle />
              </div>
              <div className="userlogin-feature-text">
                <h3>Data Breach Alerts</h3>
                <p>Get notified if your accounts are compromised</p>
              </div>
            </li>
            <li>
              <div className="userlogin-feature-icon">
                <FiKey />
              </div>
              <div className="userlogin-feature-text">
                <h3>Auto-Fill & Generate</h3>
                <p>Create strong passwords and fill forms automatically</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;