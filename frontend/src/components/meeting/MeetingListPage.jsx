import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

const MeetingListPage = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [userType, setUserType] = useState("host"); // Default to host view
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole) {
      setUserType(userRole === "host" ? "host" : "user");
    }
    fetchMeetings();
  }, [filter, userType]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Determine endpoint based on user type
      const endpoint = userType === "host" 
        ? "/api/meetings/host" 
        : "/api/meetings/user";
      
      // Add filter parameters
      let url = `${process.env.REACT_APP_API_URL}${endpoint}`;
      
      if (filter !== "all") {
        const today = new Date();
        
        if (filter === "upcoming") {
          url += `?status=scheduled&startDate=${today.toISOString()}`;
        } else if (filter === "past") {
          url += `?status=completed`;
        } else if (filter === "active") {
          url += `?status=active`;
        } else if (filter === "cancelled") {
          url += `?status=cancelled`;
        }
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setMeetings(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setError("Failed to load meetings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartMeeting = async (meetingId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
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
      setError(err.response?.data?.message || "Failed to start meeting");
    }
  };

  const handleJoinMeeting = (meetingId) => {
    navigate(`/join-meeting/${meetingId}`);
  };

  const handleEndMeeting = async (meetingId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/meetings/${meetingId}/end`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh meetings list
      fetchMeetings();
    } catch (err) {
      console.error("Error ending meeting:", err);
      setError(err.response?.data?.message || "Failed to end meeting");
    }
  };

  const handleCancelMeeting = async (meetingId) => {
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
      
      // Refresh meetings list
      fetchMeetings();
    } catch (err) {
      console.error("Error cancelling meeting:", err);
      setError(err.response?.data?.message || "Failed to cancel meeting");
    }
  };

  const handleEditMeeting = (meetingId) => {
    navigate(`/edit-meeting/${meetingId}`);
  };

  const handleViewDetails = (meetingId) => {
    navigate(`/meeting-details/${meetingId}`);
  };

  const handleRespondToInvitation = async (meetingId, response) => {
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
      
      // Refresh meetings list
      fetchMeetings();
    } catch (err) {
      console.error(`Error responding to invitation:`, err);
      setError(
        err.response?.data?.message || "Failed to respond to invitation"
      );
    }
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy h:mm a");
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min` 
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <div className="meeting-list-container">
      <div className="meeting-list-header">
        <h1>My Meetings</h1>
        {userType === "host" && (
          <button
            className="meeting-list-create-btn"
            onClick={() => navigate("/create-meeting")}
          >
            Create Meeting
          </button>
        )}
      </div>

      {error && <div className="meeting-list-error">{error}</div>}

      <div className="meeting-list-filters">
        <button
          className={`meeting-list-filter-btn ${filter === "upcoming" ? "active" : ""}`}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`meeting-list-filter-btn ${filter === "active" ? "active" : ""}`}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={`meeting-list-filter-btn ${filter === "past" ? "active" : ""}`}
          onClick={() => setFilter("past")}
        >
          Past
        </button>
        <button
          className={`meeting-list-filter-btn ${filter === "cancelled" ? "active" : ""}`}
          onClick={() => setFilter("cancelled")}
        >
          Cancelled
        </button>
        <button
          className={`meeting-list-filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="meeting-list-loading">Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="meeting-list-empty">
          <p>No meetings found.</p>
          {userType === "host" && (
            <button
              className="meeting-list-create-btn"
              onClick={() => navigate("/create-meeting")}
            >
              Create Your First Meeting
            </button>
          )}
        </div>
      ) : (
        <div className="meeting-list">
          {meetings.map((meeting) => (
            <div key={meeting._id} className="meeting-card">
              <div className="meeting-card-header">
                <h3>{meeting.title}</h3>
                <span 
                  className={`meeting-status ${getStatusClass(meeting.status)}`}
                >
                  {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                </span>
              </div>

              <div className="meeting-card-details">
                <div className="meeting-time-info">
                  <div className="meeting-detail-item">
                    <span className="meeting-detail-label">Start:</span>
                    <span>{formatDateTime(meeting.startTime)}</span>
                  </div>
                  <div className="meeting-detail-item">
                    <span className="meeting-detail-label">Duration:</span>
                    <span>{formatDuration(meeting.duration)}</span>
                  </div>
                </div>

                <div className="meeting-participants-info">
                  <span className="meeting-detail-label">Participants:</span>
                  <span>{meeting.participants.length}</span>
                </div>

                {userType === "user" && meeting.host && (
                  <div className="meeting-host-info">
                    <span className="meeting-detail-label">Host:</span>
                    <span>{meeting.host.name}</span>
                  </div>
                )}
              </div>

              <div className="meeting-card-actions">
                {userType === "host" ? (
                  <>
                    {meeting.status === "scheduled" && (
                      <>
                        <button
                          className="meeting-action-btn start-btn"
                          onClick={() => handleStartMeeting(meeting._id)}
                        >
                          Start Meeting
                        </button>
                        <button
                          className="meeting-action-btn edit-btn"
                          onClick={() => handleEditMeeting(meeting._id)}
                        >
                          Edit
                        </button>
                        <button
                          className="meeting-action-btn cancel-btn"
                          onClick={() => handleCancelMeeting(meeting._id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {meeting.status === "active" && (
                      <>
                        <button
                          className="meeting-action-btn join-btn"
                          onClick={() => navigate(`/meeting-room/${meeting._id}`)}
                        >
                          Join Meeting
                        </button>
                        <button
                          className="meeting-action-btn end-btn"
                          onClick={() => handleEndMeeting(meeting._id)}
                        >
                          End Meeting
                        </button>
                      </>
                    )}
                    {(meeting.status === "completed" || meeting.status === "cancelled") && (
                      <button
                        className="meeting-action-btn view-btn"
                        onClick={() => handleViewDetails(meeting._id)}
                      >
                        View Details
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {meeting.status === "active" && (
                      <button
                        className="meeting-action-btn join-btn"
                        onClick={() => handleJoinMeeting(meeting._id)}
                      >
                        Join Meeting
                      </button>
                    )}
                    {meeting.status === "scheduled" && (
                      <>
                        {meeting.participants.find(
                          p => p.user === localStorage.getItem("userId") && p.status === "pending"
                        ) && (
                          <div className="meeting-response-btns">
                            <button
                              className="meeting-action-btn accept-btn"
                              onClick={() => handleRespondToInvitation(meeting._id, "accepted")}
                            >
                              Accept
                            </button>
                            <button
                              className="meeting-action-btn decline-btn"
                              onClick={() => handleRespondToInvitation(meeting._id, "declined")}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                        {meeting.participants.find(
                          p => p.user === localStorage.getItem("userId") && p.status === "accepted"
                        ) && (
                          <span className="meeting-response-status">
                            You have accepted this meeting
                          </span>
                        )}
                      </>
                    )}
                    <button
                      className="meeting-action-btn view-btn"
                      onClick={() => handleViewDetails(meeting._id)}
                    >
                      View Details
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingListPage;