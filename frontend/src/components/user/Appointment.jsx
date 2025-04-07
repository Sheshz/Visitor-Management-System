import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, ChevronRight, Search, Filter } from 'lucide-react';
import '../../CSS/Appointment.css';


const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  useEffect(() => {
    // Fetch appointments when component mounts
    const fetchAppointments = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('/api/appointments');
        // const data = await response.json();
        
        // Using mock data for demonstration
        setAppointments(getMockAppointments());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Mock data function
  const getMockAppointments = () => {
    return [
      {
        _id: '1001',
        title: 'Business Strategy Consultation',
        date: '2025-04-15',
        time: '14:00',
        duration: 60,
        host: {
          name: 'Sarah Johnson',
          avatar: '/api/placeholder/80/80',
          title: 'Business Consultant'
        },
        status: 'accepted',
        location: 'Video Conference',
        description: 'Discussion about Q2 marketing strategy and budget allocation for the upcoming campaign.',
        notes: 'Please bring your marketing metrics from Q1 for reference.'
      },
      {
        _id: '1002',
        title: 'Software Development Planning',
        date: '2025-04-18',
        time: '10:30',
        duration: 45,
        host: {
          name: 'Michael Chen',
          avatar: '/api/placeholder/80/80',
          title: 'Senior Developer'
        },
        status: 'pending',
        location: 'Office - Room 302',
        description: 'Review of project requirements and timeline planning.',
        notes: 'Bring your laptop with development environment set up.'
      },
      {
        _id: '1003',
        title: 'Financial Review Meeting',
        date: '2025-04-20',
        time: '13:15',
        duration: 90,
        host: {
          name: 'Jessica Martinez',
          avatar: '/api/placeholder/80/80',
          title: 'Financial Advisor'
        },
        status: 'accepted',
        location: 'Video Conference',
        description: 'Quarterly portfolio review and investment strategy discussion.',
        notes: 'Have your recent financial statements available.'
      }
    ];
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleBackToList = () => {
    setSelectedAppointment(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'status-accepted';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const filteredAppointments = appointments.filter(app => 
    app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.host.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="appointment-loading">
        <div className="loading-spinner"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointment-error">
        <p>Error loading appointments: {error}</p>
      </div>
    );
  }

  // Show appointment details if one is selected
  if (selectedAppointment) {
    return (
      <AppointmentDetails 
        appointment={selectedAppointment} 
        onBack={handleBackToList} 
      />
    );
  }

  return (
    <div className="appointments-container">
      <h1>Your Appointments</h1>
      
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search appointments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="appointments-list">
        {filteredAppointments.length === 0 ? (
          <div className="no-appointments">
            <p>No appointments found</p>
          </div>
        ) : (
          filteredAppointments.map(appointment => (
            <div 
              key={appointment._id} 
              className="appointment-card"
              onClick={() => handleAppointmentClick(appointment)}
            >
              <div className="appointment-card-content">
                <div className="appointment-card-header">
                  <h3>{appointment.title}</h3>
                  <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                
                <div className="appointment-card-details">
                  <div className="appointment-card-info">
                    <Calendar size={16} />
                    <span>
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="appointment-card-info">
                    <Clock size={16} />
                    <span>{appointment.time} ({appointment.duration} min)</span>
                  </div>
                  
                  <div className="appointment-card-info">
                    <User size={16} />
                    <span>{appointment.host.name}</span>
                  </div>
                </div>
              </div>
              
              <ChevronRight size={20} className="chevron-icon" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Appointment Details Component
const AppointmentDetails = ({ appointment, onBack }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      // In a real app, you would send to your API
      console.log(`Sending message to appointment ${appointment._id}: ${message}`);
      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="appointment-confirmation">
      <button onClick={onBack} className="back-button">
        &larr; Back to List
      </button>
      
      <div className="confirmation-card">
        <div className="confirmation-header">
          <h1>Appointment {appointment.status === 'accepted' ? 'Confirmed' : 'Pending'}</h1>
          <div className={`status-badge ${appointment.status}`}>
            {appointment.status}
          </div>
        </div>
        
        <div className="appointment-details">
          <h2>{appointment.title}</h2>
          
          <div className="detail-group">
            <div className="detail-item">
              <Calendar className="detail-icon" />
              <div>
                <span className="detail-label">Date</span>
                <span className="detail-value">
                  {new Date(appointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            
            <div className="detail-item">
              <Clock className="detail-icon" />
              <div>
                <span className="detail-label">Time</span>
                <span className="detail-value">
                  {appointment.time} ({appointment.duration} minutes)
                </span>
              </div>
            </div>
          </div>
          
          <div className="host-info">
            <img 
              src={appointment.host.avatar} 
              alt={appointment.host.name} 
              className="host-avatar" 
            />
            <div>
              <h3>Meeting with {appointment.host.name}</h3>
              <p className="host-title">{appointment.host.title}</p>
            </div>
          </div>
          
          <div className="appointment-description">
            <h3>Description</h3>
            <p>{appointment.description}</p>
          </div>
          
          {appointment.notes && (
            <div className="appointment-notes">
              <h3>Additional Notes</h3>
              <p>{appointment.notes}</p>
            </div>
          )}
          
          <div className="appointment-location">
            <h3>Location</h3>
            <p>{appointment.location}</p>
            {appointment.location === 'Video Conference' && (
              <button className="join-meeting-button">
                Join Video Conference
              </button>
            )}
          </div>
        </div>
        
        {appointment.status === 'accepted' && (
          <div className="confirmation-actions">
            <button className="action-button reschedule">
              Reschedule
            </button>
            <button className="action-button cancel">
              Cancel Appointment
            </button>
          </div>
        )}
        
        <div className="message-host">
          <h3>Message Host</h3>
          <div className="message-input-container">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="message-input"
            />
            <button 
              onClick={handleSendMessage}
              className="send-message-button"
              disabled={!message.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;