import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaQrcode, FaArrowRight, FaSpinner } from "react-icons/fa";
import apiClient from "../../utils/apiClient";

const JoinMeeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/api/meetings/${meetingId}/join`, {
        email,
        accessCode,
      });

      navigate(`/meeting-room/${meetingId}`);
    } catch (err) {
      console.error("Error joining meeting:", err);
      setError(err.response?.data?.message || "Failed to join meeting");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="join-meeting-container">
      <div className="join-meeting-card">
        <h2>Join Meeting</h2>

        {error && (
          <div className="alert alert-danger">
            <FaInfoCircle /> {error}
          </div>
        )}

        <form onSubmit={handleJoinMeeting}>
          <div className="form-group">
            <label htmlFor="email">Your Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="accessCode">Access Code</label>
            <input
              type="text"
              id="accessCode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="join-btn">
            {isLoading ? (
              <>
                <FaSpinner className="spinner-icon" /> Joining...
              </>
            ) : (
              <>
                <FaArrowRight /> Join Meeting
              </>
            )}
          </button>
        </form>

        <div className="qr-option">
          <button
            onClick={() => setShowScanner(!showScanner)}
            className="qr-toggle-btn"
          >
            <FaQrcode />{" "}
            {showScanner ? "Hide QR Scanner" : "Use QR Code Instead"}
          </button>

          {showScanner && (
            <div className="qr-scanner-container">
              <p>Scan the QR code you received in your email invitation</p>
              {/* In a real app, you would implement a QR scanner component here */}
              <div className="qr-scanner-placeholder">
                <p>QR Scanner would appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinMeeting;
