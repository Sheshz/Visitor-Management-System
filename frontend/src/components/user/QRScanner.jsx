import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQrcode, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import QrReader from 'react-qr-reader';
import api from '../../services/api';
import '../../CSS/QRScanner.css';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const navigate = useNavigate();

  const handleScan = async (data) => {
    if (data && !loading) {
      try {
        setLoading(true);
        setError(null);
        
        // Parse the QR code data (assuming format: meetingId|accessCode)
        const [meetingId, accessCode] = data.split('|');
        
        if (!meetingId || !accessCode) {
          throw new Error('Invalid QR code format');
        }

        // Verify the meeting and code
        const response = await api.post(`/api/meetings/${meetingId}/join`, {
          accessCode
        });

        if (response.data.success) {
          navigate(`/meeting/${meetingId}`);
        } else {
          throw new Error('Invalid meeting code');
        }
      } catch (err) {
        console.error('Error scanning QR code:', err);
        setError('Invalid QR code. Please try again or enter the code manually.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (err) => {
    console.error('QR scanner error:', err);
    setError('Failed to access camera. Please check permissions or enter the code manually.');
  };

  const handleManualJoin = async () => {
    if (!manualCode.trim()) {
      setError('Please enter a meeting code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Assuming manualCode is the meeting ID and we need to prompt for access code
      // In a real app, you might have a separate input for access code
      navigate(`/meeting/join/${manualCode}`);
    } catch (err) {
      console.error('Error joining meeting:', err);
      setError('Failed to join meeting. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qr-scanner-container">
      <button className="back-button" onClick={() => navigate('/appointments')}>
        <FaArrowLeft /> Back to Appointments
      </button>

      <h1>Join Meeting</h1>
      <p className="subtitle">Scan the QR code or enter the meeting code</p>

      <div className="scanner-section">
        <div className="scanner-wrapper">
          {error ? (
            <div className="scanner-error">
              <FaInfoCircle className="error-icon" />
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div className="scanner-loading">
              <div className="spinner"></div>
              <p>Verifying code...</p>
            </div>
          ) : (
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
              facingMode="user"
            />
          )}
        </div>

        <div className="manual-entry">
          <h3>Or Enter Code Manually</h3>
          <div className="input-group">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter meeting code"
            />
            <button 
              onClick={handleManualJoin}
              disabled={loading || !manualCode.trim()}
            >
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="instructions">
        <h3>How to join a meeting:</h3>
        <ol>
          <li>Point your camera at the QR code provided by the host</li>
          <li>Alternatively, enter the meeting code manually</li>
          <li>You'll be connected once the host starts the meeting</li>
        </ol>
      </div>
    </div>
  );
};

export default QRScanner;