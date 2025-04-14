import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

const MeetingDetailPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  
  const [meeting, setMeeting] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
    fetchMeetingDetails();
  }, [meetingId]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/meetings/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setMeeting(response.data);
    } catch (err) {
      console.error("Error fetching meeting details:", err);
      setError(
        err.response?.data?.message || 
        "Failed to load meeting details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartMeeting = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/meetings/${meetingId}/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Navigate to meeting room
      navigate(`/meeting-room/${meetingId}`);
    } catch (err) {
      console.error("Error starting meeting:", err);
      setError(
        err.response?.data?.message || 
        "Failed to start meeting. Please try again."
      );
    }
  };

  const handleEditMeeting = () => {
    navigate(`/edit-meeting/${meetingId}`);
  };

  const handleCancelMeeting = async () => {
    if (!window.confirm("Are you sure you want to cancel this meeting?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/meetings/${meetingId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      fetchMeetingDetails();
    } catch (err) {
      console.error("Error cancelling meeting:", err);
      setError(
        err.response?.data?.message || 
        "Failed to cancel meeting. Please try again."
      );
    }
  };

  const handleJoinMeeting = () => {
    navigate(`/join-meeting/${meetingId}`);
  };

  const handleAddParticipants = () => {
    navigate(`/add-participants/${meetingId}`);
  };

  const copyMeetingInvitation = () => {
    const meetingUrl = `${window.location.origin}/join-meeting/${meetingId}`;
    const invitationText = `
You are invited to join a meeting: "${meeting.title}"
Date: ${formatDateTime(meeting.startTime)}
Duration: ${formatDuration(meeting.duration)}
Meeting link: ${meetingUrl}
Meeting ID: ${meeting.meetingId}
    `.trim();
    
    navigator.clipboard.writeText(invitationText)
      .then(() => {
        setCopySuccess("Invitation copied to clipboard!");
        setTimeout(() => setCopySuccess(""), 3000);
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        setCopySuccess("Failed to copy. Please try again.");
      });
  };

  const handleRespondToInvitation = async (response) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/meetings/${meetingId}/respond`,
        { response },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      fetchMeetingDetails();
    } catch (err) {
      console.error("Error responding to invitation:", err);
      setError(
        err.response?.data?.message || 
        "Failed to respond to invitation. Please try again."
      );
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy 'at' h:mm a");
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min` 
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "scheduled":
        return "meeting-status-scheduled";
      case "active":
        return "meeting-status-active";
      case "completed":
        return "meeting-status-completed";
      case "cancelled":
        return "meeting-status-cancelled";
      default:
        return "";
    }
  };

  const getUserParticipantStatus = () => {
    if (!meeting || !meeting.participants) return null;
    
    const userId = localStorage.getItem("userId");
    const participant = meeting.participants.find(p => p.user === userId);
    
    return participant ? participant.status : null;
  };

  if (loading) {
    return <div className="meeting-detail-loading">Loading meeting details...</div>;
  }

  if (error) {
    return (
      <div className="meeting-detail-error-container">
        <div className="meeting-detail-error">{error}</div>
        <button 
          className="meeting-detail-back-btn"
          onClick={() => navigate("/meetings")}
        >
          Back to Meetings
        </button>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="meeting-detail-error-container">
        <div className="meeting-detail-error">Meeting not found</div>
        <button 
          className="meeting-detail-back-btn"
          onClick={() => navigate("/meetings")}
        >
          Back to Meetings
        </button>
      </div>
    );
  }

  return (
    <div className="meeting-detail-container">
      <div className="meeting-detail-header">
        <h1>{meeting.title}</h1>
        <div className="meeting-detail-status-container">
          <span className={`meeting-status ${getStatusClass(meeting.status)}`}>
            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="meeting-detail-content">
        <div className="meeting-detail-section">
          <h2>Meeting Information</h2>
          <div className="meeting-detail-info">
            <div className="meeting-detail-row">
              <span className="meeting-detail-label">Meeting ID:</span>
              <span>{meeting.meetingId}</span>
            </div>
            <div className="meeting-detail-row">
              <span className="meeting-detail-label">Host:</span>
              <span>{meeting.host?.name || "Unknown Host"}</span>
            </div>
            <div className="meeting-detail-row">
              <span className="meeting-detail-label">Start Time:</span>
              <span>{formatDateTime(meeting.startTime)}</span>
            </div>
            <div className="meeting-detail-row">
              <span className="meeting-detail-label">End Time:</span>
              <span>{formatDateTime(meeting.endTime)}</span>
            </div>
            <div className="meeting-detail-row">
              <span className="meeting-detail-label">Duration:</span>
              <span>{formatDuration(meeting.duration)}</span>
            </div>
            {meeting.description && (
              <div className="meeting-detail-row meeting-description">
                <span className="meeting-detail-label">Description:</span>
                <p>{meeting.description}</p>
              </div>
            )}
            <div className="meeting-detail-row">
              <span className="meeting-detail-label">Recording:</span>
              <span>{meeting.recordingEnabled ? "Enabled" : "Disabled"}</span>
            </div>
            {meeting.recordingUrl && (
              <div className="meeting-detail-row">
                <span className="meeting-detail-label">Recording:</span>
                <a href={meeting.recordingUrl} target="_blank" rel="noopener noreferrer">
                  View Recording
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="meeting-detail-section">
          <h2>Participants ({meeting.participants.length})</h2>
          <div className="meeting-participants-list">
            {meeting.participants.map((participant, index) => (
              <div key={index} className="meeting-participant-item">
                <div className="participant-info">
                  <span className="participant-name">
                    {participant.name || "Unnamed"}
                  </span>
                  <span className="participant-email">{participant.email}</span>
                </div>
                <div className="participant-status">
                  <span className={`participant-status-badge status-${participant.status}`}>
                    {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="meeting-detail-actions">
        {userRole === "host" ? (
          <>
            {meeting.status === "scheduled" && (
              <>
                <button 
                  className="meeting-detail-action-btn start-btn"
                  onClick={handleStartMeeting}
                >
                  Start Meeting
                </button>
                <button 
                  className="meeting-detail-action-btn edit-btn"
                  onClick={handleEditMeeting}
                >
                  Edit Meeting
                </button>
                <button 
                  className="meeting-detail-action-btn add-btn"
                  onClick={handleAddParticipants}
                >
                  Add Participants
                </button>
                <button 
                  className="meeting-detail-action-btn copy-btn"
                  onClick={copyMeetingInvitation}
                >
                  Copy Invitation
                </button>
                <button 
                  className="meeting-detail-action-btn cancel-btn"
                  onClick={handleCancelMeeting}
                >
                  Cancel Meeting
                </button>
              </>
            )}
            {meeting.status === "active" && (
              <button 
                className="meeting-detail-action-btn join-btn"
                onClick={() => navigate(`/meeting-room/${meetingId}`)}
              >
                Join Meeting
              </button>
            )}
          </>
        ) : (
          <>
            {meeting.status === "active" && (
              <button 
                className="meeting-detail-action-btn join-btn"
                onClick={handleJoinMeeting}
              >
                Join Meeting
              </button>
            )}
            {meeting.status === "scheduled" && getUserParticipantStatus() === "pending" && (
              <div className="meeting-response-btns">
                <button
                  className="meeting-detail-action-btn accept-btn"
                  onClick={() => handleRespondToInvitation("accepted")}
                >
                  Accept
                </button>
                <button
                  className="meeting-detail-action-btn decline-btn"
                  onClick={() => handleRespondToInvitation("declined")}
                >
                  Decline
                </button>
              </div>
            )}
          </>
        )}
        {copySuccess && (
          <div className="copy-success-notification">{copySuccess}</div>
        )}
        <button 
          className="meeting-detail-action-btn back-btn"
          onClick={() => navigate("/meetings")}
        >
          Back to Meetings
        </button>
      </div>
    </div>
  );
};

export default MeetingDetailPage;