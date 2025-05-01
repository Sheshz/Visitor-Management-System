import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Tag, 
  Check, 
  X, 
  AlertCircle, 
  ChevronLeft,
  Link as LinkIcon
} from 'lucide-react';
//import '../CSS/AppointmentDetails.css';
import apiClient, { apiHelper } from '../../utils/apiClient';
import { SessionManager } from '../../utils/SessionManager';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = SessionManager.getToken();
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await apiHelper.tryAlternateEndpoints(
          [
            `/api/appointments/${appointmentId}`,
            `/api/user/appointments/${appointmentId}`
          ],
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response) {
          setAppointment(response.appointment);
          if (response.qrCode) {
            setQrCode(response.qrCode);
          }
        }
      } catch (err) {
        console.error('Error fetching appointment details:', err);
        setError('Could not retrieve appointment information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId]);

  const handleBack = () => {
    navigate('/dashboard/appointments');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'appointment-status-confirmed';
      case 'Cancelled':
        return 'appointment-status-cancelled';
      case 'Completed':
        return 'appointment-status-completed';
      default:
        return 'appointment-status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed':
        return <Check size={16} />;
      case 'Cancelled':
        return <X size={16} />;
      case 'Completed':
        return <Check size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="appointment-details-loading">
        <div className="appointment-details-loading-spinner"></div>
        <p>Loading appointment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointment-details-error">
        <AlertCircle size={48} className="appointment-details-error-icon" />
        <h3>Error Loading Appointment</h3>
        <p>{error}</p>
        <button onClick={handleBack} className="appointment-details-back-btn">
          Back to Appointments
        </button>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="appointment-details-not-found">
        <AlertCircle size={48} className="appointment-details-not-found-icon" />
        <h3>Appointment Not Found</h3>
        <p>The requested appointment could not be found or you may not have permission to view it.</p>
        <button onClick={handleBack} className="appointment-details-back-btn">
          Back to Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="appointment-details-container">
      <div className="appointment-details-header">
        <button onClick={handleBack} className="appointment-details-back-button">
          <ChevronLeft size={18} /> Back to Appointments
        </button>
        <h2>{appointment.title || 'Appointment Details'}</h2>
      </div>

      <div className="appointment-details-content">
        <div className="appointment-details-status-section">
          <div className={`appointment-details-status ${getStatusBadgeClass(appointment.status)}`}>
            {getStatusIcon(appointment.status)}
            <span>{appointment.status}</span>
          </div>
          
          <div className="appointment-details-confirmation">
            <div className="appointment-details-code">
              <span>Confirmation Code:</span>
              <strong>{appointment.confirmationCode}</strong>
            </div>
          </div>
        </div>

        <div className="appointment-details-card">
          <div className="appointment-details-section">
            <h3>
              <Calendar size={18} />
              <span>Appointment Information</span>
            </h3>
            <div className="appointment-details-info">
              <div className="appointment-details-row">
                <span className="appointment-details-label">Date & Time:</span>
                <span className="appointment-details-value">{formatDateTime(appointment.scheduledTime)}</span>
              </div>
              
              <div className="appointment-details-row">
                <span className="appointment-details-label">Purpose:</span>
                <span className="appointment-details-value">{appointment.purpose || 'Not specified'}</span>
              </div>
              
              {appointment.description && (
                <div className="appointment-details-row">
                  <span className="appointment-details-label">Details:</span>
                  <span className="appointment-details-value appointment-details-description">
                    {appointment.description}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="appointment-details-section">
            <h3>
              <User size={18} />
              <span>Host Information</span>
            </h3>
            <div className="appointment-details-info">
              <div className="appointment-details-row">
                <span className="appointment-details-label">Name:</span>
                <span className="appointment-details-value">{appointment.host?.name || 'Not available'}</span>
              </div>
              
              <div className="appointment-details-row">
                <span className="appointment-details-label">Email:</span>
                <span className="appointment-details-value">{appointment.host?.email || 'Not available'}</span>
              </div>
              
              {appointment.host?.expertise && (
                <div className="appointment-details-row">
                  <span className="appointment-details-label">Expertise:</span>
                  <span className="appointment-details-value">{appointment.host.expertise}</span>
                </div>
              )}
            </div>
          </div>

          {appointment.status === 'Confirmed' && appointment.meetingLink && (
            <div className="appointment-details-section">
              <h3>
                <LinkIcon size={18} />
                <span>Meeting Information</span>
              </h3>
              <div className="appointment-details-info">
                <div className="appointment-details-meeting">
                  <a 
                    href={appointment.meetingLink} 
                    className="appointment-details-meeting-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Meeting
                  </a>
                  
                  {qrCode && (
                    <div className="appointment-details-qr-container">
                      <p>Scan QR code to join meeting:</p>
                      <img 
                        src={qrCode} 
                        alt="Meeting QR Code" 
                        className="appointment-details-qr"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {appointment.status === 'Cancelled' && appointment.rejectionReason && (
            <div className="appointment-details-section appointment-details-cancelled">
              <h3>
                <AlertCircle size={18} />
                <span>Cancellation Reason</span>
              </h3>
              <div className="appointment-details-info">
                <div className="appointment-details-rejection-reason">
                  {appointment.rejectionReason}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;