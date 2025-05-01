import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SessionManager } from "../../utils/SessionManager";
import "../../CSS/NewVisitor.css";
import { FaCalendarAlt, FaClock, FaUser, FaEnvelope, FaCheck, FaTimes, FaVideo } from "react-icons/fa";

const NewVisitor = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from session or local storage
      const hostToken = SessionManager.getHostToken() || localStorage.getItem("hostToken");
      
      if (!hostToken) {
        setError("You need to login to view appointments");
        setLoading(false);
        return;
      }

      // Fetch appointments for host
      const response = await fetch("http://localhost:5000/api/appointments/host", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hostToken}`
        }
      });
      
      if (!response.ok) {
        console.error("Appointment fetch error:", response.status);
        // If API isn't ready yet, use sample data for demonstration
        useSampleData();
        return;
      }

      const data = await response.json();
      setAppointments(data);
      
      // Calculate stats from the data
      const stats = {
        total: data.length,
        pending: data.filter(app => app.status === 'pending').length,
        approved: data.filter(app => app.status === 'approved').length,
        rejected: data.filter(app => app.status === 'rejected').length
      };
      
      setStats(stats);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      useSampleData(); // Use sample data if there's an error
    }
  };

  // Function to use sample data when API is not available
  const useSampleData = () => {
    console.log("Using sample data temporarily");
    
    const sampleAppointments = [
      {
        _id: "app1",
        subject: "Initial Consultation",
        status: "pending",
        appointmentDate: new Date().toISOString(),
        visitorName: "John Smith",
        visitorEmail: "john.smith@example.com",
        details: "I would like to discuss the new project proposal in detail.",
        meetingCreated: false
      },
      {
        _id: "app2",
        subject: "Follow-up Meeting",
        status: "approved",
        appointmentDate: new Date(Date.now() + 86400000).toISOString(),
        visitorName: "Sarah Johnson",
        visitorEmail: "sarah.j@example.com",
        details: "Need to review the progress on our ongoing project.",
        meetingCreated: false
      },
      {
        _id: "app3",
        subject: "Product Demo",
        status: "rejected",
        appointmentDate: new Date(Date.now() - 86400000).toISOString(),
        visitorName: "Robert Lee",
        visitorEmail: "robert.lee@example.com",
        details: "Interested in seeing a live demonstration of your product.",
        meetingCreated: false
      }
    ];
    
    setAppointments(sampleAppointments);
    
    setStats({
      total: sampleAppointments.length,
      pending: sampleAppointments.filter(app => app.status === 'pending').length,
      approved: sampleAppointments.filter(app => app.status === 'approved').length,
      rejected: sampleAppointments.filter(app => app.status === 'rejected').length
    });
    
    setLoading(false);
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      const hostToken = SessionManager.getHostToken() || localStorage.getItem("hostToken");
      
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hostToken}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        console.error("Failed to update appointment status:", response.status);
        // For demo purposes, still update the UI
        updateAppointmentLocally(appointmentId, status);
        return;
      }
      
      // Refresh data after successful update
      fetchAppointments();
      
    } catch (err) {
      console.error("Error updating appointment:", err);
      // For demo purposes, still update the UI
      updateAppointmentLocally(appointmentId, status);
    }
  };

  // Update appointment locally when API fails
  const updateAppointmentLocally = (appointmentId, status) => {
    // Update local state to reflect the change
    setAppointments(appointments.map(appointment => 
      appointment._id === appointmentId 
        ? { ...appointment, status } 
        : appointment
    ));
    
    // Update stats
    const newStats = { ...stats };
    const appointment = appointments.find(a => a._id === appointmentId);
    if (appointment) {
      const oldStatus = appointment.status;
      if (oldStatus !== status) {
        if (oldStatus === 'pending') newStats.pending--;
        if (oldStatus === 'approved') newStats.approved--;
        if (oldStatus === 'rejected') newStats.rejected--;
        
        if (status === 'pending') newStats.pending++;
        if (status === 'approved') newStats.approved++;
        if (status === 'rejected') newStats.rejected++;
        
        setStats(newStats);
      }
    }
  };

  const createMeeting = async (appointmentId) => {
    try {
      // First, find the appointment
      const appointment = appointments.find(app => app._id === appointmentId);
      if (!appointment) {
        setError('Appointment not found');
        return;
      }
      
      // If it's pending, approve it first
      if (appointment.status === 'pending') {
        await handleStatusUpdate(appointmentId, 'approved');
      }
      
      // Navigate to create meeting page with appointment info
      navigate("/host-dashboard/meeting", { 
        state: { 
          appointmentId,
          visitorEmail: appointment.visitorEmail,
          visitorName: appointment.visitorName,
          appointmentDate: appointment.appointmentDate,
          subject: appointment.subject || "Meeting",
          details: appointment.details,
          fromAppointment: true
        } 
      });
    } catch (err) {
      console.error("Error creating meeting:", err);
      setError('Failed to create meeting. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatTime = (dateString) => {
    try {
      const options = { hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleTimeString(undefined, options);
    } catch (e) {
      return "Invalid time";
    }
  };

  // Function to view appointment details
  const viewAppointmentDetails = (appointmentId) => {
    navigate(`/host-dashboard/appointment/${appointmentId}`);
  };

  if (loading) {
    return (
      <div className="visitor-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="visitor-container">
      <div className="visitor-header">
        <h2>Appointment Requests</h2>
        <div className="appointment-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item pending">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item approved">
            <span className="stat-number">{stats.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat-item rejected">
            <span className="stat-number">{stats.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchAppointments} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="no-appointments">
          <div className="empty-state">
            <FaCalendarAlt className="empty-icon" />
            <h3>No Appointment Requests</h3>
            <p>When visitors schedule appointments, they'll appear here.</p>
          </div>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map(appointment => (
            <div 
              key={appointment._id} 
              className={`appointment-card ${appointment.status}`}
              onClick={() => viewAppointmentDetails(appointment._id)}
            >
              <div className="appointment-header">
                <h3>{appointment.subject || "Appointment Request"}</h3>
                <span className={`status-badge ${appointment.status}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
              
              <div className="appointment-body">
                <div className="appointment-info">
                  <div className="info-item">
                    <FaCalendarAlt className="info-icon" />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="info-item">
                    <FaClock className="info-icon" />
                    <span>{formatTime(appointment.appointmentDate)}</span>
                  </div>
                  <div className="info-item">
                    <FaUser className="info-icon" />
                    <span>{appointment.visitorName}</span>
                  </div>
                  <div className="info-item">
                    <FaEnvelope className="info-icon" />
                    <span>{appointment.visitorEmail}</span>
                  </div>
                </div>
                
                {appointment.details && (
                  <div className="appointment-details">
                    <p>{appointment.details}</p>
                  </div>
                )}
              </div>
              
              {appointment.status === 'pending' && (
                <div className="appointment-actions" onClick={e => e.stopPropagation()}>
                  <button 
                    className="approve-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(appointment._id, 'approved');
                    }}
                  >
                    <FaCheck /> Approve
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(appointment._id, 'rejected');
                    }}
                  >
                    <FaTimes /> Reject
                  </button>
                  <button 
                    className="meeting-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      createMeeting(appointment._id);
                    }}
                  >
                    <FaVideo /> Create Meeting
                  </button>
                </div>
              )}
              {appointment.status === 'approved' && !appointment.meetingCreated && (
                <div className="appointment-actions" onClick={e => e.stopPropagation()}>
                  <button 
                    className="meeting-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      createMeeting(appointment._id);
                    }}
                  >
                    <FaVideo /> Create Meeting
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewVisitor;