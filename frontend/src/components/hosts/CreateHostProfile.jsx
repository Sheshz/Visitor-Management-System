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
        // Just check if token is present, don't try to decode it here
        // Token validation is now handled by the SessionManager and API client
        
        try {
          const response = await apiClient.get("http://localhost:5000/api/users/me");
          if (response.status === 200) {
            const data = response.data;
            setUserData(data);
            setFormData((prevData) => ({
              ...prevData,
              name: data.name || data.firstName + " " + data.lastName || "",
              email: data.email || "",
            }));
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          
          if (err.response && [401, 403].includes(err.response.status)) {
            // Unauthorized, redirect to login
            navigate("/login");
            return;
          }
          
          setFormMessage({
            type: "error",
            text: "Error fetching user data. Please try again later.",
          });
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setFormMessage({
          type: "error",
          text: "Session expired. Please log in again.",
        });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFormData({ ...formData, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.bio ||
      !formData.expertise ||
      !formData.location ||
      !formData.experience
    ) {
      setFormMessage({
        type: "error",
        text: "Please fill all required fields.",
      });
      return;
    }

    const form = new FormData();
    form.append("bio", formData.bio);
    form.append("expertise", formData.expertise);
    form.append("location", formData.location);
    form.append("experience", formData.experience);
    if (formData.avatar) form.append("avatar", formData.avatar);
    form.append("facebook", formData.facebook);
    form.append("twitter", formData.twitter);
    form.append("linkedin", formData.linkedin);
    form.append("instagram", formData.instagram);

    try {
      setFormMessage({ type: "info", text: "Submitting profile..." });
      const response = await apiClient.post("http://localhost:5000/api/hosts/apply", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 201) {
        setFormMessage({
          type: "success",
          text: "Host profile submitted successfully!",
        });
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setFormMessage({
          type: "error",
          text: response.data.message || "Submission failed. Try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
      
      // Handle token expired case
      if (error.response && [401, 403].includes(error.response.status)) {
        setFormMessage({
          type: "error",
          text: "Your session has expired. Please log in again.",
        });
        setTimeout(() => navigate("/login"), 2000);
        return;
      }
      
      setFormMessage({
        type: "error",
        text: error.response?.data?.message || "An error occurred while submitting.",
      });
    }
  };

  if (loading) {
    return <p className="loading">Loading user data...</p>;
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
          <label className="label">Bio</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Write a short bio..." required />
        </div>
        <div className="form-group">
          <label className="label">Expertise</label>
          <input type="text" name="expertise" value={formData.expertise} onChange={handleChange} placeholder="Your expertise" required />
        </div>
        <div className="form-group">
          <label className="label">Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Your location" required />
        </div>
        <div className="form-group full-width-col">
          <label className="label">Experience</label>
          <textarea name="experience" value={formData.experience} onChange={handleChange} placeholder="Describe your experience" required />
        </div>
        {/* Avatar Upload */}
        <div className="form-group">
          <label className="label">Profile Picture</label>
          <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} />
          {avatarPreview && <img src={avatarPreview} alt="Avatar Preview" className="avatar-preview" />}
        </div>
        {/* Social Media */}
        <h3 className="section-title">Social Media Links</h3>
        <div className="form-group">
          <label className="label">Facebook</label>
          <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="Facebook profile URL" />
        </div>
        <div className="form-group">
          <label className="label">Twitter</label>
          <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="Twitter profile URL" />
        </div>
        <div className="form-group">
          <label className="label">LinkedIn</label>
          <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn profile URL" />
        </div>
        <div className="form-group">
          <label className="label">Instagram</label>
          <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Instagram profile URL" />
        </div>
        {/* Buttons */}
        <div className="button-group">
          <button type="button" onClick={handleClear} className="btn secondary">Clear Form</button>
          <button type="submit" className="btn primary">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default CreateHostProfile;