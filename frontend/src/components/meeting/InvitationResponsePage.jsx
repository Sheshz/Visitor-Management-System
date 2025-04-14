import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const InvitationResponsePage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [responseStatus, setResponseStatus] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
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
      
      // If user has already responded, pre-populate the form
      if (response.data.participants) {
        const currentUserId = localStorage.getItem("userId");
        const userParticipant = response.data.participants.find(
          p => p.userId === currentUserId
        );
        
        if (userParticipant) {
          setResponseStatus(userParticipant.status || "");
          setComment(userParticipant.comment || "");
        }
      }
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

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    
    if (!responseStatus) {
      setError("Please select a response (Accepted or Declined)");
      return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/meetings/${meetingId}/respond`,
        {
          status: responseStatus,
          comment: comment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess(true);
      
      // Auto-redirect after success
      setTimeout(() => {
        navigate("/meetings");
      }, 3000);
    } catch (err) {
      console.error("Error submitting response:", err);
      setError(
        err.response?.data?.message || 
        "Failed to submit your response. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : ''}`;
    }
  };

  const isMeetingPast = (endTime) => {
    return new Date(endTime) < new Date();
  };

  if (loading) {
    return (
      <div className="invitation-response-page loading">
        <div className="container">
          <div className="loading-spinner">Loading meeting details...</div>
        </div>
      </div>
    );
  }

  if (error && !meeting) {
    return (
      <div className="invitation-response-page error">
        <div className="container">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <div className="buttons">
              <Link to="/meetings" className="btn btn-primary">Back to Meetings</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="invitation-response-page success">
        <div className="container">
          <div className="success-container">
            <h2>Response Submitted</h2>
            <p>Your response has been successfully submitted.</p>
            <p>You will be redirected to your meetings page in a few seconds...</p>
            <div className="buttons">
              <Link to="/meetings" className="btn btn-primary">Back to Meetings</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (meeting && isMeetingPast(meeting.endTime)) {
    return (
      <div className="invitation-response-page past-meeting">
        <div className="container">
          <div className="past-meeting-container">
            <h2>Meeting Has Ended</h2>
            <p>This meeting has already taken place or been cancelled.</p>
            <div className="meeting-details">
              <h3>{meeting.title}</h3>
              <p className="meeting-time">
                {formatDateTime(meeting.startTime)}
              </p>
            </div>
            <div className="buttons">
              <Link to="/meetings" className="btn btn-primary">Back to Meetings</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invitation-response-page">
      <div className="container">
        <div className="invitation-card">
          <div className="meeting-header">
            <h2>Meeting Invitation</h2>
            {meeting.status === "cancelled" && (
              <div className="cancelled-badge">Cancelled</div>
            )}
          </div>
          
          <div className="meeting-details">
            <h3>{meeting.title}</h3>
            <p className="meeting-description">{meeting.description}</p>
            
            <div className="detail-item">
              <span className="label">Organized by:</span>
              <span className="value">{meeting.host?.name || "Unknown Host"}</span>
            </div>
            
            <div className="detail-item">
              <span className="label">Start Time:</span>
              <span className="value">{formatDateTime(meeting.startTime)}</span>
            </div>
            
            <div className="detail-item">
              <span className="label">End Time:</span>
              <span className="value">{formatDateTime(meeting.endTime)}</span>
            </div>
            
            <div className="detail-item">
              <span className="label">Duration:</span>
              <span className="value">{calculateDuration(meeting.startTime, meeting.endTime)}</span>
            </div>
            
            {meeting.location && (
              <div className="detail-item">
                <span className="label">Location:</span>
                <span className="value">{meeting.location}</span>
              </div>
            )}
            
            {meeting.agenda && (
              <div className="agenda-section">
                <h4>Agenda</h4>
                <p>{meeting.agenda}</p>
              </div>
            )}
          </div>
          
          {meeting.status !== "cancelled" && (
            <form className="response-form" onSubmit={handleSubmitResponse}>
              <h4>Your Response</h4>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <div className="response-options">
                <div className="response-option">
                  <input
                    type="radio"
                    id="accept"
                    name="response"
                    value="accepted"
                    checked={responseStatus === "accepted"}
                    onChange={() => setResponseStatus("accepted")}
                  />
                  <label htmlFor="accept">Accept</label>
                </div>
                
                <div className="response-option">
                  <input
                    type="radio"
                    id="decline"
                    name="response"
                    value="declined"
                    checked={responseStatus === "declined"}
                    onChange={() => setResponseStatus("declined")}
                  />
                  <label htmlFor="decline">Decline</label>
                </div>
                
                <div className="response-option">
                  <input
                    type="radio"
                    id="tentative"
                    name="response"
                    value="tentative"
                    checked={responseStatus === "tentative"}
                    onChange={() => setResponseStatus("tentative")}
                  />
                  <label htmlFor="tentative">Maybe</label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="comment">Add a comment (optional):</label>
                <textarea
                  id="comment"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add any comments or notes about your attendance..."
                ></textarea>
              </div>
              
              <div className="form-buttons">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/meetings")}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Response"}
                </button>
              </div>
            </form>
          )}
          
          {meeting.status === "cancelled" && (
            <div className="cancelled-message">
              <p>This meeting has been cancelled by the organizer.</p>
              <Link to="/meetings" className="btn btn-primary">Back to Meetings</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationResponsePage;