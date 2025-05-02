import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { SessionManager } from "../../utils/SessionManager";
import "../../CSS/meetingCSS/CreateMeeting.css";

const CreateMeetingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [meetingId, setMeetingId] = useState("");
  const [meetingPassword, setMeetingPassword] = useState("");
  const [user, setUser] = useState(null);

  // Check authentication and get user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!SessionManager.isAuthenticated()) {
          console.log("Not authenticated, redirecting to login");
          navigate("/login", { state: { from: "/create-meeting" } });
          return;
        }

        const currentUser = SessionManager.getCurrentUser();
        if (!currentUser) {
          console.log("No user found, redirecting to login");
          SessionManager.logout();
          navigate("/login", { state: { from: "/create-meeting" } });
          return;
        }

        setUser(currentUser);
        setAuthChecking(false);

        // Refresh token if needed
        try {
          const tokenRefreshed = await SessionManager.refreshTokenIfNeeded();
          console.log(
            "Token refresh attempt result:",
            tokenRefreshed ? "refreshed" : "not needed"
          );
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          setError("Unable to refresh authentication. Please log in again.");
          SessionManager.logout();
          navigate("/login", { state: { from: "/create-meeting" } });
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Authentication error. Please log in again.");
        SessionManager.logout();
        navigate("/login", { state: { from: "/create-meeting" } });
      }
    };

    checkAuth();
  }, [navigate]);

  // Generate random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Get current date-time rounded to next 15 minutes
  const getCurrentDateTime = () => {
    const now = new Date();
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(minutes);
    now.setSeconds(0);
    return now.toISOString().slice(0, 16);
  };

  // Calculate default end time (1 hour after start time)
  const getDefaultEndTime = (startTime) => {
    if (!startTime) return "";
    const date = new Date(startTime);
    date.setHours(date.getHours() + 1);
    return date.toISOString().slice(0, 16);
  };

  // Meeting form data with improved defaults
  const [meetingData, setMeetingData] = useState({
    title: "",
    description: "",
    startTime: getCurrentDateTime(),
    endTime: getDefaultEndTime(getCurrentDateTime()),
    recordingEnabled: false,
    password: generatePassword(),
    participants: [],
  });

  // Participant form data
  const [participant, setParticipant] = useState({
    name: "",
    email: "",
  });

  // Handle logout
  const handleLogout = () => {
    SessionManager.logout();
    navigate("/login");
  };

  // Update end time when start time changes
  useEffect(() => {
    if (meetingData.startTime) {
      const newEndTime = getDefaultEndTime(meetingData.startTime);
      if (
        !meetingData.endTime ||
        new Date(meetingData.endTime) <= new Date(meetingData.startTime)
      ) {
        setMeetingData((prev) => ({
          ...prev,
          endTime: newEndTime,
        }));
      }
    }
  }, [meetingData.startTime]);

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time for display
  const formatTimeForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMeetingData({
      ...meetingData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle date-time changes with validation
  const handleDateTimeChange = (e) => {
    const { name, value } = e.target;
    const newDate = new Date(value);
    const now = new Date();

    // Validate start time is in the future
    if (name === "startTime" && newDate < now) {
      setError("Start time must be in the future");
      return;
    }

    // Validate end time is after start time
    if (name === "endTime") {
      const startTime = new Date(meetingData.startTime);
      if (newDate <= startTime) {
        setError("End time must be after start time");
        return;
      }
    }

    setError("");
    setMeetingData({
      ...meetingData,
      [name]: value,
    });
  };

  // Handle participant form changes
  const handleParticipantChange = (e) => {
    const { name, value } = e.target;
    setParticipant({
      ...participant,
      [name]: value,
    });
  };

  // Add participant to the list
  const addParticipant = (e) => {
    e.preventDefault();

    if (!participant.email || !participant.name) {
      setError("Participant name and email are required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (meetingData.participants.some((p) => p.email === participant.email)) {
      setError("This participant is already added");
      return;
    }

    setMeetingData({
      ...meetingData,
      participants: [...meetingData.participants, participant],
    });

    setParticipant({ name: "", email: "" });
    setError("");
  };

  // Remove participant from the list
  const removeParticipant = (email) => {
    setMeetingData({
      ...meetingData,
      participants: meetingData.participants.filter((p) => p.email !== email),
    });
  };

  // Create meeting
  const createMeeting = async (e) => {
    e.preventDefault();

    // Validate form
    if (!meetingData.title || !meetingData.startTime || !meetingData.endTime) {
      setError("Meeting title, start time, and end time are required");
      return;
    }

    // Validate that end time is after start time
    const start = new Date(meetingData.startTime);
    const end = new Date(meetingData.endTime);
    const now = new Date();

    if (start < now) {
      setError("Start time must be in the future");
      return;
    }

    if (end <= start) {
      setError("End time must be after start time");
      return;
    }

    // Set loading state
    setLoading(true);
    setError("");

    try {
      // Force token refresh before attempting to create meeting
      try {
        await SessionManager.refreshToken();
        console.log("Token refreshed before creating meeting");
      } catch (refreshError) {
        console.log("Failed to refresh token:", refreshError);
        // Continue anyway, we'll handle 401 errors below
      }

      // Get fresh token
      let token = SessionManager.getToken();

      // Check if token exists and is valid
      if (!token || !SessionManager.isAuthenticated()) {
        console.log("No valid token found, redirecting to login");
        setLoading(false);
        navigate("/login", { state: { from: "/create-meeting" } });
        return;
      }

      // Log token info (only first few characters for security)
      if (token) {
        console.log(
          "Using token (first 10 chars):",
          token.substring(0, 10) + "..."
        );
        console.log("Token length:", token.length);
      }

      // Use correct API URL
      const apiBaseUrl = window._env_?.REACT_APP_API_URL || "/api";
      const apiUrl = `${apiBaseUrl}/meetings/create`;

      console.log("Sending meeting creation request to:", apiUrl);

      const response = await axios.post(apiUrl, meetingData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // Include cookies if using cookie-based auth
      });

      // Handle success
      console.log("Meeting created successfully:", response.data);
      setSuccess(true);
      setLoading(false);

      // Store meeting ID and password
      const createdMeeting = response.data.meeting;
      setMeetingId(createdMeeting.meetingId);
      setMeetingPassword(meetingData.password);

      // Generate QR code data
      const joinUrl = `${window.location.origin}/meeting/join/${createdMeeting.meetingId}`;
      const qrData = JSON.stringify({
        meetingId: createdMeeting.meetingId,
        password: meetingData.password,
        joinUrl: joinUrl,
      });
      setQrCodeData(qrData);

      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error creating meeting:", error);
      setLoading(false);

      if (error.response) {
        console.log("Error response:", error.response);

        if (error.response.status === 401) {
          setError("Authentication failed. Please log in again.");
          console.log("Token valid?", SessionManager.isAuthenticated());

          // Check if refresh method exists and if we have a refresh token
          if (typeof SessionManager.hasRefreshToken === "function") {
            console.log("Has refresh token?", SessionManager.hasRefreshToken());
          }

          // Log out and redirect to login page
          SessionManager.logout();
          navigate("/login", { state: { from: "/create-meeting" } });
        } else if (error.response.status === 403) {
          setError("You do not have permission to create meetings.");
        } else if (error.response.status === 404) {
          setError(
            "API endpoint not found. Please check server configuration."
          );
        } else {
          // Show detailed error message if available
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            "Failed to create meeting. Please try again.";
          setError(errorMessage);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError(
          "Server not responding. Please check your connection and try again."
        );
        console.log("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(
          "An error occurred while processing your request. Please try again."
        );
        console.log("Error setting up request:", error.message);
      }
    }
  };

  // Copy meeting info to clipboard
  const copyMeetingInfo = () => {
    const meetingInfo = `Meeting ID: ${meetingId}\nPassword: ${meetingPassword}`;
    navigator.clipboard.writeText(meetingInfo);
    alert("Meeting information copied to clipboard!");
  };

  // Force re-authentication
  const handleReAuthenticate = () => {
    SessionManager.logout();
    navigate("/host-login", { state: { from: "/create-meeting" } });
  };

  if (authChecking) {
    return <div className="auth-checking">Checking authentication...</div>;
  }

  return (
    <div className="create-meeting-container">
      {/* Header with user info and logout */}
      <div className="meeting-header">
        <h1 className="page-title">Create New Meeting</h1>
        {user && (
          <div className="user-controls">
            <div className="user-info">
              <span className="user-name">{user.name || user.email}</span>
              {user.name && <span className="user-email">{user.email}</span>}
            </div>
            <button
              onClick={handleLogout}
              className="logout-button"
              title="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M16 17v-3h-5v-2h5v-3l4 3.5-4 3.5zm-9-1H5v-2h2V8H5V6h2V4a2 2 0 0 1 2-2h6v2H9v16h6v2H9a2 2 0 0 1-2-2v-2z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Success message and QR code display */}
      {success ? (
        <div className="success-container">
          <div className="success-message">
            <h2>Meeting Created Successfully!</h2>
            <p>
              Your meeting has been created and invitations have been sent to
              all participants.
            </p>

            <div className="meeting-info">
              <p>
                <strong>Meeting ID:</strong> {meetingId}
              </p>
              <p>
                <strong>Password:</strong> {meetingPassword}
              </p>
              <button onClick={copyMeetingInfo} className="copy-button">
                Copy Meeting Info
              </button>
            </div>

            <div className="qr-code-container">
              <h3>Meeting QR Code</h3>
              <p>Participants can scan this QR code to join the meeting:</p>
              {qrCodeData && (
                <QRCodeSVG value={qrCodeData} size={200} level="H" />
              )}
            </div>

            <div className="action-buttons">
              <button
                onClick={() => navigate("/meetings")}
                className="primary-button"
              >
                Go to Meetings
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={createMeeting} className="meeting-form">
          {error && (
            <div className="error-message">
              {error}
              {(error.includes("authentication") ||
                error.includes("session") ||
                error.includes("log in")) && (
                <button
                  onClick={handleReAuthenticate}
                  className="re-auth-button"
                >
                  Re-Login
                </button>
              )}
            </div>
          )}

          <div className="form-section">
            <h2 className="section-title">Meeting Details</h2>

            <div className="form-group">
              <label htmlFor="title">Meeting Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={meetingData.title}
                onChange={handleInputChange}
                placeholder="Enter meeting title"
                maxLength="100"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={meetingData.description}
                onChange={handleInputChange}
                placeholder="Enter meeting description"
                maxLength="500"
                rows="3"
                className="form-textarea"
              />
            </div>

            <div className="datetime-section">
              <h3 className="subsection-title">Date & Time</h3>

              <div className="datetime-group">
                <div className="datetime-label">Start</div>
                <div className="datetime-inputs">
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={meetingData.startTime}
                    onChange={handleDateTimeChange}
                    min={getCurrentDateTime()}
                    className="datetime-input"
                    required
                  />
                  <div className="datetime-display">
                    <span className="date-display">
                      {formatDateForDisplay(meetingData.startTime)}
                    </span>
                    <span className="time-display">
                      {formatTimeForDisplay(meetingData.startTime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="datetime-divider">
                <span className="divider-line"></span>
              </div>

              <div className="datetime-group">
                <div className="datetime-label">End</div>
                <div className="datetime-inputs">
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={meetingData.endTime}
                    onChange={handleDateTimeChange}
                    min={meetingData.startTime}
                    className="datetime-input"
                    required
                  />
                  <div className="datetime-display">
                    <span className="date-display">
                      {formatDateForDisplay(meetingData.endTime)}
                    </span>
                    <span className="time-display">
                      {formatTimeForDisplay(meetingData.endTime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="meeting-duration">
                {meetingData.startTime && meetingData.endTime && (
                  <span className="duration-text">
                    Duration:{" "}
                    {calculateDuration(
                      meetingData.startTime,
                      meetingData.endTime
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="recordingEnabled"
                name="recordingEnabled"
                checked={meetingData.recordingEnabled}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <label htmlFor="recordingEnabled" className="checkbox-label">
                Enable Recording
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="password">Meeting Password</label>
              <div className="password-input">
                <input
                  type="text"
                  id="password"
                  name="password"
                  value={meetingData.password}
                  onChange={handleInputChange}
                  maxLength="20"
                  className="form-input password-field"
                />
                <button
                  type="button"
                  onClick={() =>
                    setMeetingData({
                      ...meetingData,
                      password: generatePassword(),
                    })
                  }
                  className="regenerate-button"
                >
                  Regenerate
                </button>
              </div>
              <small className="form-help-text">
                Password for meeting security
              </small>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Participants</h2>

            <div className="add-participant-form">
              <div className="participant-inputs">
                <div className="form-group">
                  <label htmlFor="participantName">Name</label>
                  <input
                    type="text"
                    id="participantName"
                    name="name"
                    value={participant.name}
                    onChange={handleParticipantChange}
                    placeholder="Participant name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="participantEmail">Email</label>
                  <input
                    type="email"
                    id="participantEmail"
                    name="email"
                    value={participant.email}
                    onChange={handleParticipantChange}
                    placeholder="Participant email"
                    className="form-input"
                  />
                </div>

                <button
                  type="button"
                  onClick={addParticipant}
                  className="add-button"
                >
                  Add Participant
                </button>
              </div>
            </div>

            {meetingData.participants.length > 0 && (
              <div className="participants-list">
                <h3 className="subsection-title">
                  Invited Participants ({meetingData.participants.length})
                </h3>
                <ul className="participant-items">
                  {meetingData.participants.map((p, index) => (
                    <li key={index} className="participant-item">
                      <div className="participant-info">
                        <span className="participant-name">{p.name}</span>
                        <span className="participant-email">{p.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeParticipant(p.email)}
                        className="remove-button"
                        aria-label="Remove participant"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/meetings")}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Creating..." : "Create Meeting"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// Helper function to calculate duration between two dates
const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const diff = end - start;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let result = "";
  if (hours > 0) {
    result += `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  if (minutes > 0 || hours === 0) {
    if (hours > 0) result += " ";
    result += `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  return result;
};

export default CreateMeetingPage;
