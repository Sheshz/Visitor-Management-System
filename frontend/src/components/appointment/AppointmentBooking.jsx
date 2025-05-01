import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaUser, FaInfoCircle } from 'react-icons/fa';
import api from '../../services/api';
import '../../CSS/AppointmentBooking.css';

const AppointmentBooking = () => {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    purpose: ''
  });

  useEffect(() => {
    const fetchHostAndSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch host details
        const hostResponse = await api.get(`/api/hosts/${hostId}`);
        setHost(hostResponse.data);
        
        // Fetch available slots
        const slotsResponse = await api.get(`/api/hosts/${hostId}/availability`);
        setAvailableSlots(slotsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load host information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHostAndSlots();
  }, [hostId]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    try {
      const response = await api.post('/api/appointments', {
        hostId,
        scheduledTime: selectedSlot.startTime,
        ...formData
      });
      
      navigate('/appointments', { state: { success: 'Appointment requested successfully!' } });
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.response?.data?.message || 'Failed to create appointment');
    }
  };

  if (loading) {
    return (
      <div className="appointment-loading">
        <div className="spinner"></div>
        <p>Loading host information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointment-error">
        <div className="error-message">
          <FaInfoCircle className="error-icon" />
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-booking-container">
      <div className="booking-header">
        <h1>Book Appointment with {host?.name}</h1>
        <p>{host?.title || 'Professional Host'}</p>
      </div>

      <div className="booking-content">
        <div className="host-info">
          <div className="host-avatar">
            <img 
              src={host?.avatar || '/default-avatar.png'} 
              alt={host?.name} 
              onError={(e) => { e.target.src = '/default-avatar.png' }}
            />
          </div>
          
          <div className="host-details">
            <h3>About {host?.name}</h3>
            <p>{host?.bio || 'No bio available'}</p>
            
            <div className="host-specialties">
              {host?.specialties?.map((spec, index) => (
                <span key={index} className="specialty-tag">{spec}</span>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="title">Appointment Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              required
              placeholder="e.g., Career Consultation"
            />
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose</label>
            <input
              type="text"
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleFormChange}
              required
              placeholder="What is this appointment about?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Additional Details</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows="4"
              placeholder="Any additional information the host should know..."
            />
          </div>

          <div className="time-slots">
            <h3>Available Time Slots</h3>
            {availableSlots.length === 0 ? (
              <p>No available slots at this time. Please check back later.</p>
            ) : (
              <div className="slot-grid">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`slot-button ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <FaCalendarAlt className="slot-icon" />
                    <span>{new Date(slot.startTime).toLocaleDateString()}</span>
                    
                    <FaClock className="slot-icon" />
                    <span>
                      {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={!selectedSlot}>
              Request Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentBooking;