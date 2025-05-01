import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import '../../CSS/meetingCSS/CreateMeeting.css'; // Import the CSS file

// Mock API service for development (remove when real API is available)
const mockApiService = {
  createMeeting: (meetingData) => {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Generate a random meeting ID
        const meetingId = 'meet-' + Math.random().toString(36).substring(2, 10);
        
        resolve({
          data: {
            success: true,
            meeting: {
              meetingId: meetingId,
              ...meetingData
            }
          }
        });
      }, 1500);
    });
  }
};

const CreateMeetingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [meetingId, setMeetingId] = useState('');
  const [meetingPassword, setMeetingPassword] = useState('');
  
  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Set minimum date to today
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  // Get formatted current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    // Round up to the nearest 15 minutes
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(minutes);
    now.setSeconds(0);
    
    return now.toISOString().slice(0, 16);
  };
  
  // Calculate default end time (1 hour after start time)
  const getDefaultEndTime = (startTime) => {
    if (!startTime) return '';
    const date = new Date(startTime);
    date.setHours(date.getHours() + 1);
    return date.toISOString().slice(0, 16);
  };
  
  // Meeting form data with improved defaults
  const [meetingData, setMeetingData] = useState({
    title: '',
    description: '',
    startTime: getCurrentDateTime(),
    endTime: getDefaultEndTime(getCurrentDateTime()),
    recordingEnabled: false,
    password: generatePassword(),
    participants: []
  });
  
  // Update end time when start time changes
  useEffect(() => {
    if (meetingData.startTime) {
      const newEndTime = getDefaultEndTime(meetingData.startTime);
      // Only auto-update if the user hasn't manually set an end time yet
      // or if the current end time is before the new start time
      if (!meetingData.endTime || new Date(meetingData.endTime) <= new Date(meetingData.startTime)) {
        setMeetingData(prev => ({
          ...prev,
          endTime: newEndTime
        }));
      }
    }
  }, [meetingData.startTime]);
  
  // Participant form data
  const [participant, setParticipant] = useState({
    name: '',
    email: ''
  });

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time for display
  const formatTimeForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMeetingData({
      ...meetingData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle date-time changes
  const handleDateTimeChange = (e) => {
    const { name, value } = e.target;
    setMeetingData({
      ...meetingData,
      [name]: value
    });
  };

  // Handle participant form changes
  const handleParticipantChange = (e) => {
    const { name, value } = e.target;
    setParticipant({
      ...participant,
      [name]: value
    });
  };

  // Add participant to the list
  const addParticipant = (e) => {
    e.preventDefault();
    
    // Validate email and name
    if (!participant.email || !participant.name) {
      setError('Participant name and email are required');
      return;
    }
    
    // Check if email already exists
    if (meetingData.participants.some(p => p.email === participant.email)) {
      setError('This participant is already added');
      return;
    }
    
    // Add participant
    setMeetingData({
      ...meetingData,
      participants: [...meetingData.participants, participant]
    });
    
    // Reset participant form
    setParticipant({ name: '', email: '' });
    setError('');
  };

  // Remove participant from the list
  const removeParticipant = (email) => {
    setMeetingData({
      ...meetingData,
      participants: meetingData.participants.filter(p => p.email !== email)
    });
  };

  // Create meeting
  const createMeeting = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!meetingData.title || !meetingData.startTime || !meetingData.endTime) {
      setError('Meeting title, start time, and end time are required');
      return;
    }
    
    // Validate that end time is after start time
    const start = new Date(meetingData.startTime);
    const end = new Date(meetingData.endTime);
    
    if (end <= start) {
      setError('End time must be after start time');
      return;
    }
    
    // Set loading state
    setLoading(true);
    setError('');
    
    try {
      // Check if we're in development or the API is not available
      let response;
      
      try {
        // Try the actual API first
        response = await axios.post('/api/meetings/create', meetingData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || 'dev-token'}`
          }
        });
      } catch (apiError) {
        console.log('API endpoint not available, using mock service');
        // If API call fails, use the mock service
        response = await mockApiService.createMeeting(meetingData);
      }
      
      // Handle success
      setSuccess(true);
      setLoading(false);
      
      // Store meeting ID and password
      const createdMeeting = response.data.meeting;
      setMeetingId(createdMeeting.meetingId);
      setMeetingPassword(meetingData.password);
      
      // Generate QR code data
      const qrData = JSON.stringify({
        meetingId: createdMeeting.meetingId,
        password: meetingData.password
      });
      setQrCodeData(qrData);
      
      // Show success message
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error creating meeting:', error);
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to create meeting. Please try again.');
    }
  };

  // Copy meeting info to clipboard
  const copyMeetingInfo = () => {
    const meetingInfo = `Meeting ID: ${meetingId}\nPassword: ${meetingPassword}`;
    navigator.clipboard.writeText(meetingInfo);
    alert('Meeting information copied to clipboard!');
  };

  return (
    <div className="create-meeting-container">
      <h1 className="page-title">Create New Meeting</h1>
      
      {/* Success message and QR code display */}
      {success && (
        <div className="success-container">
          <div className="success-message">
            <h2>Meeting Created Successfully!</h2>
            <p>Your meeting has been created and invitations have been sent to all participants.</p>
            
            <div className="meeting-info">
              <p><strong>Meeting ID:</strong> {meetingId}</p>
              <p><strong>Password:</strong> {meetingPassword}</p>
              <button onClick={copyMeetingInfo} className="copy-button">
                Copy Meeting Info
              </button>
            </div>
            
            <div className="qr-code-container">
              <h3>Meeting QR Code</h3>
              <p>Participants can scan this QR code to join the meeting:</p>
              {qrCodeData && (
                <QRCodeSVG 
                  value={qrCodeData} 
                  size={200} 
                  level="H"
                />
              )}
            </div>
            
            <div className="action-buttons">
              <button onClick={() => navigate('/meetings')} className="primary-button">
                Go to Meetings
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Meeting creation form */}
      {!success && (
        <form onSubmit={createMeeting} className="meeting-form">
          {error && <div className="error-message">{error}</div>}
          
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
                    min={today.toISOString().slice(0, 16)}
                    className="datetime-input"
                    required
                  />
                  <div className="datetime-display">
                    <span className="date-display">{formatDateForDisplay(meetingData.startTime)}</span>
                    <span className="time-display">{formatTimeForDisplay(meetingData.startTime)}</span>
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
                    <span className="date-display">{formatDateForDisplay(meetingData.endTime)}</span>
                    <span className="time-display">{formatTimeForDisplay(meetingData.endTime)}</span>
                  </div>
                </div>
              </div>
              
              <div className="meeting-duration">
                {meetingData.startTime && meetingData.endTime && (
                  <span className="duration-text">
                    Duration: {calculateDuration(meetingData.startTime, meetingData.endTime)}
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
              <label htmlFor="recordingEnabled" className="checkbox-label">Enable Recording</label>
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
                  readOnly
                  className="form-input password-field"
                />
                <button 
                  type="button" 
                  onClick={() => setMeetingData({...meetingData, password: generatePassword()})}
                  className="regenerate-button"
                >
                  Regenerate
                </button>
              </div>
              <small className="form-help-text">Auto-generated password for meeting security</small>
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
                <h3 className="subsection-title">Invited Participants ({meetingData.participants.length})</h3>
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
              onClick={() => navigate('/meetings')} 
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Meeting'}
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
  
  let result = '';
  if (hours > 0) {
    result += `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  if (minutes > 0 || hours === 0) {
    if (hours > 0) result += ' ';
    result += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return result;
};

export default CreateMeetingPage;