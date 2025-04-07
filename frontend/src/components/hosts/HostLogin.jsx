import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../CSS/HostLogin.css";

const HostLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const hostToken = localStorage.getItem("hostToken");

    // Only redirect if there's actually a valid token
    // Make sure it's not an expired or invalid token
    if (hostToken && hostToken !== "undefined" && hostToken !== "null") {
      console.log("Valid token found, redirecting to dashboard...");
      navigate("/host-dashboard");
    } else {
      // If token is invalid, remove it
      localStorage.removeItem("hostToken");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
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

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned non-JSON response. Please check server configuration."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Only save token after successful API call
      console.log("Token received from server:", data.token);

      // Make sure we're saving a valid token
      if (data.token) {
        localStorage.setItem("hostToken", data.token);
        // Handle successful login
        navigate("/host-dashboard");
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError(error.message || "Failed to login");
      // Clear any invalid tokens
      localStorage.removeItem("hostToken");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="host-login-container">
      <div className="host-login-wrapper">
        <div className="host-login-left">
          <div className="host-login-brand">
            <h2>Host Portal</h2>
            <p>Manage your properties and bookings in one place</p>
          </div>
          <div className="host-login-illustration">
            <img src="/api/placeholder/500/420" alt="Host illustration" />
          </div>
        </div>

        <div className="host-login-right">
          <div className="host-login-card">
            <div className="host-login-header">
              <h1>Welcome Back</h1>
              <p>Please log in to access your host dashboard</p>
            </div>

            {error && <div className="host-error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="host-login-form">
              <div className="host-form-group">
                <label htmlFor="email">Email Address</label>
                <div className="host-input-with-icon">
                  <div className="host-input-icon">
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

              <div className="host-form-group">
                <div className="host-password-header">
                  <label htmlFor="password">Password</label>
                  <a href="/forgot-password" className="host-forgot-password">
                    Forgot Password?
                  </a>
                </div>
                <div className="host-input-with-icon">
                  <div className="host-input-icon">
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
                    className="host-password-toggle"
                    onClick={togglePasswordVisibility}
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

              <div className="host-remember-me">
                <label className="host-checkbox-container">
                  <input type="checkbox" />
                  <span className="host-checkbox"></span>
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                className="host-login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="host-spinner"></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="host-login-divider">
              <span>or</span>
            </div>

            <div className="host-social-login">
              <button className="host-google-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="#4285F4"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>

            <div className="host-login-footer">
              <p>
                Don't have an account?{" "}
                <a href="/become-host" className="host-link">
                  Become a Host
                </a>
              </p>
              <a href="/" className="host-home-link">
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
