import React, { useState, useEffect } from "react";
import "../../CSS/HostProfileCreation.css";
import { SessionManager } from "../../utils/SessionManager";

const CreateHostProfile = () => {
  // Get user data from SessionManager
  const [userData, setUserData] = useState(null);
  
  // Initialize form state
  const [formData, setFormData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    bio: "",
    expertise: "",
    location: "",
    experience: "",
    avatar: "",
    socialMedia: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [passwordError, setPasswordError] = useState("");
  const [previewAvatar, setPreviewAvatar] = useState("");
  
  // New states for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // New state for success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hostData, setHostData] = useState({
    hostId: "",
    email: ""
  });

  // Fetch user data from SessionManager on component mount
  useEffect(() => {
    // Get user data from SessionManager
    const firstName = SessionManager.getItem("userFirstName");
    const lastName = SessionManager.getItem("userLastName");
    const email = SessionManager.getItem("userEmail");
    const username = SessionManager.getItem("username");
    const fullName = SessionManager.getItem("userName");
    
    // Create user object from session data
    const user = {
      firstName: firstName || "",
      lastName: lastName || "",
      email: email || "",
      username: username || "",
      name: fullName || ""
    };
    
    setUserData(user);
    
    // Pre-populate form with user data
    setFormData(prevData => ({
      ...prevData,
      name: (user.firstName && user.lastName) 
            ? `${user.firstName} ${user.lastName}` 
            : user.name || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      username: user.username || ""
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear password error when either password field changes
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      socialMedia: {
        ...prevData.socialMedia,
        [name]: value,
      },
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the file object directly for FormData
      setFormData((prevData) => ({
        ...prevData,
        avatar: file,
      }));

      // Also create a preview URL for display
      const reader = new FileReader();
      reader.onloadend = () => {
        // Store the preview URL separately if needed
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePasswords = () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    return true;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords if provided
    if (formData.password && !validatePasswords()) {
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      // Get auth token from SessionManager
      const token = SessionManager.getToken();

      if (!token) {
        throw new Error("Authentication required. Please log in first.");
      }

      // Create FormData object to handle file upload
      const formDataToSend = new FormData();

      // Add all text fields to FormData
      Object.keys(formData).forEach((key) => {
        if (key === "socialMedia") {
          // Handle nested social media object
          Object.keys(formData.socialMedia).forEach((socialKey) => {
            formDataToSend.append(socialKey, formData.socialMedia[socialKey]);
          });
        } else if (key !== "confirmPassword" && key !== "avatar") {
          // Skip confirmPassword and avatar (handled separately)
          formDataToSend.append(key, formData[key]);
        }
      });

      // If avatar is a file object, append it
      if (formData.avatar && typeof formData.avatar !== "string") {
        formDataToSend.append("avatar", formData.avatar);
      }

      // Make API call with proper authentication
      const response = await fetch("http://localhost:5000/api/hosts/create-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      setMessage({
        text: "Host profile created successfully!",
        type: "success",
      });

      // Set host data for success modal
      setHostData({
        hostId: data.hostId || "H-" + Math.floor(10000 + Math.random() * 90000), // Fallback if API doesn't return hostId
        email: formData.email
      });

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({
        text: error.message || "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="host-profile-container">
      <div className="profile-header">
        <h1>Create Host Profile</h1>
        <p>Complete your profile to start hosting experiences</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2>Profile Created Successfully!</h2>
            <p>Your host profile has been created. Here are your details:</p>
            <div className="host-details">
              <div className="host-detail-item">
                <span className="detail-label">Host ID:</span>
                <span className="detail-value">{hostData.hostId}</span>
              </div>
              <div className="host-detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{hostData.email}</span>
              </div>
            </div>
            <p className="success-note">We've sent these details to your email address.</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => window.location.href="/host-login"}>
                Go to Host Login
              </button>
              <button className="btn-secondary" onClick={closeSuccessModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="avatar-section">
            <div className="avatar-preview">
              {previewAvatar || formData.avatar ? (
                <img
                  src={previewAvatar || formData.avatar}
                  alt="Profile avatar"
                />
              ) : (
                <div className="avatar-placeholder">
                  <span>
                    {formData.name
                      ? formData.name.charAt(0).toUpperCase()
                      : "?"}
                  </span>
                </div>
              )}
            </div>
            <div className="avatar-upload">
              <label htmlFor="avatar" className="btn-upload">
                Upload Photo
              </label>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="file-input"
              />
              <p className="hint-text">
                Recommended: square image, at least 400x400 pixels
              </p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={userData?.firstName && userData?.lastName}
                className={
                  userData?.firstName && userData?.lastName ? "input-disabled" : ""
                }
              />
              {userData?.firstName && userData?.lastName && (
                <p className="hint-text">Imported from your user profile</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="username">Username*</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={userData?.username}
                className={userData?.username ? "input-disabled" : ""}
              />
              {userData?.username && (
                <p className="hint-text">Imported from your user profile</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={userData?.email}
              className={userData?.email ? "input-disabled" : ""}
            />
            {userData?.email && (
              <p className="hint-text">Imported from your user profile</p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                >
                  <i className={`password-icon ${showPassword ? "eye-slash" : "eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="form-group password-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  <i className={`password-icon ${showConfirmPassword ? "eye-slash" : "eye"}`}></i>
                </button>
              </div>
            </div>
          </div>

          {passwordError && (
            <div className="error-message">{passwordError}</div>
          )}

          <div className="form-group">
            <label htmlFor="location">Location*</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="City, Country"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Professional Information</h2>

          <div className="form-group">
            <label htmlFor="bio">Bio*</label>
            <textarea
              id="bio"
              name="bio"
              placeholder="Tell guests about yourself..."
              value={formData.bio}
              onChange={handleChange}
              required
              rows="4"
            ></textarea>
            <p className="hint-text">
              Share your background, interests, and what makes you a great host
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="expertise">Area of Expertise*</label>
            <input
              type="text"
              id="expertise"
              name="expertise"
              placeholder="e.g. Photography, Cooking, History"
              value={formData.expertise}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience">Relevant Experience*</label>
            <textarea
              id="experience"
              name="experience"
              placeholder="Describe your experience in this field..."
              value={formData.experience}
              onChange={handleChange}
              required
              rows="3"
            ></textarea>
          </div>
        </div>

        <div className="form-section">
          <h2>Social Media</h2>
          <p className="section-description">
            Connect your professional profiles (optional)
          </p>

          <div className="social-media-inputs">
            <div className="form-group social-input">
              <label htmlFor="linkedin">
                <i className="social-icon linkedin"></i> LinkedIn
              </label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                placeholder="LinkedIn profile URL"
                value={formData.socialMedia.linkedin}
                onChange={handleSocialMediaChange}
              />
            </div>

            <div className="form-group social-input">
              <label htmlFor="twitter">
                <i className="social-icon twitter"></i> Twitter
              </label>
              <input
                type="url"
                id="twitter"
                name="twitter"
                placeholder="Twitter profile URL"
                value={formData.socialMedia.twitter}
                onChange={handleSocialMediaChange}
              />
            </div>

            <div className="form-group social-input">
              <label htmlFor="instagram">
                <i className="social-icon instagram"></i> Instagram
              </label>
              <input
                type="url"
                id="instagram"
                name="instagram"
                placeholder="Instagram profile URL"
                value={formData.socialMedia.instagram}
                onChange={handleSocialMediaChange}
              />
            </div>

            <div className="form-group social-input">
              <label htmlFor="facebook">
                <i className="social-icon facebook"></i> Facebook
              </label>
              <input
                type="url"
                id="facebook"
                name="facebook"
                placeholder="Facebook profile URL"
                value={formData.socialMedia.facebook}
                onChange={handleSocialMediaChange}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating Profile..." : "Create Host Profile"}
          </button>
          <button type="button" className="btn-secondary">
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateHostProfile;