import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import "./CreateHostProfile.css";

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

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setFormData((prevState) => ({
            ...prevState,
            name: data.name,
            email: data.email,
          }));
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, avatar: file });

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();

    form.append("bio", formData.bio);
    form.append("expertise", formData.expertise);
    form.append("location", formData.location);
    form.append("experience", formData.experience);
    form.append("avatar", formData.avatar);
    form.append("facebook", formData.facebook);
    form.append("twitter", formData.twitter);
    form.append("linkedin", formData.linkedin);
    form.append("instagram", formData.instagram);

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch("http://localhost:5000/api/hosts/apply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await response.json();
      if (response.ok) {
        alert("Host profile submitted successfully!");
        navigate("/dashboard");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("Error submitting the form");
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  if (!userData) {
    return <p className="loading">Loading user data...</p>;
  }

  return (
    <div className="container">
      <h2 className="header">Create Host Profile</h2>
      <form onSubmit={handleSubmit} className="form">
        {/* Personal Information */}
        <div className="form-group">
          <label className="label">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled
            className="disabled-input"
          />
        </div>
        
        <div className="form-group">
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled
            className="disabled-input"
          />
        </div>
        
        <div className="form-group full-width-col">
          <label className="label">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Write a short bio..."
            className="textarea"
          />
        </div>
        
        <div className="form-group">
          <label className="label">Expertise</label>
          <input
            type="text"
            name="expertise"
            value={formData.expertise}
            onChange={handleChange}
            placeholder="Your area of expertise"
            className="input"
          />
        </div>
        
        <div className="form-group">
          <label className="label">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Your location"
            className="input"
          />
        </div>
        
        <div className="form-group full-width-col">
          <label className="label">Experience</label>
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Describe your experience"
            className="textarea"
          />
        </div>

        {/* Social Media Section */}
        <div className="full-width-col">
          <h3 className="section-title">Social Media Links</h3>
        </div>
        
        <div className="form-group">
          <label className="label">Facebook</label>
          <div className="social-input-container">
            <svg className="social-icon facebook-icon" viewBox="0 0 24 24">
              <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
            </svg>
            <input
              type="text"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="Your Facebook profile URL"
              className="social-input"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Twitter</label>
          <div className="social-input-container">
            <svg className="social-icon twitter-icon" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            <input
              type="text"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="Your Twitter profile URL"
              className="social-input"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">LinkedIn</label>
          <div className="social-input-container">
            <svg className="social-icon linkedin-icon" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <input
              type="text"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="Your LinkedIn profile URL"
              className="social-input"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Instagram</label>
          <div className="social-input-container">
            <svg className="social-icon instagram-icon" viewBox="0 0 24 24">
              <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 001.384 2.126A5.868 5.868 0 004.14 23.37c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.898 5.898 0 002.126-1.384 5.86 5.86 0 001.384-2.126c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913a5.89 5.89 0 00-1.384-2.126A5.847 5.847 0 0019.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 01-.899 1.382 3.744 3.744 0 01-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 01-1.379-.899 3.644 3.644 0 01-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.44 1.44 0 01-2.88 0 1.44 1.44 0 012.88 0z" />
            </svg>
            <input
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="Your Instagram profile URL"
              className="social-input"
            />
          </div>
        </div>

        {/* Avatar Upload Section */}
        <div className="form-group full-width-col avatar-upload">
          <label className="label">Avatar</label>
          <input 
            type="file" 
            name="avatar" 
            onChange={handleFileChange} 
            className="file-input" 
          />
        </div>
        
        {avatarPreview && (
          <div className="avatar-preview full-width-col">
            <img 
              src={avatarPreview} 
              alt="Avatar Preview" 
              className="avatar-image" 
            />
          </div>
        )}

        {/* Form Action Buttons */}
        <div className="form-group full-width-col action-buttons">
          <button
            type="submit"
            className="submit-button"
          >
            Submit Application
          </button>
        </div>
        
        <div className="form-group full-width-col">
          <button
            type="button"
            onClick={handleBack}
            className="back-button"
          >
            Back to Dashboard
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateHostProfile;