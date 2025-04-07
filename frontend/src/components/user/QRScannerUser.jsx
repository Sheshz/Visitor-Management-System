import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, RefreshCw, Check, X, ArrowLeft } from 'lucide-react';

function QRScanner() {
  const [hasCamera, setHasCamera] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Check if camera is available
    checkCameraAvailability();
    
    // Clean up on component unmount
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasCamera(videoDevices.length > 0);
    } catch (err) {
      console.error("Error checking camera:", err);
      setHasCamera(false);
      setError("Unable to access camera devices. Please ensure camera permissions are granted.");
    }
  };

  const startScanning = async () => {
    setError(null);
    setScannedResult(null);
    setMeetingDetails(null);
    
    try {
      setLoading(true);
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        startQRScanner();
      }
    } catch (err) {
      console.error("Error starting camera:", err);
      setError("Failed to access camera. Please check permissions and try again.");
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
  };

  const startQRScanner = () => {
    // In a real implementation, you would integrate a QR scanner library like jsQR
    // For this example, we'll simulate a scan after a few seconds
    setTimeout(() => {
      if (scanning) {
        // Simulate finding a QR code
        const simulatedQRCode = "meeting_12345";
        setScannedResult(simulatedQRCode);
        stopCamera();
        fetchMeetingDetails(simulatedQRCode);
      }
    }, 3000);
  };

  const fetchMeetingDetails = async (meetingId) => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    
    try {
      // Extract the actual ID from the QR code value
      const id = meetingId.replace("meeting_", "");
      
      const response = await fetch(`http://localhost:5000/api/meetings/${id}`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeetingDetails(data);
      } else {
        setError("Could not find meeting details for this QR code.");
      }
    } catch (err) {
      console.error("Error fetching meeting details:", err);
      setError("Failed to retrieve meeting information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedResult(null);
    setMeetingDetails(null);
    setError(null);
  };

  const checkInToMeeting = async () => {
    if (!meetingDetails) return;
    
    setLoading(true);
    const token = localStorage.getItem("authToken");
    
    try {
      const response = await fetch(`http://localhost:5000/api/meetings/${meetingDetails._id}/check-in`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
      });
      
      if (response.ok) {
        setMeetingDetails(prev => ({
          ...prev,
          checkedIn: true,
          status: "active"
        }));
      } else {
        setError("Failed to check in to meeting. Please try again.");
      }
    } catch (err) {
      console.error("Error checking in:", err);
      setError("An error occurred while checking in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render functions for different states
  const renderInitialState = () => (
    <div className="scanner-initial-state">
      <div className="camera-status">
        {hasCamera ? (
          <>
            <Camera size={48} className="camera-icon" />
            <p>Camera is available</p>
          </>
        ) : (
          <>
            <CameraOff size={48} className="camera-icon disabled" />
            <p>No camera detected on your device</p>
          </>
        )}
      </div>
      
      <div className="scanner-instructions">
        <h3>QR Code Scanner</h3>
        <p>Use this scanner to check in to meetings or access meeting details quickly.</p>
        <ol>
          <li>Click "Start Scanning" below</li>
          <li>Point your camera at a GetePass QR code</li>
          <li>Hold steady until the code is recognized</li>
        </ol>
      </div>
      
      <button 
        className="scan-button primary" 
        onClick={startScanning}
        disabled={!hasCamera || loading}
      >
        {loading ? "Initializing..." : "Start Scanning"}
      </button>
      
      {error && <p className="error-message">{error}</p>}
    </div>
  );

  const renderScanningState = () => (
    <div className="scanner-active-state">
      <div className="video-container">
        <video 
          ref={videoRef} 
          className="scanner-video" 
          playsInline 
          muted
        ></video>
        <div className="scan-overlay">
          <div className="scan-target"></div>
        </div>
      </div>
      
      <p className="scanning-instructions">Position QR code within the frame</p>
      
      <button 
        className="scan-button secondary" 
        onClick={stopCamera}
      >
        Cancel
      </button>
    </div>
  );

  const renderMeetingDetails = () => (
    <div className="meeting-details-container">
      <div className="scan-result-header">
        <h3>Meeting Details</h3>
        <button 
          className="back-button"
          onClick={resetScanner}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading meeting details...</p>
        </div>
      ) : meetingDetails ? (
        <div className="meeting-info-card">
          <div className="meeting-status">
            <span className={`status-badge ${meetingDetails.status}`}>
              {meetingDetails.status.charAt(0).toUpperCase() + meetingDetails.status.slice(1)}
            </span>
          </div>
          
          <div className="host-section">
            <img 
              src={meetingDetails.hostAvatar || "https://via.placeholder.com/64"} 
              alt={meetingDetails.hostName} 
              className="host-avatar-medium" 
            />
            <div className="host-details">
              <h4>Meeting with</h4>
              <p className="host-name">{meetingDetails.hostName}</p>
              <p className="host-department">{meetingDetails.hostDepartment}</p>
            </div>
          </div>
          
          <div className="meeting-details-section">
            <div className="detail-item">
              <h5>Date & Time</h5>
              <p>{formatDateTime(meetingDetails.scheduledTime)}</p>
            </div>
            
            <div className="detail-item">
              <h5>Purpose</h5>
              <p>{meetingDetails.purpose}</p>
            </div>
            
            <div className="detail-item">
              <h5>Location</h5>
              <p>{meetingDetails.location || "Virtual Meeting"}</p>
              {meetingDetails.meetingLink && (
                <a href={meetingDetails.meetingLink} target="_blank" rel="noopener noreferrer" className="join-link">
                  Join Virtual Meeting
                </a>
              )}
            </div>
            
            <div className="detail-item">
              <h5>Duration</h5>
              <p>{meetingDetails.duration || "30"} minutes</p>
            </div>
          </div>
          
          {!meetingDetails.checkedIn && meetingDetails.status === "upcoming" && (
            <button 
              className="checkin-button" 
              onClick={checkInToMeeting}
              disabled={loading}
            >
              {loading ? "Processing..." : "Check In Now"}
            </button>
          )}
          
          {meetingDetails.checkedIn && (
            <div className="checked-in-badge">
              <Check size={16} />
              Checked In
            </div>
          )}
        </div>
      ) : (
        <div className="error-container">
          <X size={48} className="error-icon" />
          <h3>Failed to load meeting</h3>
          <p>{error || "Could not find meeting details for this QR code."}</p>
          <button 
            className="retry-button"
            onClick={startScanning}
          >
            <RefreshCw size={16} />
            Scan Again
          </button>
        </div>
      )}
    </div>
  );

  // Main render logic
  return (
    <div className="qr-scanner-container">
      {scannedResult ? renderMeetingDetails() : (scanning ? renderScanningState() : renderInitialState())}
    </div>
  );
}

export default QRScanner;