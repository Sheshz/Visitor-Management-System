import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../CSS/CreateHostProfile.css";
import apiClient from "../../utils/apiClient";

const CreateHostProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
  
  const [userData, setUserData] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formMessage, setFormMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setFormMessage({
          type: "error",
          text: "No authentication token found. Please log in.",
        });
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        // Use relative path with apiClient
        const response = await apiClient.get("/api/users/me");
        
        if (response.status === 200) {
          const data = response.data;
          setUserData(data);
          setFormData((prevData) => ({
            ...prevData,
            name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            email: data.email || "",
          }));
        }
        
        // Check if user already has a host profile
        try {
          const hostResponse = await apiClient.get("/api/hosts/me");
          
          if (hostResponse.status === 200) {
            setFormMessage({
              type: "info",
              text: "You already have a host profile. Redirecting to dashboard...",
            });
            // Store host information in local storage for use across the app
            localStorage.setItem("hostID", hostResponse.data.hostID);
            localStorage.setItem("isHost", "true");
            // Redirect to host dashboard after a short delay
            setTimeout(() => navigate("/host/dashboard"), 3000);
            return; // Exit early
          }
        } catch (hostErr) {
          // For host profile checks, 401 might mean the endpoint requires special permissions
          // or the user simply doesn't have a host profile yet
          console.log("Host profile check result:", hostErr.response?.status);
          
          // Don't treat 401 as a critical error here, just continue with the form
          if (hostErr.response && hostErr.response.status === 401) {
            console.log("No host profile found or not authorized yet. Continuing with form.");
            // Continue with the form, don't redirect
          } else if (hostErr.response && hostErr.response.status !== 404) {
            console.error("Unexpected error checking host profile:", hostErr);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        
        // Check for expired token
        if (err.response && [401, 403].includes(err.response.status)) {
          localStorage.removeItem("token"); // Clear invalid token
          setFormMessage({
            type: "error",
            text: "Your session has expired. Please log in again.",
          });
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }
        
        setFormMessage({
          type: "error",
          text: "Error fetching user data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setFormMessage({ type: "info", text: "Creating your host profile..." });

      // Get token for request
      const token = localStorage.getItem("token");
      if (!token) {
        setFormMessage({
          type: "error",
          text: "Authentication token not found. Please log in again.",
        });
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // Create FormData object for file upload
      const form = new FormData();
      form.append("bio", formData.bio);
      form.append("expertise", formData.expertise);
      form.append("location", formData.location);
      form.append("experience", formData.experience);
      
      // Add social media links if they exist
      if (formData.facebook) form.append("facebook", formData.facebook);
      if (formData.twitter) form.append("twitter", formData.twitter);
      if (formData.linkedin) form.append("linkedin", formData.linkedin);
      if (formData.instagram) form.append("instagram", formData.instagram);
      
      // Add avatar if it exists
      if (formData.avatar) form.append("avatar", formData.avatar);

      // Trying with different authorization header formats
      // Option 1: Just the token
      const response = await apiClient.post("/api/hosts/apply", form, {
        headers: { 
          // Content-Type is automatically set by FormData
          "Authorization": token
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log("Host profile submission response:", response);

      if (response.status === 201) {
        // Store host information in local storage
        if (response.data.host && response.data.host.hostID) {
          localStorage.setItem("hostID", response.data.host.hostID);
          localStorage.setItem("isHost", "true");
        }
        
        setFormMessage({
          type: "success",
          text: response.data.message || "Host profile created successfully! A confirmation email with your host details has been sent to your email address.",
        });
        
        // Redirect to dashboard after successful creation
        setTimeout(() => {
          navigate(response.data.redirect || "/host/dashboard");
        }, 3000);
      } else if (response.status === 400 && response.data.message?.includes("already have a host profile")) {
        // User already has a profile
        setFormMessage({
          type: "info",
          text: `${response.data.message}. Redirecting to host dashboard...`,
        });
        
        if (response.data.hostID) {
          localStorage.setItem("hostID", response.data.hostID);
          localStorage.setItem("isHost", "true");
        }
        
        setTimeout(() => {
          navigate(response.data.redirect || "/host/dashboard");
        }, 3000);
      } else {
        // This handles non-error responses that aren't 201 or 400
        setFormMessage({
          type: "error",
          text: response.data.message || "Unexpected response. Please try again.",
        });
      }

    } catch (error) {
      console.error("Error submitting the form:", error);
      console.error("Error details:", error.response?.data);
      
      // If the first authorization format failed, retry with Bearer format
      if (error.response && error.response.status === 401) {
        try {
          const token = localStorage.getItem("token");
          const form = new FormData();
          
          // Rebuild form data
          form.append("bio", formData.bio);
          form.append("expertise", formData.expertise);
          form.append("location", formData.location);
          form.append("experience", formData.experience);
          
          if (formData.facebook) form.append("facebook", formData.facebook);
          if (formData.twitter) form.append("twitter", formData.twitter);
          if (formData.linkedin) form.append("linkedin", formData.linkedin);
          if (formData.instagram) form.append("instagram", formData.instagram);
          
          if (formData.avatar) form.append("avatar", formData.avatar);
          
          // Option 2: Try with Bearer prefix
          const response = await apiClient.post("/api/hosts/apply", form, {
            headers: { 
              "Authorization": `Bearer ${token}`
            },
            timeout: 30000
          });
          
          // Handle successful response similar to above
          if (response.status === 201) {
            if (response.data.host && response.data.host.hostID) {
              localStorage.setItem("hostID", response.data.host.hostID);
              localStorage.setItem("isHost", "true");
            }
            
            setFormMessage({
              type: "success",
              text: response.data.message || "Host profile created successfully!",
            });
            
            setTimeout(() => {
              navigate(response.data.redirect || "/host/dashboard");
            }, 3000);
            return;
          }
        } catch (retryError) {
          console.error("Error on retry with Bearer token:", retryError);
          // Continue to the general error handling below
        }
      }
      
      // Handle specific error cases
      if (error.response) {
        // Check if the error is because the user already has a host profile
        if (error.response.status === 400 && error.response.data.message?.includes("already have a host profile")) {
          setFormMessage({
            type: "info",
            text: `${error.response.data.message}. Redirecting to host dashboard...`,
          });
          
          if (error.response.data.hostID) {
            localStorage.setItem("hostID", error.response.data.hostID);
            localStorage.setItem("isHost", "true");
          }
          
          setTimeout(() => {
            navigate(error.response.data.redirect || "/host/dashboard");
          }, 3000);
          return;
        }
        
        // Handle token expired case
        if ([401, 403].includes(error.response.status)) {
          localStorage.removeItem("token"); // Clear invalid token
          setFormMessage({
            type: "error",
            text: "Your session has expired. Please log in again.",
          });
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }
        
        setFormMessage({
          type: "error",
          text: error.response.data?.message || "An error occurred while creating your host profile.",
        });
      } else if (error.request) {
        // The request was made but no response was received
        setFormMessage({
          type: "error",
          text: "No response from server. Please check your connection and try again.",
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        setFormMessage({
          type: "error",
          text: "An unexpected error occurred. Please try again later.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setFormMessage({
          type: "error",
          text: "File size exceeds 5MB limit. Please choose a smaller image.",
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
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
    // Preserve login data (name and email)
    const { name, email } = formData;
    setFormData({
      name,
      email,
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
    setAvatarPreview(null);
    setFormMessage(null);
  };

  const validateForm = () => {
    // Required fields validation
    const requiredFields = ['bio', 'expertise', 'location', 'experience'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setFormMessage({
        type: "error",
        text: `Please fill in all required fields: ${missingFields.join(', ')}`,
      });
      return false;
    }
    
    // URL validation for social media
    const socialMediaFields = ['facebook', 'twitter', 'linkedin', 'instagram'];
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
  
  // Simple URL validation function
  const isValidURL = (string) => {
    if (!string) return true; // Empty strings are valid (optional fields)
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="header">Create Host Profile</h2>
      {formMessage && (
        <div className={`form-message ${formMessage.type}`}>
          {formMessage.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="form">
        {/* Personal Info */}
        <div className="form-group">
          <label className="label">Name</label>
          <input type="text" name="name" value={formData.name} disabled className="disabled-input" />
        </div>
        <div className="form-group">
          <label className="label">Email</label>
          <input type="email" name="email" value={formData.email} disabled className="disabled-input" />
        </div>
        <div className="form-group full-width-col">
          <label className="label">Bio <span className="required">*</span></label>
          <textarea 
            name="bio" 
            value={formData.bio} 
            onChange={handleChange} 
            placeholder="Write a short bio about yourself and your hosting experience" 
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Expertise <span className="required">*</span></label>
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
          <label className="label">Location <span className="required">*</span></label>
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
          <label className="label">Experience <span className="required">*</span></label>
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
              <img src={avatarPreview} alt="Avatar Preview" className="avatar-preview" />
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
            disabled={submitting}
          >
            Clear Form
          </button>
          <button 
            type="submit" 
            className="btn primary"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateHostProfile;