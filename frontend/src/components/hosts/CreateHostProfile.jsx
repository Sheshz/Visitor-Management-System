import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../../CSS/CreateHostProfile.css";

const CreateHostProfile = ({ userData }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    bio: "",
    expertise: "",
    location: "",
    experience: "",
    avatar: null,
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formMessage, setFormMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [profileCreated, setProfileCreated] = useState(false);
  const [createdHostData, setCreatedHostData] = useState(null);
  const [checkingHostStatus, setCheckingHostStatus] = useState(true);
  const [emailChecked, setEmailChecked] = useState(false);

  // Load user data from props or localStorage and check if user already has a host account
  useEffect(() => {
    const checkExistingHostAccount = async () => {
      try {
        setCheckingHostStatus(true);

        // First try to get data from props
        let userName = "";
        let userEmail = "";
        let username = "";
        
        // If userData is provided from UserDashboard, use it
        if (userData) {
          // Construct full name from firstName and lastName if available
          if (userData.firstName && userData.lastName) {
            userName = `${userData.firstName} ${userData.lastName}`;
          } else if (userData.name) {
            userName = userData.name;
          }
          
          userEmail = userData.email || "";
          username = userData.username || "";
        } else {
          // Fallback to localStorage if userData prop is not available
          userName = localStorage.getItem("userName");
          userEmail = localStorage.getItem("userEmail");
          username = localStorage.getItem("username");
        }

        const token = localStorage.getItem("token");

        // Set user data to state if available
        if (userName || userEmail || username) {
          setFormData((prevData) => ({
            ...prevData,
            name: userName || "",
            email: userEmail || "",
            username: username || "",
          }));
        }

        // Check if the user already has a host account (if email exists)
        if (userEmail && token) {
          try {
            setEmailChecked(true);
            const response = await axios.get(
              `http://localhost:5000/api/host/check-email?email=${encodeURIComponent(
                userEmail
              )}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            // If host account exists
            if (response.data.exists) {
              console.log("Host account found:", response.data);

              // Set profile created to true and add host data
              setProfileCreated(true);
              setCreatedHostData({
                name: userName || "",
                email: userEmail || "",
                hostId: response.data.hostId,
                // Add any other data returned from the API
              });

              // Store host information in localStorage
              localStorage.setItem("isHost", "true");
              localStorage.setItem("hostID", response.data.hostId);
              
              // Add success message
              setFormMessage({
                type: "success",
                text: "You already have an active host profile with this email address."
              });
            }
          } catch (error) {
            // If error is 401, try to refresh token and retry
            if (error.response?.status === 401) {
              try {
                const newToken = await refreshToken();
                const retryResponse = await axios.get(
                  `http://localhost:5000/api/host/check-email?email=${encodeURIComponent(
                    userEmail
                  )}`,
                  {
                    headers: {
                      Authorization: `Bearer ${newToken}`,
                    },
                  }
                );

                if (retryResponse.data.exists) {
                  setProfileCreated(true);
                  setCreatedHostData({
                    name: userName || "",
                    email: userEmail || "",
                    hostId: retryResponse.data.hostId,
                  });

                  localStorage.setItem("isHost", "true");
                  localStorage.setItem("hostID", retryResponse.data.hostId);
                  
                  // Add success message
                  setFormMessage({
                    type: "success",
                    text: "You already have an active host profile with this email address."
                  });
                }
              } catch (retryError) {
                console.error("Error during token refresh:", retryError);
              }
            } else {
              console.error("Error checking host account:", error);
            }
          }
        }
      } finally {
        setCheckingHostStatus(false);
      }
    };

    checkExistingHostAccount();
  }, [userData]);

  // Check if passwords match
  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  // Function to refresh the authentication token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post("http://localhost:5000/api/user/me", {
        refreshToken,
      });

      localStorage.setItem("token", response.data.token);
      return response.data.token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If profile is already created, don't allow submission
    if (profileCreated) {
      setFormMessage({
        type: "info",
        text: "You already have a host profile. Please use the link to go to your host dashboard."
      });
      window.scrollTo(0, 0);
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setFormMessage({ type: "info", text: "Creating your host profile..." });

      // Create FormData object for file upload
      const hostData = new FormData();

      // Add all text fields first
      Object.keys(formData).forEach((key) => {
        if (key !== "avatar" && key !== "confirmPassword") {
          hostData.append(key, formData[key]);
        }
      });

      // Add avatar separately to ensure proper field name
      if (formData.avatar) {
        hostData.append("avatar", formData.avatar);
      }

      // Get token from localStorage
      const token = localStorage.getItem("token");

      // Send data to backend API
      const response = await axios.post(
        "http://localhost:5000/api/host/create",
        hostData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);

      // Store user as host in localStorage
      localStorage.setItem("isHost", "true");
      localStorage.setItem("hostID", response.data.hostId);

      // Set success state and store created host data
      setProfileCreated(true);
      setCreatedHostData({
        name: formData.name,
        email: formData.email,
        hostId: response.data.hostId,
      });

      // Set success message
      setFormMessage({
        type: "success",
        text: "Host profile created successfully! A confirmation email with your host details has been sent to your email address.",
      });

      setSubmitting(false);

      // Scroll to top to make sure user sees the success message
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error submitting the form:", error);

      // Check if error is about email already exists
      if (error.response?.data?.message?.includes("email already exists")) {
        // Email already exists, show success screen
        const userEmail = formData.email;
        const userName = formData.name;

        try {
          // Get host ID from the error response if available
          const hostId = error.response?.data?.hostId || "Unknown";

          setProfileCreated(true);
          setCreatedHostData({
            name: userName,
            email: userEmail,
            hostId: hostId,
          });

          localStorage.setItem("isHost", "true");
          localStorage.setItem("hostID", hostId);

          setFormMessage({
            type: "success",
            text: "You already have a host profile with this email address.",
          });

          setSubmitting(false);
          window.scrollTo(0, 0);
          return;
        } catch (err) {
          console.error("Error setting up existing host profile:", err);
        }
      }

      // Check if token expired
      if (
        error.response?.status === 401 &&
        error.response?.data?.message?.includes("expired")
      ) {
        try {
          // Try to refresh token and resubmit
          const newToken = await refreshToken();

          // Re-create FormData for resubmission
          const newHostData = new FormData();
          Object.keys(formData).forEach((key) => {
            if (key !== "avatar" && key !== "confirmPassword") {
              newHostData.append(key, formData[key]);
            }
          });

          if (formData.avatar) {
            newHostData.append("avatar", formData.avatar);
          }

          // Retry with new token
          const retryResponse = await axios.post(
            "http://localhost:5000/api/host/create",
            newHostData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${newToken}`,
              },
            }
          );

          // Set success state and store created host data
          setProfileCreated(true);
          setCreatedHostData({
            name: formData.name,
            email: formData.email,
            hostId: retryResponse.data.hostId,
          });

          // Set success message
          setFormMessage({
            type: "success",
            text: "Host profile created successfully! A confirmation email with your host details has been sent to your email address.",
          });

          // Store in localStorage
          localStorage.setItem("isHost", "true");
          localStorage.setItem("hostID", retryResponse.data.hostId);

          setSubmitting(false);
          window.scrollTo(0, 0);
          return;
        } catch (retryError) {
          console.error("Error during token refresh and retry:", retryError);
          setFormMessage({
            type: "error",
            text: "Authentication failed. Please try again.",
          });
          setSubmitting(false);
          return;
        }
      }

      setFormMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again later.",
      });
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setFormMessage({
          type: "error",
          text: "File size exceeds 5MB limit. Please choose a smaller image.",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setFormMessage({
          type: "error",
          text: "Only image files are allowed.",
        });
        return;
      }

      setFormData({ ...formData, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);

      // Clear any error messages
      if (formMessage && formMessage.type === "error") {
        setFormMessage(null);
      }
    }
  };

  const handleClear = () => {
    // If userData is available, preserve those fields
    if (userData) {
      const fullName = userData.firstName && userData.lastName 
        ? `${userData.firstName} ${userData.lastName}` 
        : userData.name || "";
        
      setFormData({
        name: fullName,
        email: userData.email || "",
        username: userData.username || "",
        password: "",
        confirmPassword: "",
        bio: "",
        expertise: "",
        location: "",
        experience: "",
        avatar: null,
        facebook: "",
        twitter: "",
        linkedin: "",
        instagram: "",
      });
    } else {
      // Preserve login data (name and email) from localStorage
      const name = localStorage.getItem("userName") || "";
      const email = localStorage.getItem("userEmail") || "";
      const username = localStorage.getItem("username") || "";
      
      setFormData({
        name,
        email,
        username,
        password: "",
        confirmPassword: "",
        bio: "",
        expertise: "",
        location: "",
        experience: "",
        avatar: null,
        facebook: "",
        twitter: "",
        linkedin: "",
        instagram: "",
      });
    }
    
    setAvatarPreview(null);
    setFormMessage(null);
  };

  const validateForm = () => {
    // Required fields validation
    const requiredFields = [
      "name",
      "email",
      "username",
      "password",
      "confirmPassword",
      "bio",
      "expertise",
      "location",
      "experience",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setFormMessage({
        type: "error",
        text: `Please fill in all required fields: ${missingFields.join(", ")}`,
      });
      return false;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setFormMessage({
        type: "error",
        text: "Passwords do not match",
      });
      return false;
    }

    if (formData.password.length < 8) {
      setFormMessage({
        type: "error",
        text: "Password must be at least 8 characters long",
      });
      return false;
    }

    // URL validation for social media
    const socialMediaFields = ["facebook", "twitter", "linkedin", "instagram"];
    for (const field of socialMediaFields) {
      if (formData[field] && !isValidURL(formData[field])) {
        setFormMessage({
          type: "error",
          text: `Please enter a valid URL for ${field}`,
        });
        return false;
      }
    }

    return true;
  };

  // Improved URL validation function
  const isValidURL = (string) => {
    if (!string) return true; // Empty strings are valid (optional fields)

    // Check if string already has http/https protocol
    let urlString = string;
    if (!string.match(/^https?:\/\//i)) {
      urlString = "https://" + string; // Add https if not present
    }

    try {
      const url = new URL(urlString);
      // Check if the URL has a valid domain with at least one dot
      return url.hostname.includes(".");
    } catch (_) {
      return false;
    }
  };

  // Show loading indicator while checking host status
  if (checkingHostStatus) {
    return (
      <div className="container">
        <div className="loading-container">
          <h2>Loading your profile information...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // If profile was created successfully or already exists, show success screen instead of form
  if (profileCreated && createdHostData) {
    return (
      <div className="container">
        <div className="success-container">
          <h2 className="success-header">Host Profile Active</h2>
          {formMessage && (
            <div className={`form-message ${formMessage.type}`}>
              {formMessage.text}
            </div>
          )}
          <div className="success-details">
            <p>You already have an active host profile with these details:</p>

            <div className="profile-summary">
              <h3>Profile Summary</h3>
              <p>
                <strong>Name:</strong> {createdHostData.name}
              </p>
              <p>
                <strong>Email:</strong> {createdHostData.email}
              </p>
              <p>
                <strong>Host ID:</strong> {createdHostData.hostId}
              </p>
            </div>

            <div className="success-actions">
              <Link to="/host/dashboard" className="btn primary">
                Go to Host Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If email is checked and auto-filled but no host profile exists yet, show normal form
  return (
    <div className="container">
      <h2 className="header">Create Host Profile</h2>
      {formMessage && (
        <div className={`form-message ${formMessage.type}`}>
          {formMessage.text}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="form"
        encType="multipart/form-data"
      >
        {/* Account Info */}
        <h3 className="section-title">Account Information</h3>
        <div className="form-group">
          <label className="label">
            Username <span className="required">*</span>
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Your username"
            required
            readOnly={emailChecked}
          />
        </div>
        <div className="form-group">
          <label className="label">
            Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
            readOnly={emailChecked}
          />
        </div>
        <div className="form-group">
          <label className="label">
            Email <span className="required">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your email address"
            required
            readOnly={emailChecked}
          />
          {emailChecked && (
            <p className="help-text">Email address is associated with your account and cannot be changed</p>
          )}
        </div>

        {/* Password fields */}
        <div className="form-group">
          <label className="label">
            Password <span className="required">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password (min. 8 characters)"
            minLength="8"
            required
          />
        </div>
        <div className="form-group">
          <label className="label">
            Confirm Password <span className="required">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            minLength="8"
            required
            className={
              !passwordMatch && formData.confirmPassword ? "error-input" : ""
            }
          />
          {!passwordMatch && formData.confirmPassword && (
            <p className="error-text">Passwords do not match</p>
          )}
        </div>

        {/* Profile Info */}
        <h3 className="section-title">Host Profile Information</h3>
        <div className="form-group full-width-col">
          <label className="label">
            Bio <span className="required">*</span>
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Write a short bio about yourself and your hosting experience"
            required
          />
        </div>
        <div className="form-group">
          <label className="label">
            Expertise <span className="required">*</span>
          </label>
          <input
            type="text"
            name="expertise"
            value={formData.expertise}
            onChange={handleChange}
            placeholder="Your areas of expertise"
            required
          />
        </div>
        <div className="form-group">
          <label className="label">
            Location <span className="required">*</span>
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Your location"
            required
          />
        </div>
        <div className="form-group full-width-col">
          <label className="label">
            Experience <span className="required">*</span>
          </label>
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Describe your professional experience"
            required
          />
        </div>

        {/* Avatar Upload */}
        <div className="form-group avatar-group">
          <label className="label">Profile Picture</label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
          <div className="avatar-preview-container">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="avatar-preview"
              />
            ) : (
              <div className="avatar-placeholder">
                <span>No image selected</span>
              </div>
            )}
          </div>
          <p className="file-help-text">Recommended: Square image, max 5MB</p>
        </div>

        {/* Social Media */}
        <h3 className="section-title">Social Media Links (Optional)</h3>
        <div className="form-group">
          <label className="label">Facebook</label>
          <input
            type="url"
            name="facebook"
            value={formData.facebook}
            onChange={handleChange}
            placeholder="https://facebook.com/yourprofile"
          />
        </div>
        <div className="form-group">
          <label className="label">Twitter</label>
          <input
            type="url"
            name="twitter"
            value={formData.twitter}
            onChange={handleChange}
            placeholder="https://twitter.com/yourhandle"
          />
        </div>
        <div className="form-group">
          <label className="label">LinkedIn</label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
        <div className="form-group">
          <label className="label">Instagram</label>
          <input
            type="url"
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            placeholder="https://instagram.com/yourhandle"
          />
        </div>

        {/* Buttons */}
        <div className="button-group">
          <button
            type="button"
            onClick={handleClear}
            className="btn secondary"
            disabled={submitting || emailChecked}
          >
            Clear Form
          </button>
          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? "Submitting..." : "Create Host Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateHostProfile;