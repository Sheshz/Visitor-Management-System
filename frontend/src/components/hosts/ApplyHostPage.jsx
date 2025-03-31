import React, { useState, useEffect } from "react";

const ApplyHostPage = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
  });

  // Sign-up data
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  // Validation states
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [touchedFields, setTouchedFields] = useState({
    password: false,
    confirmPassword: false,
  });

  // Step tracking
  const [currentStep, setCurrentStep] = useState("signup"); // 'signup', 'auth', 'form', 'details', 'success'

  // Host profile state
  const [formData, setFormData] = useState({
    fullName: "",
    displayName: "",
    bio: "",
    expertise: [],
    location: "",
    experience: "",
    avatar: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      website: "",
    },
    skills: [],
  });

  const [tempSkill, setTempSkill] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Check password match and strength whenever password or confirmPassword changes
  useEffect(() => {
    // Check if passwords match
    if (touchedFields.confirmPassword || touchedFields.password) {
      setPasswordsMatch(
        signupData.password === signupData.confirmPassword || 
        signupData.confirmPassword === ""
      );
    }
    
    // Evaluate password strength
    if (signupData.password) {
      const strength = calculatePasswordStrength(signupData.password);
      setPasswordStrength(strength);
      
      if (strength < 2) {
        setPasswordFeedback("Weak: Use at least 8 characters with letters, numbers and symbols");
      } else if (strength < 4) {
        setPasswordFeedback("Medium: Add more variety in characters");
      } else {
        setPasswordFeedback("Strong password");
      }
    } else {
      setPasswordStrength(0);
      setPasswordFeedback("");
    }
  }, [signupData.password, signupData.confirmPassword, touchedFields]);

  // Password strength calculator function
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 5);
  };

  // Handle field blur for validation
  const handleFieldBlur = (fieldName) => {
    setTouchedFields({
      ...touchedFields,
      [fieldName]: true
    });
  };

  // Handle navigation back to home
  const handleGoHome = () => {
    window.location.href = "/";
  };

  // Handle sign-up data change
  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value,
    });
  };

  // Handle sign-up form submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    if (signupData.password !== signupData.confirmPassword) {
      setMessage("Passwords don't match");
      setPasswordsMatch(false);
      return;
    }
    
    if (passwordStrength < 2) {
      setMessage("Please use a stronger password");
      return;
    }
    
    setLoading(true);

    try {
      const endpoint = "http://localhost:5000/api/users/register";

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          firstName: signupData.firstName,
          lastName: signupData.lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("");
        // Pre-fill sign-in email from signup
        setAuthData({
          ...authData,
          email: signupData.email,
        });
        setCurrentStep("auth");
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch (err) {
      setMessage("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  // Handle auth data change
  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthData({
      ...authData,
      [name]: value,
    });
  };

  // Handle auth form submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = "http://localhost:5000/api/users/login";

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authData),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token to localStorage
        localStorage.setItem("authToken", data.token);
        setIsAuthenticated(true);
        setCurrentStep("form");
        setMessage("");
      } else {
        setMessage(data.message || "Authentication failed.");
      }
    } catch (err) {
      setMessage("An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  // Handle host profile form data change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle expertise selection
  const handleExpertiseChange = (expertise) => {
    if (formData.expertise.includes(expertise)) {
      setFormData({
        ...formData,
        expertise: formData.expertise.filter((item) => item !== expertise),
      });
    } else {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, expertise],
      });
    }
  };

  // Handle adding skills
  const handleAddSkill = () => {
    if (tempSkill.trim() && !formData.skills.includes(tempSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, tempSkill.trim()],
      });
      setTempSkill("");
    }
  };

  // Handle removing skills
  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  // Move to next step
  const handleNextStep = () => {
    if (currentStep === "form") {
      setCurrentStep("details");
    } else if (currentStep === "details") {
      handleSubmit();
    }
  };

  // Move to previous step
  const handlePrevStep = () => {
    if (currentStep === "details") {
      setCurrentStep("form");
    } else if (currentStep === "auth") {
      setCurrentStep("signup");
    }
  };

  // Handle host application submission
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/api/host/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Your application has been submitted.");
        setCurrentStep("success");
      } else {
        setMessage(data.message || "Failed to submit application.");
      }
    } catch (err) {
      setMessage("An error occurred while submitting your profile.");
    } finally {
      setLoading(false);
    }
  };

  // Common styles
  const styles = {
    container: {
      maxWidth: "700px",
      margin: "0 auto",
      padding: "30px",
      fontFamily: "Inter, Arial, sans-serif",
      backgroundColor: "#f9fafb",
    },
    card: {
      padding: "30px",
      borderRadius: "12px",
      backgroundColor: "#fff",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      marginBottom: "20px",
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#0a66c2",
      marginBottom: "10px",
    },
    subtitle: {
      fontSize: "16px",
      color: "#666",
      lineHeight: "1.5",
    },
    formGroup: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
      color: "#333",
      fontSize: "15px",
    },
    input: {
      width: "100%",
      padding: "12px 15px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      fontSize: "16px",
      transition: "border 0.2s",
      boxSizing: "border-box",
    },
    inputError: {
      border: "1px solid #e53e3e",
    },
    textarea: {
      width: "100%",
      padding: "12px 15px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      fontSize: "16px",
      minHeight: "120px",
      resize: "vertical",
      transition: "border 0.2s",
      boxSizing: "border-box",
    },
    button: {
      backgroundColor: "#0a66c2",
      color: "white",
      border: "none",
      padding: "14px 22px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "600",
      transition: "background-color 0.2s",
    },
    secondaryButton: {
      backgroundColor: "#f3f4f6",
      color: "#374151",
      border: "1px solid #d1d5db",
      padding: "14px 22px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "600",
      transition: "background-color 0.2s",
    },
    checkboxGroup: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      marginTop: "10px",
    },
    checkboxItem: {
      display: "inline-flex",
      alignItems: "center",
      backgroundColor: "#f3f4f6",
      padding: "8px 14px",
      borderRadius: "30px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    checkboxSelected: {
      backgroundColor: "#e1effe",
      color: "#0a66c2",
      fontWeight: "500",
    },
    skillsContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginTop: "15px",
    },
    skillTag: {
      backgroundColor: "#e1effe",
      color: "#0a66c2",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    removeButton: {
      background: "none",
      border: "none",
      color: "#0a66c2",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      padding: "0",
    },
    progress: {
      display: "flex",
      justifyContent: "space-between",
      position: "relative",
      marginBottom: "40px",
    },
    progressStep: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      zIndex: "2",
    },
    progressCircle: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      backgroundColor: "#e1effe",
      color: "#0a66c2",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "8px",
      fontWeight: "600",
    },
    progressCircleActive: {
      backgroundColor: "#0a66c2",
      color: "white",
    },
    progressCircleComplete: {
      backgroundColor: "#10b981",
      color: "white",
    },
    progressLabel: {
      fontSize: "14px",
      color: "#666",
    },
    progressLine: {
      position: "absolute",
      height: "4px",
      backgroundColor: "#e5e7eb",
      top: "15px",
      left: "12%",
      right: "12%",
      zIndex: "1",
    },
    progressLineFilled: {
      position: "absolute",
      height: "4px",
      backgroundColor: "#0a66c2",
      top: "15px",
      left: "12%",
      zIndex: "1",
      transition: "width 0.4s",
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "30px",
    },
    alert: {
      marginTop: "20px",
      padding: "15px",
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
      borderRadius: "8px",
      textAlign: "center",
      fontSize: "16px",
    },
    feedbackText: {
      fontSize: "14px",
      marginTop: "5px",
    },
    errorText: {
      color: "#e53e3e",
      fontSize: "14px",
      marginTop: "5px",
    },
    successIcon: {
      fontSize: "60px",
      color: "#10b981",
      marginBottom: "20px",
    },
    inputRow: {
      display: "flex",
      gap: "15px",
      marginBottom: "20px",
    },
    inputColumn: {
      flex: "1",
    },
    passwordStrengthBar: {
      height: "5px",
      marginTop: "8px",
      backgroundColor: "#e5e7eb",
      borderRadius: "4px",
      overflow: "hidden",
    },
    passwordStrengthIndicator: {
      height: "100%",
      borderRadius: "4px",
      transition: "width 0.3s, background-color 0.3s",
    },
  };

  // Progress steps
  const renderProgressBar = () => {
    // Calculate progress percentage
    let progressWidth = "0%";
    if (currentStep === "signup") progressWidth = "0%";
    else if (currentStep === "auth") progressWidth = "25%";
    else if (currentStep === "form") progressWidth = "50%";
    else if (currentStep === "details") progressWidth = "75%";
    else if (currentStep === "success") progressWidth = "100%";

    return (
      <div style={styles.progress}>
        <div style={styles.progressLine}></div>
        <div
          style={{
            ...styles.progressLineFilled,
            width: progressWidth,
          }}
        ></div>

        <div style={styles.progressStep}>
          <div
            style={{
              ...styles.progressCircle,
              ...(currentStep === "signup"
                ? styles.progressCircleActive
                : currentStep === "auth" ||
                  currentStep === "form" ||
                  currentStep === "details" ||
                  currentStep === "success"
                ? styles.progressCircleComplete
                : {}),
            }}
          >
            {currentStep === "signup" ? "1" : "✓"}
          </div>
          <span style={styles.progressLabel}>Sign Up</span>
        </div>

        <div style={styles.progressStep}>
          <div
            style={{
              ...styles.progressCircle,
              ...(currentStep === "auth"
                ? styles.progressCircleActive
                : currentStep === "form" ||
                  currentStep === "details" ||
                  currentStep === "success"
                ? styles.progressCircleComplete
                : {}),
            }}
          >
            {currentStep === "auth"
              ? "2"
              : currentStep === "form" ||
                currentStep === "details" ||
                currentStep === "success"
              ? "✓"
              : "2"}
          </div>
          <span style={styles.progressLabel}>Sign In</span>
        </div>

        <div style={styles.progressStep}>
          <div
            style={{
              ...styles.progressCircle,
              ...(currentStep === "form"
                ? styles.progressCircleActive
                : currentStep === "details" || currentStep === "success"
                ? styles.progressCircleComplete
                : {}),
            }}
          >
            {currentStep === "form"
              ? "3"
              : currentStep === "details" || currentStep === "success"
              ? "✓"
              : "3"}
          </div>
          <span style={styles.progressLabel}>Basic Info</span>
        </div>

        <div style={styles.progressStep}>
          <div
            style={{
              ...styles.progressCircle,
              ...(currentStep === "details"
                ? styles.progressCircleActive
                : currentStep === "success"
                ? styles.progressCircleComplete
                : {}),
            }}
          >
            {currentStep === "details"
              ? "4"
              : currentStep === "success"
              ? "✓"
              : "4"}
          </div>
          <span style={styles.progressLabel}>Details</span>
        </div>
      </div>
    );
  };

  // Render password strength indicator
  const renderPasswordStrengthBar = () => {
    let color = "#e5e7eb"; // Default gray
    if (passwordStrength > 0) {
      if (passwordStrength < 2) color = "#ef4444"; // Red - weak
      else if (passwordStrength < 4) color = "#f59e0b"; // Yellow - medium
      else color = "#10b981"; // Green - strong
    }

    return (
      <div style={styles.passwordStrengthBar}>
        <div
          style={{
            ...styles.passwordStrengthIndicator,
            width: `${(passwordStrength / 5) * 100}%`,
            backgroundColor: color,
          }}
        ></div>
      </div>
    );
  };

  // Sign-up form
  const renderSignupForm = () => (
    <div style={styles.card}>
      <div style={styles.header}>
        <h1 style={styles.title}>Join Our Host Community</h1>
        <p style={styles.subtitle}>Create your account to get started</p>
      </div>

      {renderProgressBar()}

      <form onSubmit={handleSignupSubmit}>
        <div style={styles.inputRow}>
          <div style={styles.inputColumn}>
            <label style={styles.label}>First Name</label>
            <input
              type="text"
              name="firstName"
              value={signupData.firstName}
              onChange={handleSignupChange}
              placeholder="Your first name"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputColumn}>
            <label style={styles.label}>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={signupData.lastName}
              onChange={handleSignupChange}
              placeholder="Your last name"
              required
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={signupData.email}
            onChange={handleSignupChange}
            placeholder="Enter your email address"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            value={signupData.password}
            onChange={handleSignupChange}
            onBlur={() => handleFieldBlur("password")}
            placeholder="Create a password (8+ characters)"
            required
            minLength="8"
            style={{
              ...styles.input,
              ...(touchedFields.password && passwordStrength < 2 ? styles.inputError : {}),
            }}
          />
          {renderPasswordStrengthBar()}
          {passwordFeedback && (
            <p style={{
              ...styles.feedbackText,
              color: passwordStrength < 2 ? "#e53e3e" : 
                     passwordStrength < 4 ? "#f59e0b" : "#10b981"
            }}>
              {passwordFeedback}
            </p>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={signupData.confirmPassword}
            onChange={handleSignupChange}
            onBlur={() => handleFieldBlur("confirmPassword")}
            placeholder="Confirm your password"
            required
            style={{
              ...styles.input,
              ...(touchedFields.confirmPassword && !passwordsMatch ? styles.inputError : {}),
            }}
          />
          {touchedFields.confirmPassword && !passwordsMatch && (
            <p style={styles.errorText}>Passwords don't match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || (touchedFields.confirmPassword && !passwordsMatch)}
          style={{
            ...styles.button,
            width: "100%",
            opacity: (loading || (touchedFields.confirmPassword && !passwordsMatch)) ? "0.7" : "1",
            cursor: (loading || (touchedFields.confirmPassword && !passwordsMatch)) ? "not-allowed" : "pointer",
            marginBottom: "15px",
          }}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div
        style={{
          marginTop: "20px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <p style={{ fontSize: "14px", color: "#666" }}>
          Already have an account?{" "}
          <button
            onClick={() => setCurrentStep("auth")}
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "#0a66c2",
              cursor: "pointer",
              fontWeight: "600",
              padding: "0",
            }}
          >
            Sign In
          </button>
        </p>

        <button
          onClick={handleGoHome}
          type="button"
          style={{
            background: "none",
            border: "none",
            color: "#0a66c2",
            cursor: "pointer",
            fontSize: "14px",
            textDecoration: "underline",
          }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );

  // Authentication form
  const renderAuthForm = () => (
    <div style={styles.card}>
      <div style={styles.header}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to continue your host application</p>
      </div>

      {renderProgressBar()}

      <form onSubmit={handleAuthSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={authData.email}
            onChange={handleAuthChange}
            placeholder="Enter your email address"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            value={authData.password}
            onChange={handleAuthChange}
            placeholder="Enter your password"
            required
            style={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            width: "100%",
            opacity: loading ? "0.7" : "1",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "15px",
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div
        style={{
          marginTop: "20px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <p style={{ fontSize: "14px", color: "#666" }}>
          Don't have an account?{" "}
          <button
            onClick={() => setCurrentStep("signup")}
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "#0a66c2",
              cursor: "pointer",
              fontWeight: "600",
              padding: "0",
            }}
          >
            Sign Up
          </button>
        </p>

        <button
          onClick={handleGoHome}
          type="button"
          style={{
            background: "none",
            border: "none",
            color: "#0a66c2",
            cursor: "pointer",
            fontSize: "14px",
            textDecoration: "underline",
          }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );

  // Basic info form
  const renderBasicInfoForm = () => (
    <div style={styles.card}>
      <div style={styles.header}>
        <h1 style={styles.title}>Create Your Host Profile</h1>
        <p style={styles.subtitle}>Tell us about yourself to get started</p>
      </div>

      {renderProgressBar()}

      <div style={styles.formGroup}>
        <label style={styles.label}>Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Your full name"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Display Name</label>
        <input
          type="text"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          placeholder="How you want to be known to others"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, Country"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Profile Image URL</label>
        <input
          type="text"
          name="avatar"
          value={formData.avatar}
          onChange={handleChange}
          placeholder="URL to your profile picture"
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about yourself in a few sentences..."
          required
          style={styles.textarea}
        />
      </div>

      <div style={styles.buttonGroup}>
        <button
          type="button"
          onClick={handleGoHome}
          style={styles.secondaryButton}
        >
          Cancel
        </button>

        <button type="button" onClick={handleNextStep} style={styles.button}>
          Next Step
        </button>
      </div>
    </div>
  );

  // Detailed profile form
  const renderDetailsForm = () => (
    <div style={styles.card}>
      <div style={styles.header}>
        <h1 style={styles.title}>Complete Your Profile</h1>
        <p style={styles.subtitle}>
          Add professional details to showcase your expertise
        </p>
      </div>

      {renderProgressBar()}

      <div style={styles.formGroup}>
        <label style={styles.label}>Areas of Expertise</label>
        <p
          style={{
            fontSize: "14px",
            color: "#666",
            marginBottom: "10px",
          }}
        >
          Select all that apply
        </p>

        <div style={styles.checkboxGroup}>
          {expertiseOptions.map((option) => (
            <div
              key={option}
              onClick={() => handleExpertiseChange(option)}
              style={{
                ...styles.checkboxItem,
                ...(formData.expertise.includes(option)
                  ? styles.checkboxSelected
                  : {}),
              }}
            >
              {option}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Professional Experience</label>
        <textarea
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          placeholder="Describe your relevant professional background and experience..."
          required
          style={styles.textarea}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Skills</label>
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            type="text"
            value={tempSkill}
            onChange={(e) => setTempSkill(e.target.value)}
            placeholder="Add a skill"
            style={{
              ...styles.input,
              flex: "1",
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddSkill}
            style={{
              ...styles.button,
              padding: "12px 20px",
            }}
          >
            Add
          </button>
        </div>

        {formData.skills.length > 0 && (
          <div style={styles.skillsContainer}>
            {formData.skills.map((skill) => (
              <div key={skill} style={styles.skillTag}>
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  type="button"
                  style={styles.removeButton}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Social Links</label>

        <div style={{ marginBottom: "10px" }}>
          <label
            style={{
              ...styles.label,
              fontSize: "14px",
              marginBottom: "5px",
            }}
          >
            LinkedIn
          </label>
          <input
            type="text"
            name="socialLinks.linkedin"
            value={formData.socialLinks.linkedin}
            onChange={handleChange}
            placeholder="LinkedIn profile URL"
            style={styles.input}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label
            style={{
              ...styles.label,
              fontSize: "14px",
              marginBottom: "5px",
            }}
          >
            Twitter
          </label>
          <input
            type="text"
            name="socialLinks.twitter"
            value={formData.socialLinks.twitter}
            onChange={handleChange}
            placeholder="Twitter profile URL"
            style={styles.input}
          />
        </div>

        <div>
          <label
            style={{
              ...styles.label,
              fontSize: "14px",
              marginBottom: "5px",
            }}
          >
            Personal Website
          </label>
          <input
            type="text"
            name="socialLinks.website"
            value={formData.socialLinks.website}
            onChange={handleChange}
            placeholder="Your website URL"
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.buttonGroup}>
        <button
          type="button"
          onClick={handlePrevStep}
          style={styles.secondaryButton}
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleNextStep}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? "0.7" : "1",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );

  // Success page
  const renderSuccessPage = () => (
    <div
      style={{
        ...styles.card,
        textAlign: "center",
        padding: "40px 30px",
      }}
    >
      <div style={styles.successIcon}>✓</div>

      <h2
        style={{
          fontSize: "24px",
          color: "#111",
          marginBottom: "15px",
          fontWeight: "700",
        }}
      >
        Application Submitted!
      </h2>

      <p
        style={{
          marginBottom: "30px",
          color: "#555",
          fontSize: "16px",
          lineHeight: "1.6",
          maxWidth: "450px",
          margin: "0 auto 30px",
        }}
      >
        Thank you for applying to join our community of hosts. We'll review your
        profile carefully
      </p>

      <button onClick={handleGoHome} type="button" style={styles.button}>
        Return to Home
      </button>
    </div>
  );

  // Render the appropriate component based on current step
  const renderCurrentStep = () => {
    if (currentStep === "success") {
      return renderSuccessPage();
    } else if (currentStep === "details" && isAuthenticated) {
      return renderDetailsForm();
    } else if (currentStep === "form" && isAuthenticated) {
      return renderBasicInfoForm();
    } else {
      return renderAuthForm();
    }
  };

  return (
    <div style={styles.container}>
      {renderCurrentStep()}

      {message && currentStep !== "success" && (
        <div style={styles.alert}>{message}</div>
      )}
    </div>
  );
};

export default ApplyHostPage;
