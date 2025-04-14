import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { io } from "socket.io-client";

const MeetingRoomPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const chatContainerRef = useRef(null);

  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [privateMessageTo, setPrivateMessageTo] = useState(null);
  const [leavingMeeting, setLeavingMeeting] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
    
    setUserRole(role);
    setCurrentUser({
      id: userId,
      name: username || "You",
      role: role
    });
    
    fetchMeetingDetails();
    setupSocketConnection();
    initializeMedia();

    return () => {
      // Clean up on unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      cleanupPeerConnections();
    };
  }, [meetingId]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

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
      
      // Fetch chat messages
      const chatResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/meetings/${meetingId}/chat`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setChatMessages(chatResponse.data);
    } catch (err) {
      console.error("Error fetching meeting details:", err);
      setError(
        err.response?.data?.message || 
        "Failed to join meeting room. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const setupSocketConnection = () => {
    const token = localStorage.getItem("token");
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL, {
      auth: {
        token
      },
      query: {
        meetingId
      }
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to meeting server");
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from meeting server");
    });

    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
      setError("Connection error. Please try joining again.");
    });

    socketRef.current.on("participant-joined", (participant) => {
      // Update participants list
      setParticipants(prev => [...prev, participant]);
      
      // Create peer connection for new participant
      createPeerConnection(participant.id);
    });

    socketRef.current.on("participant-left", (participantId) => {
      // Remove participant from list
      setParticipants(prev => 
        prev.filter(p => p.id !== participantId)
      );
      
      // Clean up peer connection
      if (peerConnectionsRef.current[participantId]) {
        peerConnectionsRef.current[participantId].close();
        delete peerConnectionsRef.current[participantId];
      }
    });

    socketRef.current.on("participants-list", (participantsList) => {
      setParticipants(participantsList);
      
      // Create peer connections for all participants
      participantsList.forEach(participant => {
        if (participant.id !== socketRef.current.id) {
          createPeerConnection(participant.id);
        }
      });
    });

    socketRef.current.on("meeting-ended", () => {
      alert("The meeting has been ended by the host.");
      navigate("/meetings");
    });

    socketRef.current.on("offer", async ({ from, offer }) => {
      try {
        if (!peerConnectionsRef.current[from]) {
          createPeerConnection(from);
        }
        
        await peerConnectionsRef.current[from].setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        
        const answer = await peerConnectionsRef.current[from].createAnswer();
        await peerConnectionsRef.current[from].setLocalDescription(answer);
        
        socketRef.current.emit("answer", {
          to: from,
          answer
        });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    socketRef.current.on("answer", async ({ from, answer }) => {
      try {
        if (peerConnectionsRef.current[from]) {
          await peerConnectionsRef.current[from].setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        }
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    });

    socketRef.current.on("ice-candidate", async ({ from, candidate }) => {
      try {
        if (peerConnectionsRef.current[from]) {
          await peerConnectionsRef.current[from].addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } catch (err) {
        console.error("Error adding ice candidate:", err);
      }
    });

    socketRef.current.on("new-message", (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    socketRef.current.on("active-speaker-changed", (speakerId) => {
      setActiveSpeaker(speakerId);
    });

    socketRef.current.on("recording-started", () => {
      setRecording(true);
    });

    socketRef.current.on("recording-stopped", (recordingUrl) => {
      setRecording(false);
      
      // Update meeting with recording URL if provided
      if (recordingUrl) {
        setMeeting(prev => ({
          ...prev,
          recordingUrl
        }));
      }
    });
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // If socket is connected, notify others that we've joined with media
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("media-ready");
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError("Could not access camera or microphone. Please check permissions.");
    }
  };

  const createPeerConnection = (participantId) => {
    try {
      // Skip if connection already exists
      if (peerConnectionsRef.current[participantId]) return;
      
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ]
      });
      
      // Add local tracks to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
      }
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("ice-candidate", {
            to: participantId,
            candidate: event.candidate
          });
        }
      };
      
      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        // Update participants list with remote stream
        setParticipants(prevParticipants => {
          return prevParticipants.map(p => {
            if (p.id === participantId) {
              return { ...p, stream: event.streams[0] };
            }
            return p;
          });
        });
      };
      
      // Create and send offer
      peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
          socketRef.current.emit("offer", {
            to: participantId,
            offer: peerConnection.localDescription
          });
        })
        .catch(err => {
          console.error("Error creating offer:", err);
        });
      
      peerConnectionsRef.current[participantId] = peerConnection;
    } catch (err) {
      console.error("Error creating peer connection:", err);
    }
  };

  const cleanupPeerConnections = () => {
    Object.values(peerConnectionsRef.current).forEach(connection => {
      if (connection) {
        connection.close();
      }
    });
    peerConnectionsRef.current = {};
  };

  const handleToggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      
      setIsAudioMuted(!isAudioMuted);
      
      // Notify participants about audio state change
      socketRef.current.emit("media-state-change", {
        audio: !isAudioMuted
      });
    }
  };

  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      
      setIsVideoOff(!isVideoOff);
      
      // Notify participants about video state change
      socketRef.current.emit("media-state-change", {
        video: !isVideoOff
      });
    }
  };

  const handleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (localStreamRef.current) {
          const tracks = localStreamRef.current.getTracks();
          tracks.forEach(track => track.stop());
        }
        
        // Reinitialize camera
        await initializeMedia();
        setIsScreenSharing(false);
        
        // Notify participants screen sharing stopped
        socketRef.current.emit("screen-share-stopped");
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        // Stop current video track
        if (localStreamRef.current) {
          const videoTracks = localStreamRef.current.getVideoTracks();
          videoTracks.forEach(track => track.stop());
        }
        
        // Replace video track with screen track in all peer connections
        const screenTrack = screenStream.getVideoTracks()[0];
        
        Object.values(peerConnectionsRef.current).forEach(pc => {
          const senders = pc.getSenders();
          const videoSender = senders.find(sender => 
            sender.track && sender.track.kind === "video"
          );
          
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        });
        
        // Update local video display
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        
        // Store screen stream
        localStreamRef.current = screenStream;
        
        // Set screen sharing state
        setIsScreenSharing(true);
        
        // Notify participants screen sharing started
        socketRef.current.emit("screen-share-started");
        
        // Listen for end of screen sharing
        screenTrack.onended = async () => {
          await initializeMedia();
          setIsScreenSharing(false);
          socketRef.current.emit("screen-share-stopped");
        };
      }
    } catch (err) {
      console.error("Error during screen sharing:", err);
      setError("Failed to share screen. Please try again.");
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      const messageData = {
        message: newMessage,
        isPrivate: !!privateMessageTo,
        recipientId: privateMessageTo?.id
      };

      socketRef.current.emit("chat-message", messageData);
      
      // Add message to local chat (optimistic update)
      const newMsg = {
        sender: currentUser,
        message: newMessage,
        timestamp: new Date().toISOString(),
        isPrivate: !!privateMessageTo,
        recipient: privateMessageTo
      };
      
      setChatMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      setPrivateMessageTo(null);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  const handleToggleRecording = async () => {
    try {
      if (recording) {
        // Stop recording
        socketRef.current.emit("stop-recording");
      } else {
        // Start recording
        socketRef.current.emit("start-recording");
      }
    } catch (err) {
      console.error("Error toggling recording:", err);
      setError("Failed to toggle recording. Please try again.");
    }
  };

  const handleLeaveMeeting = async () => {
    try {
      setLeavingMeeting(true);
      
      // If host is ending the meeting
      if (userRole === "host" && window.confirm("Would you like to end the meeting for all participants?")) {
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
      } else {
        // Just leave the meeting
        const token = localStorage.getItem("token");
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/meetings/${meetingId}/leave`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
      
      // Clean up and navigate away
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      navigate("/meetings");
    } catch (err) {
      console.error("Error leaving meeting:", err);
      setError("Failed to leave meeting properly.");
      setLeavingMeeting(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };

  const renderVideoGrid = () => {
    return (
      <div className={`meeting-video-grid ${participants.length > 4 ? 'grid-small' : ''}`}>
        {/* Local video */}
        <div className={`video-container local-video ${activeSpeaker === socketRef.current?.id ? 'active-speaker' : ''}`}>
          <video
            ref={videoRef}
            muted
            autoPlay
            playsInline
            className="video-element"
          />
          <div className="video-overlay">
            <div className="participant-name">
              You {isAudioMuted && <span className="muted-indicator">🔇</span>}
            </div>
          </div>
        </div>
        
        {/* Remote videos */}
        {participants.map(participant => (
          participant.id !== socketRef.current?.id && (
            <div 
              key={participant.id} 
              className={`video-container ${activeSpeaker === participant.id ? 'active-speaker' : ''}`}
            >
              {participant.stream ? (
                <video
                  srcObject={participant.stream}
                  autoPlay
                  playsInline
                  className="video-element"
                />
              ) : (
                <div className="video-placeholder">
                  <div className="participant-initials">
                    {participant.name?.charAt(0) || "?"}
                  </div>
                </div>
              )}
              <div className="video-overlay">
                <div className="participant-name">
                  {participant.name}
                  {participant.audioMuted && <span className="muted-indicator">🔇</span>}
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    );
  };

  // Added the missing return statement with complete UI
  return (
    <div className="meeting-room-container">
      {loading ? (
        <div className="loading-container">
          <div className="loader">Loading...</div>
        </div>
      ) : error ? (
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => navigate("/meetings")}
            className="btn btn-primary"
          >
            Back to Meetings
          </button>
        </div>
      ) : (
        <>
          <div className="meeting-header">
            <div className="meeting-info">
              <h2>{meeting?.title || "Meeting Room"}</h2>
              <div className="meeting-id">ID: {meetingId}</div>
              {recording && (
                <div className="recording-indicator">
                  <span className="recording-dot"></span> Recording
                </div>
              )}
            </div>
          </div>
          
          <div className="meeting-content">
            <div className="meeting-main">
              {renderVideoGrid()}
            </div>
            
            {chatOpen && (
              <div className="meeting-sidebar">
                <div className="chat-header">
                  <h3>Chat</h3>
                  <button 
                    onClick={() => setChatOpen(false)}
                    className="close-btn"
                  >
                    ×
                  </button>
                </div>
                
                <div className="chat-messages" ref={chatContainerRef}>
                  {chatMessages.length === 0 ? (
                    <div className="no-messages">
                      No messages yet
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`chat-message ${msg.sender?.id === currentUser?.id ? 'own-message' : ''} ${msg.isPrivate ? 'private-message' : ''}`}
                      >
                        <div className="message-header">
                          <span className="sender-name">
                            {msg.sender?.id === currentUser?.id ? 'You' : msg.sender?.name}
                          </span>
                          <span className="message-time">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        
                        <div className="message-content">
                          {msg.isPrivate && (
                            <span className="private-indicator">
                              Private to {msg.recipient?.id === currentUser?.id ? 'you' : msg.recipient?.name}
                            </span>
                          )}
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <form onSubmit={handleSendMessage} className="chat-input-form">
                  {privateMessageTo && (
                    <div className="private-message-indicator">
                      To: {privateMessageTo.name}
                      <button 
                        type="button"
                        onClick={() => setPrivateMessageTo(null)}
                        className="cancel-private-btn"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <div className="chat-input-container">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="chat-input"
                    />
                    <button 
                      type="submit"
                      className="send-btn"
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {participantsOpen && (
              <div className="meeting-sidebar">
                <div className="participants-header">
                  <h3>Participants ({participants.length + 1})</h3>
                  <button 
                    onClick={() => setParticipantsOpen(false)}
                    className="close-btn"
                  >
                    ×
                  </button>
                </div>
                
                <div className="participants-list">
                  <div className="participant-item current-user">
                    <div className="participant-info">
                      <div className="participant-name">
                        You {userRole === "host" && <span className="host-badge">Host</span>}
                      </div>
                      <div className="participant-status">
                        {isAudioMuted && <span className="status-indicator">Muted</span>}
                        {isVideoOff && <span className="status-indicator">Video Off</span>}
                      </div>
                    </div>
                  </div>
                  
                  {participants.map(participant => (
                    participant.id !== socketRef.current?.id && (
                      <div key={participant.id} className="participant-item">
                        <div className="participant-info">
                          <div className="participant-name">
                            {participant.name}
                            {participant.role === "host" && <span className="host-badge">Host</span>}
                          </div>
                          <div className="participant-status">
                            {participant.audioMuted && <span className="status-indicator">Muted</span>}
                            {participant.videoOff && <span className="status-indicator">Video Off</span>}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => setPrivateMessageTo(participant)}
                          className="private-msg-btn"
                          title="Send private message"
                        >
                          Message
                        </button>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="meeting-controls">
            <div className="control-buttons">
              <button 
                onClick={handleToggleAudio}
                className={`control-btn ${isAudioMuted ? 'disabled' : ''}`}
                title={isAudioMuted ? "Unmute" : "Mute"}
              >
                {isAudioMuted ? "Unmute" : "Mute"}
              </button>
              
              <button 
                onClick={handleToggleVideo}
                className={`control-btn ${isVideoOff ? 'disabled' : ''}`}
                title={isVideoOff ? "Start Video" : "Stop Video"}
              >
                {isVideoOff ? "Start Video" : "Stop Video"}
              </button>
              
              <button 
                onClick={handleScreenShare}
                className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
              >
                {isScreenSharing ? "Stop Sharing" : "Share Screen"}
              </button>
              
              <button 
                onClick={() => setChatOpen(!chatOpen)}
                className={`control-btn ${chatOpen ? 'active' : ''}`}
                title="Chat"
              >
                Chat
              </button>
              
              <button 
                onClick={() => setParticipantsOpen(!participantsOpen)}
                className={`control-btn ${participantsOpen ? 'active' : ''}`}
                title="Participants"
              >
                Participants
              </button>
              
              {userRole === "host" && (
                <button 
                  onClick={handleToggleRecording}
                  className={`control-btn ${recording ? 'active' : ''}`}
                  title={recording ? "Stop Recording" : "Start Recording"}
                >
                  {recording ? "Stop Recording" : "Record"}
                </button>
              )}
            </div>
            
            <button 
              onClick={handleLeaveMeeting}
              className="leave-btn"
              disabled={leavingMeeting}
              title="Leave Meeting"
            >
              {leavingMeeting ? "Leaving..." : "Leave Meeting"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MeetingRoomPage;