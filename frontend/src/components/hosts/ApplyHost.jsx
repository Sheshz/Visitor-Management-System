import React, { useState } from 'react';

const ApplyHost = () => {
  const [formData, setFormData] = useState({
    bio: '',
    expertise: '',
    location: '',
    experience: '',
    avatar: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/host/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Your application has been submitted.');
      } else {
        setMessage(data.message || 'Failed to submit application.');
      }
    } catch (err) {
      setMessage('An error occurred while submitting your profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Apply to Become a Host</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Bio"
          required
        />
        <input
          type="text"
          name="expertise"
          value={formData.expertise}
          onChange={handleChange}
          placeholder="Expertise"
          required
        />
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          required
        />
        <input
          type="text"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          placeholder="Experience"
          required
        />
        <input
          type="text"
          name="avatar"
          value={formData.avatar}
          onChange={handleChange}
          placeholder="Avatar URL (optional)"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Apply'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ApplyHost;
