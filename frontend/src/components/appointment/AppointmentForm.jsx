import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaUser, FaEnvelope, FaInfoCircle, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import apiClient, { apiHelper } from '../../utils/apiClient';
import { getCurrentUser } from '../../utils/SessionManager';
import '../../CSS/AppointmentForm.css';

const AppointmentForm = () => {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const [hostInfo, setHostInfo] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Default to tomorrow
    purpose: '',
    userName: '',
    userEmail: '',
    userId: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch host information
  useEffect(() => {
    const fetchHostInfo = async () => {
      if (!hostId) return;
      
      setIsLoading(true);
      try {
        const hostData = await apiHelper.tryAlternateEndpoints(
          [
            `/api/hosts/${hostId}`,
            `/api/hosts/details/${hostId}`,
            `/api/users/hosts/${hostId}`,
          ],
          null
        );
        
        if (hostData) {
          setHostInfo(hostData);
          // Pre-fill the appointment title with host name
          setFormData(prev => ({
            ...prev,
            title: `Meeting with ${hostData.name}`
          }));
        }
      } catch (err) {
        console.error('Error fetching host details:', err);
        setError('Could not retrieve host information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostInfo();
  }, [hostId]);

  // Auto-fill user info
  useEffect(() => {
    const user = getCurrentUser(); 
    if (user) {
      setFormData((prev) => ({
        ...prev,
        userName: user.name || '',
        userEmail: user.email || '',
        userId: user.id || ''
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      scheduledTime: date
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Send to API
      await apiHelper.tryAlternateEndpoints(
        [
          { 
            method: 'post',
            url: '/api/appointments',
            data: {
              hostId,
              userId: formData.userId,
              title: formData.title,
              description: formData.description,
              purpose: formData.purpose,
              scheduledTime: formData.scheduledTime.toISOString(),
              userName: formData.userName,
              userEmail: formData.userEmail
            }
          },
          {
            method: 'post',
            url: '/api/hosts/appointments',
            data: {
              hostId,
              userId: formData.userId,
              title: formData.title,
              description: formData.description,
              purpose: formData.purpose,
              scheduledTime: formData.scheduledTime.toISOString(),
              userName: formData.userName,
              userEmail: formData.userEmail
            }
          }
        ],
        null
      );
      
      // Show success message
      setSuccess(true);
      
      // After 2 seconds, redirect back to host directory
      setTimeout(() => {
        navigate('/hosts', { state: { successMessage: 'Appointment request sent successfully!' } });
      }, 2000);
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.response?.data?.message || 'Failed to create appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/hosts'); // Go back to host directory
  };

  if (isLoading) {
    return (
      <div className="appointment-loading">
        <div className="appointment-loading-spinner"></div>
        <p>Loading host information...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="appointment-success">
        <FaCheckCircle className="appointment-success-icon" />
        <h2>Appointment Request Sent!</h2>
        <p>Your request has been submitted to the host's dashboard.</p>
        <p>Redirecting back to host directory...</p>
      </div>
    );
  }

  return (
    <div className="appointment-form-container">
      <div className="appointment-form-header">
        <button onClick={handleBack} className="appointment-back-button">
          <FaArrowLeft /> Back to Host Directory
        </button>
        <h2>Book Appointment {hostInfo && `with ${hostInfo.name}`}</h2>
      </div>

      {error && (
        <div className="appointment-alert alert-danger">
          <FaInfoCircle /> {error}
        </div>
      )}
      
      {hostInfo && (
        <div className="appointment-host-info">
          <div className="appointment-host-avatar">
            <img 
              src={hostInfo.avatar || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23E0E0E0'/%3E%3Ccircle cx='50' cy='35' r='20' fill='%23AEAEAE'/%3E%3Cpath d='M25,85 Q50,65 75,85' fill='%23AEAEAE'/%3E%3C/svg%3E`} 
              alt={`${hostInfo.name}'s avatar`}
            />
          </div>
          <div className="appointment-host-details">
            <h3>{hostInfo.name}</h3>
            <p>{hostInfo.title || hostInfo.expertise || "Professional Host"}</p>
            {hostInfo.specialties && hostInfo.specialties.length > 0 && (
              <div className="appointment-host-specialties">
                {hostInfo.specialties.map((specialty, index) => (
                  <span key={index} className="appointment-specialty-tag">{specialty}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="appointment-form-section">
          <h3><FaUser /> Your Information</h3>
          <div className="appointment-form-row">
            <div className="appointment-form-group">
              <label htmlFor="userName">Your Name</label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
                className="appointment-input"
              />
            </div>

            <div className="appointment-form-group">
              <label htmlFor="userEmail">Your Email</label>
              <input
                type="email"
                id="userEmail"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleChange}
                required
                className="appointment-input"
              />
            </div>
          </div>
        </div>

        <div className="appointment-form-section">
          <h3><FaInfoCircle /> Appointment Details</h3>
          <div className="appointment-form-group">
            <label htmlFor="title">Meeting Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="appointment-input"
            />
          </div>
          
          <div className="appointment-form-group">
            <label htmlFor="purpose">Purpose of Meeting</label>
            <input
              type="text"
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              placeholder="Brief summary of what you'd like to discuss"
              className="appointment-input"
            />
          </div>
          
          <div className="appointment-form-group">
            <label htmlFor="description">Additional Details</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Share any specific topics or questions you'd like to cover"
              className="appointment-textarea"
            />
          </div>
        </div>
        
        <div className="appointment-form-section">
          <h3><FaCalendarAlt /> Schedule</h3>
          <div className="appointment-datepicker-container">
            <label>Select Date & Time</label>
            <DatePicker
              selected={formData.scheduledTime}
              onChange={handleDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              required
              className="appointment-datepicker"
            />
            
            {hostInfo && hostInfo.sessionLength && (
              <div className="appointment-session-info">
                <FaClock /> Session length: {hostInfo.sessionLength} minutes
              </div>
            )}

            {hostInfo && hostInfo.availabilityNotes && (
              <div className="appointment-availability-notes">
                <FaInfoCircle /> {hostInfo.availabilityNotes}
              </div>
            )}
          </div>
        </div>
        
        <div className="appointment-form-actions">
          <button 
            type="button" 
            onClick={handleBack} 
            className="appointment-cancel-btn"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="appointment-submit-btn"
          >
            {isSubmitting ? 'Sending Request...' : 'Request Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;