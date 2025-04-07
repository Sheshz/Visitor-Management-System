import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserCircle,
  Lock,
  Settings,
  Edit2,
  Save,
  X,
  AlertTriangle,
  Search,
  Trash2,
  User,
  Clock,
  Database,
  Camera, // Added Camera icon for face unlock
} from "lucide-react";
import ProfileIcon from "../../components/ProfileIcon";
import generateColorFromEmail from "../../utils/generateColor";
import "../../CSS/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });
  const [searchHistory, setSearchHistory] = useState([
    { id: 1, query: "React hooks tutorial", date: "2025-03-28" },
    { id: 2, query: "User profile UI design", date: "2025-03-29" },
    { id: 3, query: "Modern dashboard examples", date: "2025-03-30" },
  ]);
  const [clearHistoryConfirm, setClearHistoryConfirm] = useState(false);
  const [viewSearchHistory, setViewSearchHistory] = useState(false);
  // Add state for face unlock
  const [faceUnlockEnabled, setFaceUnlockEnabled] = useState(false);
  const [showFaceSetup, setShowFaceSetup] = useState(false);
  const [faceSetupStep, setFaceSetupStep] = useState(1);
  const [faceCapturing, setFaceCapturing] = useState(false);

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
        // Check if face unlock is enabled for this user
        setFaceUnlockEnabled(response.data.faceUnlockEnabled || false);
        setError(null);
      } catch (error) {
        setError("Failed to load profile. Please try again later.");
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Check if we should open the settings tab
    const activeTabFromNav = localStorage.getItem("profileActiveTab");
    if (activeTabFromNav) {
      setActiveTab(activeTabFromNav);
      // Clear the value after using it
      localStorage.removeItem("profileActiveTab");
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser({
      ...updatedUser,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
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

      setUser({ ...response.data });
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
          newPassword: passwordData.newPassword,
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
        confirmPassword: "",
      });

      showNotification("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError(
        error.response?.data?.message || "Password update failed"
      );
      showNotification(
        "Failed to update password. Please check your current password.",
        "error"
      );
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

  const cancelDeleteAccount = () => {
    setDeleteConfirm(false);
  };

  const handleClearHistory = () => {
    if (!clearHistoryConfirm) {
      setClearHistoryConfirm(true);
      return;
    }

    // Clear search history
    setSearchHistory([]);
    setClearHistoryConfirm(false);
    showNotification("Search history cleared successfully!");
    setViewSearchHistory(false);
  };

  const cancelClearHistory = () => {
    setClearHistoryConfirm(false);
  };

  const deleteHistoryItem = (id) => {
    setSearchHistory(searchHistory.filter((item) => item.id !== id));
    showNotification("Search item removed successfully!");
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setUpdatedUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  };

  const handleExportData = () => {
    // In a real app, this would trigger a data export
    showNotification(
      "Your data is being exported. You'll receive it by email soon!"
    );
  };

  // Face unlock functions
  const toggleFaceUnlock = async () => {
    if (faceUnlockEnabled) {
      // Disable face unlock
      try {
        await axios.put(
          "http://localhost:5000/api/users/face-unlock",
          { enabled: false },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFaceUnlockEnabled(false);
        showNotification("Face Unlock has been disabled");
      } catch (error) {
        console.error("Error disabling face unlock:", error);
        showNotification("Failed to disable Face Unlock", "error");
      }
    } else {
      // Show face setup
      setShowFaceSetup(true);
      setFaceSetupStep(1);
    }
  };

  const startFaceCapture = () => {
    setFaceCapturing(true);
    // Simulate face scanning process
    setTimeout(() => {
      setFaceCapturing(false);
      setFaceSetupStep(2);
    }, 3000);
  };

  const completeFaceSetup = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/users/face-unlock",
        { enabled: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFaceUnlockEnabled(true);
      setShowFaceSetup(false);
      showNotification("Face Unlock has been successfully enabled");
    } catch (error) {
      console.error("Error enabling face unlock:", error);
      showNotification("Failed to enable Face Unlock", "error");
    }
  };

  const cancelFaceSetup = () => {
    setShowFaceSetup(false);
    setFaceSetupStep(1);
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
        <div
          className={`notification ${
            notification.type === "error" ? "error" : "success"
          }`}
        >
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
          <button
            className={`tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="tab-icon" />
            Settings
          </button>
        </div>

        <div className="profile-content">
          {activeTab === "profile" && (
            <div className="profile-section">
              <div className="profile-header-section">
                <h1 className="profile-title">My Profile</h1>
                {!isEditing && (
                  <button
                    className="profile-edit-button"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="profile-content-card">
                  <div className="profile-info-layout">
                    {/* Replace the existing avatar with ProfileIcon component */}
                    <div className="profile-avatar">
                      <ProfileIcon
                        firstName={user.firstName}
                        lastName={user.lastName}
                        email={user.email}
                        size="80px"
                      />
                    </div>
                    <div className="profile-fields-container">
                      <div className="profile-fields-row">
                        <div className="profile-field-group">
                          <p className="profile-field-label">First Name</p>
                          <p className="profile-field-value">
                            {user.firstName}
                          </p>
                        </div>
                        <div className="profile-field-group">
                          <p className="profile-field-label">Last Name</p>
                          <p className="profile-field-value">{user.lastName}</p>
                        </div>
                      </div>
                      <div className="profile-fields-row">
                        <div className="profile-field-group">
                          <p className="profile-field-label">Email</p>
                          <p className="profile-field-value">{user.email}</p>
                        </div>
                        <div className="profile-field-group">
                          <p className="profile-field-label">Role</p>
                          <p className="profile-field-value capitalize">
                            {user.role || "User"}
                          </p>
                        </div>
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
                    <button type="submit" className="save-button">
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
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-section">
              <h1 className="account-settings-title">Account Settings</h1>

              {/* New Face Unlock Section */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon face-icon">
                    <Camera className="icon-color" />
                  </div>
                  <div className="settings-card-title">
                    <h2>Face Unlock</h2>
                    <p>
                      Enable Face ID to securely sign in to your account without
                      a password.
                    </p>
                  </div>
                </div>
                <div className="settings-card-actions single-action">
                  <button
                    className={
                      faceUnlockEnabled ? "disable-button" : "enable-button"
                    }
                    onClick={toggleFaceUnlock}
                  >
                    {faceUnlockEnabled
                      ? "Disable Face Unlock"
                      : "Enable Face Unlock"}
                  </button>
                </div>

                {showFaceSetup && (
                  <div className="face-setup-panel">
                    {faceSetupStep === 1 && (
                      <div className="face-setup-step">
                        <h3>Face ID Setup</h3>
                        <div className="face-camera-placeholder">
                          {faceCapturing ? (
                            <div className="face-scanning">
                              <div className="scanning-animation"></div>
                              <p>Scanning face...</p>
                            </div>
                          ) : (
                            <Camera size={64} />
                          )}
                        </div>
                        <p className="face-setup-instructions">
                          Position your face in the frame and click "Capture" to
                          scan your face.
                        </p>
                        <div className="face-setup-actions">
                          <button
                            className="cancel-button"
                            onClick={cancelFaceSetup}
                          >
                            Cancel
                          </button>
                          <button
                            className="capture-button"
                            onClick={startFaceCapture}
                            disabled={faceCapturing}
                          >
                            {faceCapturing ? "Capturing..." : "Capture"}
                          </button>
                        </div>
                      </div>
                    )}

                    {faceSetupStep === 2 && (
                      <div className="face-setup-step">
                        <h3>Face ID Captured</h3>
                        <div className="face-success">
                          <div className="success-icon">✓</div>
                          <p>Your face has been successfully captured</p>
                        </div>
                        <p className="face-setup-instructions">
                          You can now use Face ID to sign in to your account.
                          For best results, set up Face ID in good lighting
                          conditions.
                        </p>
                        <div className="face-setup-actions">
                          <button
                            className="cancel-button"
                            onClick={cancelFaceSetup}
                          >
                            Cancel
                          </button>
                          <button
                            className="complete-button"
                            onClick={completeFaceSetup}
                          >
                            Complete Setup
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Search History Section - Updated to match the design */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">
                    <Clock className="icon-color" />
                  </div>
                  <div className="settings-card-title">
                    <h2>Search History</h2>
                    <p>
                      View and manage your search history within the system.
                    </p>
                  </div>
                </div>
                <div className="settings-card-actions">
                  <button
                    className="view-button"
                    onClick={() => setViewSearchHistory(!viewSearchHistory)}
                  >
                    View Search History
                  </button>
                  <button
                    className="clear-button"
                    onClick={handleClearHistory}
                    disabled={searchHistory.length === 0}
                  >
                    Clear History
                  </button>
                </div>

                {clearHistoryConfirm && (
                  <div className="confirmation-box">
                    <p>
                      Are you sure you want to clear all search history? This
                      action cannot be undone.
                    </p>
                    <div className="confirmation-actions">
                      <button
                        className="cancel-button"
                        onClick={cancelClearHistory}
                      >
                        Cancel
                      </button>
                      <button
                        className="confirm-button danger"
                        onClick={handleClearHistory}
                      >
                        Clear All History
                      </button>
                    </div>
                  </div>
                )}

                {viewSearchHistory && (
                  <div className="history-panel">
                    {searchHistory.length > 0 ? (
                      <div className="history-list">
                        {searchHistory.map((item) => (
                          <div key={item.id} className="history-item">
                            <div className="history-item-content">
                              <div className="history-icon">
                                <Search size={16} />
                              </div>
                              <div className="history-details">
                                <p className="history-query">{item.query}</p>
                                <p className="history-date">{item.date}</p>
                              </div>
                            </div>
                            <button
                              className="delete-history-item"
                              onClick={() => deleteHistoryItem(item.id)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-state">No search history found</p>
                    )}
                  </div>
                )}
              </div>

              {/* Data Management Section - New section to match the design */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon data-icon">
                    <Database className="icon-color" />
                  </div>
                  <div className="settings-card-title">
                    <h2>Data Management</h2>
                    <p>
                      Manage or export your personal data stored in our system.
                    </p>
                  </div>
                </div>
                <div className="settings-card-actions single-action">
                  <button className="export-button" onClick={handleExportData}>
                    Export Data
                  </button>
                </div>
              </div>

              {/* Account Deletion Section */}
              <div className="settings-danger">
                <h2>Delete Account</h2>
                <div className="danger-zone">
                  <p>
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>

                  {!deleteConfirm ? (
                    <button className="delete-button" onClick={handleDelete}>
                      <Trash2 className="button-icon" />
                      Delete Account
                    </button>
                  ) : (
                    <div className="confirmation-box">
                      <div className="confirmation-warning">
                        <AlertTriangle className="warning-icon" />
                        <p>
                          Are you absolutely sure you want to delete your
                          account? All of your data will be permanently removed.
                          This action cannot be undone.
                        </p>
                      </div>
                      <div className="confirmation-actions">
                        <button
                          className="cancel-button"
                          onClick={cancelDeleteAccount}
                        >
                          Cancel
                        </button>
                        <button
                          className="confirm-button danger"
                          onClick={handleDelete}
                        >
                          Yes, Delete My Account
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
