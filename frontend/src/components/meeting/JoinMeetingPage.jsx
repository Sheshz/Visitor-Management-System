import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

const JoinMeetingPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [joiningAsHost, setJoiningAsHost] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    
    if (token) {
      setIsAuthenticated(true);
      if (userRole === "host") {
        setJoiningAsHost(true);
      }
    }
    
    fetchMeetingDetails();
  }, [meetingId]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem("token");
      let headers = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/meetings/${meetingId}`,
        { headers }
      );
      
      setMeeting(response.data);
      
      // Pre-fill email if authenticated
      if (isAuthenticated && !joiningAsHost) {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          setEmail(userEmail);
        }
      }
    } catch (err) {
      console.error("Error fetching meeting details:", err);
      setError("Failed to load meeting details. Please check the meeting ID.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      let payload = {};
      let headers = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        // If not authenticated, require email and access code
        if (!email.trim() || !accessCode.trim()) {
          setError("Email and access code are required");
          return;
        }
        
        payload = { email, accessCode };
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/meetings/${meetingId}/join`,
        payload,
        { headers }
      );
      
      // Navigate to meeting room after successful join
      navigate(`/meeting-room/${meetingId}`);
    } catch (err) {
      console.error("Error joining meeting:", err);
      setError(
        err.response?.data?.message || 
        "Failed to join meeting. Please check your credentials."
      );
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy h:mm a");
  };

  if (loading) {
    return <div className="join-meeting-loading">Loading meeting details...</div>;
  }

  if (error) {
    return (
      <div className="join-meeting-error-container">
        <div className="join-meeting-error">{error}</div>
        <button 
          className="join-meeting-back-btn"
          onClick={() => navigate("/meetings")}
        >
          Back to Meetings
        </button>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="join-meeting-error-container">
        <div className="join-meeting-error">Meeting not found</div>
        <button 
          className="join-meeting-back-btn"
          onClick={() => navigate("/meetings")}
        >
          Back to Meetings
        </button>
      </div>
    );
  }

  return (
    <div className="join-meeting-container">
      <div className="join-meeting-card">
        <div className="join-meeting-header">
          <h1>Join Meeting</h1>
          {meeting.status !== "active" && (
            <div className="join-meeting-status">
              This meeting is {meeting.status} and cannot be joined at the moment.
            </div>
          )}
        </div>

        <div className="join-meeting-details">
          <h2>{meeting.title}</h2>
          {meeting.description && (
            <p className="join-meeting-description">{meeting.description}</p>
          )}
          
          <div className="join-meeting-info">
            <div className="join-meeting-info-item">
              <span className="join-meeting-info-label">Host:</span>
              <span>{meeting.host?.name || "Unknown Host"}</span>
            </div>
            <div className="join-meeting-info-item">
              <span className="join-meeting-info-label">Start Time:</span>
              <span>{formatDateTime(meeting.startTime)}</span>
            </div>
            <div className="join-meeting-info-item">
              <span className="join-meeting-info-label">Status:</span>
              <span className={`meeting-status ${meeting.status}`}>
                {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {meeting.status === "active" ? (
          <form onSubmit={handleJoinMeeting} className="join-meeting-form">
            {error && <div className="join-meeting-form-error">{error}</div>}
            
            {!isAuthenticated && (
              <>
                <div className="join-meeting-form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="join-meeting-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="join-meeting-form-group">
                  <label htmlFor="accessCode">Access Code</label>
                  <input
                    type="text"
                    id="accessCode"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="join-meeting-input"
                    placeholder="Enter your access code"
                    required
                  />
                </div>
              </>
            )}
            
            {meeting.password && !joiningAsHost && (
              <div className="join-meeting-form-group">
                <label htmlFor="password">Meeting Password</label>
                <input
                  type="password"
                  id="password"
                  className="join-meeting-input"
                  placeholder="Enter meeting password"
                  required
                />
              </div>
            )}
            
            <div className="join-meeting-actions">
              <button 
                type="button" 
                onClick={() => navigate("/meetings")}
                className="join-meeting-cancel-btn"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="join-meeting-submit-btn"
              >
                Join Now
              </button>
            </div>
          </form>
        ) : (
          <div className="join-meeting-inactive">
            <p>
              {meeting.status === "scheduled" 
                ? "This meeting hasn't started yet. Please wait for the host to start the meeting."
                : meeting.status === "completed"
                ? "This meeting has ended."
                : "This meeting has been cancelled."}
            </p>
            <button
              onClick={() => navigate("/meetings")}
              className="join-meeting-back-btn"
            >
              Back to Meetings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinMeetingPage;