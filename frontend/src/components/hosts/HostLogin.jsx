import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SessionManager } from "../../utils/SessionManager"; // Import your SessionManager
import "../../CSS/HostLogin.css";

const HostLogin = () => {
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [forceShowLogin, setForceShowLogin] = useState(false);

  // Background image state
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // Professional business-oriented background images
  const backgroundImages = [
    "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80", // Business meeting
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80", // Doctor image
    "https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80", // Corporate trainer/presentation
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80", // Professional workspace
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop",
  ];

  // Professional testimonials
  const testimonials = [
    {
      quote:
        "GetePass Pro transformed how I manage client consultations and bookings.",
      author: "Dr. James Wilson, Business Consultant",
    },
    {
      quote:
        "Using GetePass Pro increased my client engagement by 40% in just two months.",
      author: "Michelle Lee, Financial Advisor",
    },
    {
      quote:
        "GetePass Pro helps me organize patient appointments efficiently and improve care delivery.",
      author: "Dr. Sarah Johnson, Cardiologist",
    },
    {
      quote:
        "With GetePass Pro, I can focus on delivering quality training while the platform handles all scheduling logistics.",
      author: "Dr. Lisa Thompson, Corporate Trainer",
    },
    {
      quote:
        "GetePass Pro streamlined my scheduling process and improved client satisfaction.",
      author: "Robert Chen, Executive Coach",
    },
    {
      quote:
        "The most efficient platform for managing professional appointments and meetings.",
      author: "Thomas Wright, Engineer",
    },
  ];

  // Auto-change background image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Check URL parameters for login-specific actions
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    // If logout=true or force=true param is present, clear tokens and show login form
    if (params.get("logout") === "true" || params.get("force") === "true") {
      console.log("Logout or force parameter detected, clearing tokens");
      SessionManager.logoutHost();
      localStorage.removeItem("hostToken");
      setForceShowLogin(true);
    }

    // If error parameter is present, show error message
    if (params.get("error") === "true") {
      setError("Session expired. Please login again.");
    }
  }, [location.search]);

  // Check if host is already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // First check if we should force the login page
        if (forceShowLogin) {
          console.log("Force showing login form");
          setIsCheckingAuth(false);
          return;
        }

        // Also check URL parameters again to be sure
        const params = new URLSearchParams(location.search);
        if (params.get("logout") === "true" || params.get("force") === "true") {
          console.log("URL params force login form");
          setIsCheckingAuth(false);
          return;
        }

        // Now check SessionManager for host authentication
        const isAuthenticatedInSession = SessionManager.isHostAuthenticated();
        if (isAuthenticatedInSession) {
          // Verify that this is actually a host token, not just any token
          const userRole = SessionManager.getUserRole();
          if (userRole === "host") {
            console.log("Host already authenticated via SessionManager");
            navigate("/host-dashboard");
            return;
          } else {
            console.log("User authenticated but not as host");
            SessionManager.logoutUser(); // Clear non-host tokens
            setIsCheckingAuth(false);
            return;
          }
        }

        // As a fallback, check localStorage
        const hostToken = localStorage.getItem("hostToken");
        if (
          hostToken &&
          hostToken !== "undefined" &&
          hostToken !== "null" &&
          hostToken.length > 10
        ) {
          // Verify the token with the server
          try {
            const response = await fetch(
              "http://localhost:5000/api/hosts/validate-token",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${hostToken}`,
                },
              }
            );

            const data = await response.json();

            if (response.ok && data.valid === true && data.role === "host") {
              console.log(
                "Found valid host token in localStorage, transferring to SessionManager"
              );
              // Transfer to SessionManager and redirect
              SessionManager.setHostToken(hostToken);
              navigate("/host-dashboard");
              return;
            } else {
              console.log("Invalid or expired token in localStorage");
              localStorage.removeItem("hostToken");
            }
          } catch (validationError) {
            console.error("Token validation error:", validationError);
            // If server is unavailable, we'll fall back to token expiration check
            // This is less secure but prevents being locked out if server is down
            
            // Check for token expiry info in localStorage
            const tokenExpiry = localStorage.getItem("hostTokenExpiry");
            if (tokenExpiry && parseInt(tokenExpiry) > Date.now()) {
              console.log("Token validation failed but token is not expired, using anyway");
              SessionManager.setHostToken(hostToken);
              navigate("/host-dashboard");
              return;
            } else {
              console.log("Token expired or no expiry info found");
              localStorage.removeItem("hostToken");
              localStorage.removeItem("hostTokenExpiry");
            }
          }
        }

        // If we reach here, no valid authentication found
        console.log("No valid authentication found, showing login form");
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsCheckingAuth(false);
      }
    };

    checkExistingSession();
  }, [navigate, forceShowLogin, location.search]);

  // Check for remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("gp_remember_email");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting host login with:", { email });

      const response = await fetch(
        "http://localhost:5000/api/hosts/loginHost",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned non-JSON response. Please check server configuration."
        );
      }

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.token) {
        console.log("Host authentication successful, saving token");

        // Clear any previous tokens first
        SessionManager.logoutHost();
        localStorage.removeItem("hostToken");

        // Save token in localStorage for backward compatibility
        localStorage.setItem("hostToken", data.token);
        
        // Store token expiry for fallback validation
        if (data.expiresAt) {
          localStorage.setItem("hostTokenExpiry", data.expiresAt);
        } else {
          // Default to 24 hours if no expiry provided
          const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
          localStorage.setItem("hostTokenExpiry", expiryTime.toString());
        }

        // Also save in SessionManager for better security
        SessionManager.setHostToken(data.token);

        // Clear any user tokens to prevent conflicts
        SessionManager.logoutUser();
        localStorage.removeItem("token");
        localStorage.removeItem("userToken");

        // Set role explicitly
        SessionManager.setItem("userRole", "host");

        // Save additional host info if available
        if (data.hostId) {
          localStorage.setItem("hostId", data.hostId);
          SessionManager.setItem("hostId", data.hostId);
        }

        if (data.name) {
          localStorage.setItem("hostName", data.name);
          SessionManager.setItem("hostName", data.name);
        }

        if (rememberMe) {
          localStorage.setItem("gp_remember_email", email);
        } else {
          localStorage.removeItem("gp_remember_email");
        }

        // Navigate to dashboard after successful login
        navigate("/host-dashboard");
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Failed to login");
      localStorage.removeItem("hostToken");
      SessionManager.logoutHost();
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="gp-login-container">
        <div className="gp-login-loading">
          <span className="gp-spinner"></span>
          <p>Checking login status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gp-login-container">
      <div className="gp-login-wrapper">
        <div className="gp-login-left">
          <div className="gp-login-brand">
            <h2>GetePass Pro</h2>
            <p>Share your expertise and connect with visitors</p>
          </div>
          <div
            className="gp-login-illustration"
            style={{
              backgroundImage: `url(${backgroundImages[currentBgIndex]})`,
            }}
          >
            <div className="gp-image-overlay">
              <div className="gp-testimonial">
                <p>"{testimonials[currentBgIndex].quote}"</p>
                <span>{testimonials[currentBgIndex].author}</span>
              </div>
            </div>
          </div>
          <div className="gp-image-indicators">
            {backgroundImages.map((_, index) => (
              <span
                key={index}
                className={`gp-indicator ${
                  index === currentBgIndex ? "active" : ""
                }`}
                onClick={() => setCurrentBgIndex(index)}
              />
            ))}
          </div>
        </div>

        <div className="gp-login-right">
          <div className="gp-login-card">
            <div className="gp-login-header">
              <h1>Welcome Back</h1>
              <p>Please log in to access your professional dashboard</p>
            </div>

            {error && <div className="gp-error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="gp-login-form">
              <div className="gp-form-group">
                <label htmlFor="email">Email Address</label>
                <div className="gp-input-with-icon">
                  <div className="gp-input-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="gp-form-group">
                <div className="gp-password-header">
                  <label htmlFor="password">Password</label>
                  <a href="/forgot-password" className="gp-forgot-password">
                    Forgot Password?
                  </a>
                </div>
                <div className="gp-input-with-icon">
                  <div className="gp-input-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <div
                    className="gp-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              <div className="gp-remember-me">
                <label className="gp-checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className="gp-checkbox"></span>
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                className="gp-login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="gp-spinner"></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="gp-login-footer">
              <p>
                Don't have an account?{" "}
                <a href="/become-host" className="gp-link">
                  Join as a Professional
                </a>
              </p>
              <a href="/" className="gp-home-link">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostLogin;