import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateMeetingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // Default 1 hour meeting
    password: "",
    recordingEnabled: false,
    participants: [{ name: "", email: "" }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
  };

  const handleParticipantChange = (index, e) => {
    const { name, value } = e.target;
    const updatedParticipants = [...formData.participants];
    updatedParticipants[index] = {
      ...updatedParticipants[index],
      [name]: value
    };
    
    setFormData({
      ...formData,
      participants: updatedParticipants
    });
  };

  const addParticipant = () => {
    setFormData({
      ...formData,
      participants: [...formData.participants, { name: "", email: "" }]
    });
  };

  const removeParticipant = (index) => {
    if (formData.participants.length === 1) return;
    
    const updatedParticipants = formData.participants.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      participants: updatedParticipants
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Meeting title is required");
      return false;
    }

    if (formData.startTime >= formData.endTime) {
      setError("End time must be after start time");
      return false;
    }

    const allParticipantsFilled = formData.participants.every(
      p => p.email.trim() !== ""
    );

    if (!allParticipantsFilled) {
      setError("All participant emails are required");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = formData.participants.every(
      p => emailRegex.test(p.email.trim())
    );

    if (!validEmails) {
      setError("Please enter valid email addresses for all participants");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Filter out empty participants
      const validParticipants = formData.participants.filter(
        p => p.email.trim() !== ""
      );

      const meetingData = {
        ...formData,
        participants: validParticipants
      };

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/meetings/create`,
        meetingData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccessMessage("Meeting created successfully!");
      setTimeout(() => {
        navigate("/meetings");
      }, 2000);
    } catch (err) {
      console.error("Error creating meeting:", err);
      setError(
        err.response?.data?.message || 
        "Failed to create meeting. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-meeting-container">
      <div className="create-meeting-header">
        <h1>Create New Meeting</h1>
        <p>Schedule a new meeting and invite participants</p>
      </div>

      {error && <div className="create-meeting-error-message">{error}</div>}
      {successMessage && (
        <div className="create-meeting-success-message">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="create-meeting-form">
        <div className="create-meeting-form-group">
          <label htmlFor="title">Meeting Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="create-meeting-input"
            placeholder="Enter meeting title"
            required
          />
        </div>

        <div className="create-meeting-form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="create-meeting-textarea"
            placeholder="Provide a brief description of the meeting"
            rows="3"
          />
        </div>

        <div className="create-meeting-form-row">
          <div className="create-meeting-form-group meeting-time">
            <label htmlFor="startTime">Start Time *</label>
            <DatePicker
              id="startTime"
              selected={formData.startTime}
              onChange={(date) => handleDateChange("startTime", date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="create-meeting-datepicker"
              minDate={new Date()}
            />
          </div>

          <div className="create-meeting-form-group meeting-time">
            <label htmlFor="endTime">End Time *</label>
            <DatePicker
              id="endTime"
              selected={formData.endTime}
              onChange={(date) => handleDateChange("endTime", date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="create-meeting-datepicker"
              minDate={formData.startTime}
            />
          </div>
        </div>

        <div className="create-meeting-form-row">
          <div className="create-meeting-form-group">
            <label htmlFor="password">Meeting Password (Optional)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="create-meeting-input"
              placeholder="Leave empty for no password"
            />
          </div>

          <div className="create-meeting-form-group checkbox-group">
            <input
              type="checkbox"
              id="recordingEnabled"
              name="recordingEnabled"
              checked={formData.recordingEnabled}
              onChange={handleChange}
              className="create-meeting-checkbox"
            />
            <label htmlFor="recordingEnabled">Enable Recording</label>
          </div>
        </div>

        <div className="create-meeting-participants-section">
          <div className="create-meeting-participants-header">
            <h3>Participants</h3>
            <button
              type="button"
              onClick={addParticipant}
              className="create-meeting-add-participant-btn"
            >
              Add Participant
            </button>
          </div>

          {formData.participants.map((participant, index) => (
            <div key={index} className="create-meeting-participant-row">
              <div className="create-meeting-form-group">
                <input
                  type="text"
                  name="name"
                  value={participant.name}
                  onChange={(e) => handleParticipantChange(index, e)}
                  className="create-meeting-input"
                  placeholder="Participant Name (Optional)"
                />
              </div>
              <div className="create-meeting-form-group">
                <input
                  type="email"
                  name="email"
                  value={participant.email}
                  onChange={(e) => handleParticipantChange(index, e)}
                  className="create-meeting-input"
                  placeholder="Email Address *"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => removeParticipant(index)}
                className="create-meeting-remove-participant-btn"
                disabled={formData.participants.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="create-meeting-form-actions">
          <button
            type="button"
            onClick={() => navigate("/meetings")}
            className="create-meeting-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="create-meeting-submit-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Meeting"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMeetingPage;