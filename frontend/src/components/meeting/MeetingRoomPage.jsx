import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhone, FaUser, FaUsers, FaComment, FaPaperclip } from 'react-icons/fa';
import api from '../../utils/apiClient';
import '../../CSS/meetingCSS/MeetingRoom.css';

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/meetings/${meetingId}`);
        setMeeting(response.data);
        setParticipants(response.data.participants || []);
      } catch (err) {
        console.error('Error fetching meeting:', err);
        setError('Failed to join meeting. Please check your access code.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingDetails();
  }, [meetingId]);

  useEffect(() => {
    // Scroll to bottom of messages when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: 'You', timestamp: new Date() }]);
      setNewMessage('');
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    // In a real app, you would toggle the video stream here
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    // In a real app, you would toggle the audio stream here
  };

  const endMeeting = async () => {
    try {
      await api.put(`/api/meetings/${meetingId}/end`);
      navigate('/appointments', { state: { message: 'Meeting ended successfully' } });
    } catch (err) {
      console.error('Error ending meeting:', err);
      setError('Failed to end meeting');
    }
  };

  if (loading) {
    return (
      <div className="meeting-loading">
        <div className="spinner"></div>
        <p>Joining meeting...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="meeting-error">
        <p>{error}</p>
        <button onClick={() => navigate('/appointments')}>Back to Appointments</button>
      </div>
    );
  }

  return (
    <div className="meeting-room-container">
      <div className="meeting-header">
        <h2>{meeting?.title || 'Meeting'}</h2>
        <div className="meeting-time">
          {meeting?.startTime && new Date(meeting.startTime).toLocaleTimeString()}
        </div>
      </div>

      <div className="meeting-content">
        <div className="video-container">
          <div className="main-video">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={videoEnabled ? '' : 'video-disabled'}
            />
            {!videoEnabled && (
              <div className="video-placeholder">
                <FaUser size={48} />
              </div>
            )}
            <div className="video-controls">
              <button 
                className={`control-button ${videoEnabled ? 'active' : ''}`}
                onClick={toggleVideo}
              >
                {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
              </button>
              <button 
                className={`control-button ${audioEnabled ? 'active' : ''}`}
                onClick={toggleAudio}
              >
                {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </button>
              <button 
                className="control-button end-call"
                onClick={endMeeting}
              >
                <FaPhone />
              </button>
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-tabs">
            <button 
              className={`tab-button ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
            >
              <FaUsers /> Participants
            </button>
            <button 
              className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <FaComment /> Chat
            </button>
          </div>

          <div className="sidebar-content">
            {activeTab === 'participants' ? (
              <div className="participants-list">
                <h3>Participants ({participants.length})</h3>
                <ul>
                  {participants.map((participant, index) => (
                    <li key={index}>
                      <div className="participant-avatar">
                        <FaUser />
                      </div>
                      <div className="participant-info">
                        <span className="participant-name">{participant.name}</span>
                        <span className="participant-status">{participant.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="chat-container">
                <div className="chat-messages">
                  {messages.length === 0 ? (
                    <p className="no-messages">No messages yet</p>
                  ) : (
                    messages.map((message, index) => (
                      <div key={index} className="message">
                        <div className="message-sender">{message.sender}</div>
                        <div className="message-text">{message.text}</div>
                        <div className="message-time">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="chat-input">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="attachment-button">
                    <FaPaperclip />
                  </button>
                  <button 
                    className="send-button"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;