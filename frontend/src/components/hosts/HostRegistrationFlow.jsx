import React, { useState, useEffect } from "react";
import "../../CSS/HostRegistrationFlow.css";

const HostRegistrationFlow = () => {
  // Authentication state
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(2); // Starting at sign in (step 2)

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  // Handle sign in
  const handleSignIn = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would verify credentials with your backend
      if (credentials.email && credentials.password) {
        // Success - redirect to next step
        setCurrentStep(3);
      } else {
        setError("Please enter both email and password");
      }
      setLoading(false);
    }, 1000);
  };

  // Handle navigation to sign up page
  const navigateToSignUp = (e) => {
    e.preventDefault();
    setCurrentStep(1);
  };

  // Render sign in form
  const renderSignInForm = () => (
    <div className="registration-container">
      <div className="registration-header">
        <h1>Welcome Back</h1>
        <p>Sign in to continue your host application</p>
      </div>

      <div className="progress-container">
        <div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
          <div className="step-number">1</div>
          <span>Sign Up</span>
        </div>
        <div className={`progress-step ${currentStep >= 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <span>Sign In</span>
        </div>
        <div className={`progress-step ${currentStep >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <span>Basic Info</span>
        </div>
        <div className={`progress-step ${currentStep >= 4 ? "active" : ""}`}>
          <div className="step-number">4</div>
          <span>Details</span>
        </div>
      </div>

      <form onSubmit={handleSignIn} className="registration-form">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="primary-button" 
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="form-footer">
        <p>Don't have an account? <a href="#" onClick={navigateToSignUp}>Sign Up</a></p>
      </div>
    </div>
  );

  // Render sign up form (step 1)
  const renderSignUpForm = () => (
    <div className="registration-container">
      <div className="registration-header">
        <h1>Create Account</h1>
        <p>Sign up to start your host application</p>
      </div>

      <div className="progress-container">
        <div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
          <div className="step-number">1</div>
          <span>Sign Up</span>
        </div>
        <div className={`progress-step ${currentStep >= 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <span>Sign In</span>
        </div>
        <div className={`progress-step ${currentStep >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <span>Basic Info</span>
        </div>
        <div className={`progress-step ${currentStep >= 4 ? "active" : ""}`}>
          <div className="step-number">4</div>
          <span>Details</span>
        </div>
      </div>

      {/* Sign up form would go here */}
      <div className="form-footer">
        <p>Already have an account? <a href="#" onClick={() => setCurrentStep(2)}>Sign In</a></p>
      </div>
    </div>
  );

  // Render basic info form (step 3)
  const renderBasicInfoForm = () => (
    <div className="registration-container">
      <div className="registration-header">
        <h1>Basic Information</h1>
        <p>Tell us about yourself</p>
      </div>

      <div className="progress-container">
        <div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
          <div className="step-number">1</div>
          <span>Sign Up</span>
        </div>
        <div className={`progress-step ${currentStep >= 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <span>Sign In</span>
        </div>
        <div className={`progress-step ${currentStep >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <span>Basic Info</span>
        </div>
        <div className={`progress-step ${currentStep >= 4 ? "active" : ""}`}>
          <div className="step-number">4</div>
          <span>Details</span>
        </div>
      </div>

      {/* Basic info form would go here */}
      <div className="form-footer">
        <button 
          onClick={() => setCurrentStep(4)} 
          className="primary-button"
        >
          Continue
        </button>
      </div>
    </div>
  );

  return (
    <div className="host-registration-container">
      {currentStep === 1 && renderSignUpForm()}
      {currentStep === 2 && renderSignInForm()}
      {currentStep === 3 && renderBasicInfoForm()}
      {/* Additional steps would be rendered here */}
    </div>
  );
};

export default HostRegistrationFlow;