import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
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
import "../../CSS/Login.css";

// Import the enhanced SessionManager
import { SessionManager } from "../../utils/SessionManager";

const UserLogin = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [inputFocus, setInputFocus] = useState({
    email: false,
    password: false,
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [serverStatus, setServerStatus] = useState("online"); // "checking", "online", "offline"
  const navigate = useNavigate();

  // Check for existing session
  useEffect(() => {
    // Check if already authenticated with valid token - use isUserAuthenticated instead of isAuthenticated
    if (SessionManager.isUserAuthenticated()) {
      navigate("/dashboard");
      return;
    }
    
    // Try to transfer from localStorage if needed
    const transferred = SessionManager.transferFromLocalStorage();
    if (transferred) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    setError("");
  };

  const handleFocus = (field) => {
    setInputFocus({ ...inputFocus, [field]: true });
  };

  const handleBlur = (field) => {
    setInputFocus({ ...inputFocus, [field]: false });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!credentials.email || !credentials.password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Configure axios with CORS settings
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        credentials,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      // Extract token and user data
      const token = response.data.token;
      if (!token) {
        setError("Server response missing authentication token");
        setLoading(false);
        return;
      }

      // User information
      const userData = {
        name: response.data.name || "User",
        email: response.data.email || "",
        userId: response.data.userId || "",
        authenticated: true,
        loginTime: new Date().toISOString()
      };

      // Store token using the appropriate SessionManager method
      SessionManager.setUserToken(token);
      
      // Always store token in localStorage to prevent dashboard errors
      localStorage.setItem("token", token);
      
      // Store user info in SessionManager
      SessionManager.setItem("userName", userData.name);
      SessionManager.setItem("userEmail", userData.email);
      SessionManager.setItem("userId", userData.userId);
      SessionManager.setItem("loginTime", userData.loginTime);
      
      // If rememberMe is checked, store user info in localStorage as well
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", credentials.email);
        localStorage.setItem("userName", userData.name);
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userId", userData.userId);
        localStorage.setItem("loginTime", userData.loginTime);
      }
      
      // Configure axios default headers for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.headers.common['x-user-token'] = token;
      
      setSuccess(true);

      // Log successful authentication
      console.log("Authentication successful. Token stored and headers configured.");

      // Redirect with a short delay for better UX
      setTimeout(() => {
        if (response.data.role === "host") {
          navigate("/host-dashboard");
        } else {
          navigate("/dashboard", {
            state: {
              authenticated: true,
              userName: userData.name,
              userId: userData.userId,
              userEmail: userData.email,
            },
          });
        }
      }, 800);
    } catch (err) {
      console.error("Login error:", err);
      
      if (err.response) {
        // Server responded with an error
        const serverMessage = err.response.data.message || err.response.data.error || err.response.statusText;
        setError(`Login failed: ${serverMessage}`);
      } else if (err.request) {
        // Request was made but no response
        setError("Server not responding. Please try again later.");
        setServerStatus("offline");
      } else {
        // Error in request setup
        setError(`Login failed: ${err.message}`);
      }
      
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
                  onChange={handleRememberMeChange}
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

export default UserLogin;