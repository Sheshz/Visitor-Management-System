/*import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../CSS/HostProfile.css";

const HostProfile = () => {
  const [hostData, setHostData] = useState({
    name: "",
    email: "",
    location: "",
    experience: "",
    bio: "",
    expertise: "",
    socialLinks: {
      facebook: { connected: false, url: "" },
      twitter: { connected: false, url: "" },
      linkedin: { connected: false, url: "" },
      instagram: { connected: false, url: "" },
    },
    profileImage: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch host profile data
    const fetchHostData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/hosts/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setHostData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load profile data");
        setLoading(false);
        console.error("Error fetching profile:", err);
      }
    };

    fetchHostData();
  }, [navigate]);

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const handleDeleteProfile = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your profile? This action cannot be undone."
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete("http://localhost:5000/api/hosts/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Clear local storage and redirect to home page
        localStorage.removeItem("token");
        navigate("/");
      } catch (err) {
        setError("Failed to delete profile");
        console.error("Error deleting profile:", err);
      }
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/hosts/upload-profile-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHostData((prev) => ({
        ...prev,
        profileImage: response.data.imageUrl,
      }));
    } catch (err) {
      setError("Failed to upload image");
      console.error("Error uploading image:", err);
    }
  };

  const handleRemoveProfileImage = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        "http://localhost:5000/api/hosts/remove-profile-image",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHostData((prev) => ({
        ...prev,
        profileImage: "",
      }));
    } catch (err) {
      setError("Failed to remove image");
      console.error("Error removing image:", err);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="host-profile-container">
      <div className="profile-header">
        <div className="profile-image-container">
          {hostData.profileImage ? (
            <>
              <img
                src={hostData.profileImage}
                alt={hostData.name || "Host"}
                className="profile-image"
              />
              <button
                className="remove-image-btn"
                onClick={handleRemoveProfileImage}
              >
                Remove
              </button>
            </>
          ) : (
            <div className="profile-image-placeholder">
              <span>
                {hostData.name ? hostData.name.charAt(0).toUpperCase() : "H"}
              </span>
              <input
                type="file"
                id="profile-image-upload"
                accept="image/*"
                onChange={handleProfileImageUpload}
                style={{ display: "none" }}
              />
              <label
                htmlFor="profile-image-upload"
                className="upload-image-btn"
              >
                Add Photo
              </label>
            </div>
          )}
        </div>
        <div className="profile-info">
          <h2>{hostData.name || "Host"}</h2>
          <p>{hostData.email || "No email provided"}</p>
          <div className="host-status">
            Host Status:{" "}
            <span className={`status-${hostData.status.toLowerCase()}`}>
              {hostData.status}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`tab ${activeTab === "meetings" ? "active" : ""}`}
          onClick={() => setActiveTab("meetings")}
        >
          Meetings
        </button>
        <button
          className={`tab ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
        <button
          className={`tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      {activeTab === "profile" && (
        <div className="profile-content">
          <h2>Host Profile</h2>

          <div className="profile-sections">
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="info-item">
                <label>Name</label>
                <div className="info-value">
                  {hostData.name || "Not specified"}
                </div>
              </div>
              <div className="info-item">
                <label>Email</label>
                <div className="info-value">
                  {hostData.email || "No email provided"}
                </div>
              </div>
              <div className="info-item">
                <label>Location</label>
                <div className="info-value">
                  {hostData.location || "Not specified"}
                </div>
              </div>
              <div className="info-item">
                <label>Experience</label>
                <div className="info-value">
                  {hostData.experience || "Not specified"}
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Professional Details</h3>
              <div className="info-item">
                <label>Bio</label>
                <div className="info-value bio-text">
                  {hostData.bio || "No bio provided"}
                </div>
              </div>
              <div className="info-item">
                <label>Expertise</label>
                <div className="info-value">
                  {hostData.expertise || "Not specified"}
                </div>
              </div>
            </div>
          </div>

          <div className="social-media-section">
            <h3>Social Media Links</h3>
            <div className="social-links">
              <div className="social-link-item">
                <div className="social-icon facebook">F</div>
                <div className="social-name">Facebook</div>
                <div className="connection-status">
                  {hostData.socialLinks.facebook.connected
                    ? "Connected"
                    : "Not Connected"}
                </div>
              </div>
              <div className="social-link-item">
                <div className="social-icon twitter">T</div>
                <div className="social-name">Twitter</div>
                <div className="connection-status">
                  {hostData.socialLinks.twitter.connected
                    ? "Connected"
                    : "Not Connected"}
                </div>
              </div>
              <div className="social-link-item">
                <div className="social-icon linkedin">L</div>
                <div className="social-name">LinkedIn</div>
                <div className="connection-status">
                  {hostData.socialLinks.linkedin.connected
                    ? "Connected"
                    : "Not Connected"}
                </div>
              </div>
              <div className="social-link-item">
                <div className="social-icon instagram">I</div>
                <div className="social-name">Instagram</div>
                <div className="connection-status">
                  {hostData.socialLinks.instagram.connected
                    ? "Connected"
                    : "Not Connected"}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="edit-profile-btn" onClick={handleEditProfile}>
              Edit Profile
            </button>
            <button
              className="delete-profile-btn"
              onClick={handleDeleteProfile}
            >
              Delete Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostProfile;*/
