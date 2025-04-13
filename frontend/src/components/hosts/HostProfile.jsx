import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SessionManager } from "../../utils/SessionManager";
import "../../CSS/HostProfile.css";
import { 
  FaEdit, 
  FaTrashAlt, 
  FaCheck, 
  FaTimes, 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram,
  FaCamera
} from "react-icons/fa";

const HostProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  
  // Host profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    hostID: "",
    bio: "",
    expertise: "",
    location: "",
    experience: "",
    avatar: "",
    socialMedia: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: ""
    },
    isActive: true,
    rating: 0,
    totalReviews: 0
  });
  
  // Edited profile state to keep track of changes
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    bio: "",
    expertise: "",
    location: "",
    experience: "",
    socialMedia: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: ""
    }
  });
  
  // Selected file for upload
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch host profile data
  useEffect(() => {
    const fetchHostProfile = async () => {
      setIsLoading(true);
      try {
        const hostToken = SessionManager.getHostToken() || localStorage.getItem("hostToken");
        
        if (!hostToken) {
          throw new Error("No authentication token found");
        }
        
        const response = await fetch("http://localhost:5000/api/hosts/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${hostToken}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch profile");
        }
        
        const data = await response.json();
        console.log("Profile data received:", data);
        
        setProfile(data);
        // Initialize editedProfile with current data
        setEditedProfile({
          name: data.name,
          bio: data.bio,
          expertise: data.expertise,
          location: data.location,
          experience: data.experience,
          socialMedia: {
            facebook: data.socialMedia?.facebook || "",
            twitter: data.socialMedia?.twitter || "",
            linkedin: data.socialMedia?.linkedin || "",
            instagram: data.socialMedia?.instagram || ""
          }
        });
        
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHostProfile();
  }, []);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({
      ...editedProfile,
      [name]: value
    });
  };
  
  // Handle social media input changes
  const handleSocialInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({
      ...editedProfile,
      socialMedia: {
        ...editedProfile.socialMedia,
        [name]: value
      }
    });
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      setEditedProfile({
        name: profile.name,
        bio: profile.bio,
        expertise: profile.expertise,
        location: profile.location,
        experience: profile.experience,
        socialMedia: {
          facebook: profile.socialMedia?.facebook || "",
          twitter: profile.socialMedia?.twitter || "",
          linkedin: profile.socialMedia?.linkedin || "",
          instagram: profile.socialMedia?.instagram || ""
        }
      });
      setSelectedFile(null);
      setPreviewImage(null);
    }
    setIsEditing(!isEditing);
  };
  
  // Save profile changes
  const saveChanges = async () => {
    setIsLoading(true);
    try {
      const hostToken = SessionManager.getHostToken() || localStorage.getItem("hostToken");
      
      if (!hostToken) {
        throw new Error("No authentication token found");
      }
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append("name", editedProfile.name);
      formData.append("bio", editedProfile.bio);
      formData.append("expertise", editedProfile.expertise);
      formData.append("location", editedProfile.location);
      formData.append("experience", editedProfile.experience);
      
      // Append social media links
      Object.entries(editedProfile.socialMedia).forEach(([key, value]) => {
        formData.append(`socialMedia[${key}]`, value);
      });
      
      // Append avatar if a new file was selected
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }
      
      const response = await fetch("http://localhost:5000/api/hosts/update-profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${hostToken}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      
      const updatedProfile = await response.json();
      
      // Update profile state with new data
      setProfile(updatedProfile);
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewImage(null);
      
      // Show success message
      setSuccessMessage("Profile updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete host profile
  const deleteProfile = async () => {
    try {
      const hostToken = SessionManager.getHostToken() || localStorage.getItem("hostToken");
      
      if (!hostToken) {
        throw new Error("No authentication token found");
      }
      
      const response = await fetch("http://localhost:5000/api/hosts/delete-profile", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${hostToken}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete profile");
      }
      
      // Clear storage and redirect to login
      SessionManager.logoutHost();
      localStorage.removeItem("hostToken");
      localStorage.removeItem("hostId");
      localStorage.removeItem("hostName");
      localStorage.removeItem("hostEmail");
      localStorage.removeItem("gp_remember_email");
      localStorage.removeItem("hostProfileImage");
      
      navigate("/host-login?deleted=true");
      
    } catch (error) {
      console.error("Error deleting profile:", error);
      setError(error.message);
    }
  };
  
  // Calculate star rating display
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    
    return stars;
  };

  if (isLoading && !profile.name) {
    return (
      <div className="host-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error && !profile.name) {
    return (
      <div className="host-profile-error">
        <h2>Error loading profile</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/host-dashboard")}>Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="host-profile-container">
      {/* Success message notification */}
      {successMessage && (
        <div className="success-notification">
          <FaCheck className="success-icon" />
          <span>{successMessage}</span>
        </div>
      )}
      
      <div className="profile-header">
        <h2>{isEditing ? "Edit Profile" : "Host Profile"}</h2>
        
        <div className="profile-actions">
          {!isEditing ? (
            <button 
              className="edit-button"
              onClick={toggleEditMode}
              aria-label="Edit profile"
            >
              <FaEdit /> Edit Profile
            </button>
          ) : (
            <div className="edit-action-buttons">
              <button 
                className="save-button"
                onClick={saveChanges}
                disabled={isLoading}
                aria-label="Save changes"
              >
                <FaCheck /> Save
              </button>
              <button 
                className="cancel-button"
                onClick={toggleEditMode}
                aria-label="Cancel editing"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          )}
          
          {!isEditing && (
            <button 
              className="delete-button"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete profile"
            >
              <FaTrashAlt /> Delete Profile
            </button>
          )}
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-main">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {isEditing ? (
                <>
                  <div className="avatar-preview">
                    {previewImage ? (
                      <img src={previewImage} alt="Avatar Preview" />
                    ) : (
                      <img 
                        src={profile.avatar || "/default-avatar.png"} 
                        alt={profile.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                    )}
                    <label className="avatar-upload-label" htmlFor="avatar-upload">
                      <FaCamera />
                      <span>Change Photo</span>
                    </label>
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }}
                    />
                  </div>
                </>
              ) : (
                <img 
                  src={profile.avatar || "/default-avatar.png"} 
                  alt={profile.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-avatar.png";
                  }}
                />
              )}
            </div>
            <div className="profile-status">
              <div className={`status-indicator ${profile.isActive ? 'active' : 'inactive'}`}>
                {profile.isActive ? 'Active Host' : 'Inactive Host'}
              </div>
              <div className="host-id">ID: {profile.hostID}</div>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="profile-item">
              <h3>Name</h3>
              {isEditing ? (
                <input 
                  type="text" 
                  name="name" 
                  value={editedProfile.name} 
                  onChange={handleInputChange}
                  placeholder="Your full name"
                />
              ) : (
                <p>{profile.name}</p>
              )}
            </div>
            
            <div className="profile-item">
              <h3>Email</h3>
              <p>{profile.email}</p>
              <small>Email cannot be changed</small>
            </div>
            
            <div className="profile-item full-width">
              <h3>Bio</h3>
              {isEditing ? (
                <textarea 
                  name="bio" 
                  value={editedProfile.bio} 
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              ) : (
                <p>{profile.bio}</p>
              )}
            </div>
            
            <div className="profile-item">
              <h3>Expertise</h3>
              {isEditing ? (
                <input 
                  type="text" 
                  name="expertise" 
                  value={editedProfile.expertise} 
                  onChange={handleInputChange}
                  placeholder="Your area of expertise"
                />
              ) : (
                <p>{profile.expertise}</p>
              )}
            </div>
            
            <div className="profile-item">
              <h3>Location</h3>
              {isEditing ? (
                <input 
                  type="text" 
                  name="location" 
                  value={editedProfile.location} 
                  onChange={handleInputChange}
                  placeholder="Your location"
                />
              ) : (
                <p>{profile.location}</p>
              )}
            </div>
            
            <div className="profile-item full-width">
              <h3>Experience</h3>
              {isEditing ? (
                <textarea 
                  name="experience" 
                  value={editedProfile.experience} 
                  onChange={handleInputChange}
                  placeholder="Describe your professional experience"
                  rows={3}
                />
              ) : (
                <p>{profile.experience}</p>
              )}
            </div>
            
            <div className="profile-item ratings-section">
              <h3>Host Rating</h3>
              <div className="rating-display">
                <div className="stars">{renderStarRating(profile.rating)}</div>
                <span className="rating-value">{profile.rating.toFixed(1)}</span>
                <span className="reviews-count">({profile.totalReviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="social-media-section">
          <h3>Social Media Links</h3>
          <div className="social-links">
            <div className="social-link-item">
              <div className="social-icon facebook">
                <FaFacebook />
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  name="facebook" 
                  value={editedProfile.socialMedia.facebook} 
                  onChange={handleSocialInputChange}
                  placeholder="Facebook URL"
                />
              ) : (
                <a 
                  href={profile.socialMedia?.facebook || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={!profile.socialMedia?.facebook ? "disabled-link" : ""}
                >
                  {profile.socialMedia?.facebook || "Not provided"}
                </a>
              )}
            </div>
            
            <div className="social-link-item">
              <div className="social-icon twitter">
                <FaTwitter />
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  name="twitter" 
                  value={editedProfile.socialMedia.twitter} 
                  onChange={handleSocialInputChange}
                  placeholder="Twitter URL"
                />
              ) : (
                <a 
                  href={profile.socialMedia?.twitter || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={!profile.socialMedia?.twitter ? "disabled-link" : ""}
                >
                  {profile.socialMedia?.twitter || "Not provided"}
                </a>
              )}
            </div>
            
            <div className="social-link-item">
              <div className="social-icon linkedin">
                <FaLinkedin />
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  name="linkedin" 
                  value={editedProfile.socialMedia.linkedin} 
                  onChange={handleSocialInputChange}
                  placeholder="LinkedIn URL"
                />
              ) : (
                <a 
                  href={profile.socialMedia?.linkedin || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={!profile.socialMedia?.linkedin ? "disabled-link" : ""}
                >
                  {profile.socialMedia?.linkedin || "Not provided"}
                </a>
              )}
            </div>
            
            <div className="social-link-item">
              <div className="social-icon instagram">
                <FaInstagram />
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  name="instagram" 
                  value={editedProfile.socialMedia.instagram} 
                  onChange={handleSocialInputChange}
                  placeholder="Instagram URL"
                />
              ) : (
                <a 
                  href={profile.socialMedia?.instagram || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={!profile.socialMedia?.instagram ? "disabled-link" : ""}
                >
                  {profile.socialMedia?.instagram || "Not provided"}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirmation-modal">
            <div className="modal-header">
              <h3>Delete Profile</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete your host profile? This action cannot be undone.</p>
              <p className="warning-text">All your data including visitation history and meetings will be permanently removed.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-button"
                onClick={deleteProfile}
              >
                Yes, Delete My Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Processing...</p>
        </div>
      )}
    </div>
  );
};

export default HostProfile;