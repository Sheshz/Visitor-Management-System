import React, { useState, useEffect } from "react";
import axios from "axios";
import { UserCircle, Lock, Edit2, Save, X, AlertTriangle } from "lucide-react";
import "../CSS/Profile.css";


const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "", visible: false });

  const token = localStorage.getItem("token");

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification({ message: "", type: "", visible: false });
    }, 3000);
  };

  useEffect(() => {
    // Fetch user profile
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setUpdatedUser({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
        });
        setError(null);
      } catch (error) {
        setError("Failed to load profile. Please try again later.");
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser({
      ...updatedUser,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:5000/api/users/me", 
        updatedUser, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setUser({...response.data});
      setIsEditing(false);
      showNotification("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification("Failed to update profile. Please try again.", "error");
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    try {
      await axios.put(
        "http://localhost:5000/api/users/password", 
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Reset form and show success
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      showNotification("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError(error.response?.data?.message || "Password update failed");
      showNotification("Failed to update password. Please check your current password.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    
    try {
      await axios.delete("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error deleting profile:", error);
      showNotification("Failed to delete account. Please try again.", "error");
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setUpdatedUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <AlertTriangle className="error-icon" />
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {notification.visible && (
        <div className={`notification ${notification.type === 'error' ? 'error' : 'success'}`}>
          {notification.message}
        </div>
      )}
      
      <div className="profile-card">
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <UserCircle className="tab-icon" />
            Profile
          </button>
          <button
            className={`tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Lock className="tab-icon" />
            Security
          </button>
        </div>
        
        <div className="profile-content">
          {activeTab === "profile" && (
            <div className="profile-section">
              <div className="profile-header">
                <h1>My Profile</h1>
                {!isEditing && (
                  <button 
                    className="edit-button"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="button-icon" />
                    Edit Profile
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="profile-info-container">
                  <div className="avatar">
                    {user.firstName.charAt(0).toLowerCase()}{user.lastName.charAt(0).toLowerCase()}
                  </div>
                  <div className="profile-details">
                    <div className="detail-row">
                      <div className="detail-column">
                        <p className="detail-label">First Name</p>
                        <p className="detail-value">{user.firstName}</p>
                      </div>
                      <div className="detail-column">
                        <p className="detail-label">Last Name</p>
                        <p className="detail-value">{user.lastName}</p>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-column">
                        <p className="detail-label">Email</p>
                        <p className="detail-value">{user.email}</p>
                      </div>
                      <div className="detail-column">
                        <p className="detail-label">Role</p>
                        <p className="detail-value capitalize">{user.role || "User"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form className="profile-form" onSubmit={handleUpdate}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input 
                        type="text" 
                        id="firstName"
                        name="firstName" 
                        value={updatedUser.firstName} 
                        onChange={handleChange} 
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input 
                        type="text" 
                        id="lastName"
                        name="lastName" 
                        value={updatedUser.lastName} 
                        onChange={handleChange} 
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      name="email" 
                      value={updatedUser.email} 
                      onChange={handleChange} 
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={cancelEdit}
                    >
                      <X className="button-icon" />
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="save-button"
                    >
                      <Save className="button-icon" />
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div className="security-section">
              <div className="security-password">
                <h2>Change Password</h2>
                <form className="password-form" onSubmit={updatePassword}>
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input 
                      type="password" 
                      id="currentPassword"
                      name="currentPassword" 
                      value={passwordData.currentPassword} 
                      onChange={handlePasswordChange} 
                      required
                    />
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input 
                        type="password" 
                        id="newPassword"
                        name="newPassword" 
                        value={passwordData.newPassword} 
                        onChange={handlePasswordChange} 
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <input 
                        type="password" 
                        id="confirmPassword"
                        name="confirmPassword" 
                        value={passwordData.confirmPassword} 
                        onChange={handlePasswordChange} 
                        required
                      />
                    </div>
                  </div>
                  
                  {passwordError && (
                    <div className="error-message">
                      <AlertTriangle className="error-icon-small" />
                      {passwordError}
                    </div>
                  )}
                  
                  <button type="submit" className="password-update-button">
                    Update Password
                  </button>
                </form>
              </div>
              
              <div className="security-danger">
                <h2>Delete Account</h2>
                <div className="danger-zone">
                  {!deleteConfirm ? (
                    <div>
                      <p>Permanently delete your account and all of your data.</p>
                      <button 
                        className="delete-button"
                        onClick={handleDelete}
                      >
                        Delete Account
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="confirmation-warning">
                        <AlertTriangle className="error-icon-small" />
                        <p>Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone.</p>
                      </div>
                      <div className="confirmation-actions">
                        <button 
                          className="delete-confirm-button"
                          onClick={handleDelete}
                        >
                          Yes, Delete My Account
                        </button>
                        <button 
                          className="cancel-delete-button"
                          onClick={() => setDeleteConfirm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;