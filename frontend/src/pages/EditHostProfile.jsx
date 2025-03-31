import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditHostProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    experience: '',
    bio: '',
    expertise: '',
    socialLinks: {
      facebook: { connected: false, url: '' },
      twitter: { connected: false, url: '' },
      linkedin: { connected: false, url: '' },
      instagram: { connected: false, url: '' }
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    heading: {
      borderBottom: '1px solid #eee',
      paddingBottom: '15px',
      marginBottom: '25px'
    },
    formSections: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      marginBottom: '30px'
    },
    section: {
      flex: '1',
      minWidth: '300px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    sectionHeading: {
      marginTop: '0',
      marginBottom: '15px',
      fontSize: '18px',
      color: '#333'
    },
    formGroup: {
      marginBottom: '15px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontSize: '14px',
      color: '#666'
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      fontSize: '14px'
    },
    textarea: {
      width: '100%',
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      fontSize: '14px',
      minHeight: '100px',
      resize: 'vertical'
    },
    socialSection: {
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '30px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    socialGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '15px'
    },
    socialItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      padding: '10px',
      backgroundColor: '#fff',
      borderRadius: '4px',
      border: '1px solid #ddd'
    },
    socialHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '5px'
    },
    socialIcon: {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 'bold',
      color: 'white'
    },
    facebookIcon: {
      backgroundColor: '#3b5998'
    },
    twitterIcon: {
      backgroundColor: '#1DA1F2'
    },
    linkedinIcon: {
      backgroundColor: '#0077B5'
    },
    instagramIcon: {
      backgroundColor: '#E1306C'
    },
    select: {
      width: '100%',
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      fontSize: '14px'
    },
    buttons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '15px'
    },
    saveButton: {
      padding: '10px 20px',
      backgroundColor: '#2196F3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer'
    },
    cancelButton: {
      padding: '10px 20px',
      backgroundColor: '#f5f5f5',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer'
    },
    errorMessage: {
      color: '#F44336',
      padding: '10px',
      backgroundColor: '#ffebee',
      borderRadius: '4px',
      marginBottom: '20px'
    },
    successMessage: {
      color: '#4CAF50',
      padding: '10px',
      backgroundColor: '#e8f5e9',
      borderRadius: '4px',
      marginBottom: '20px'
    }
  };

  useEffect(() => {
    // Fetch host profile data
    const fetchHostData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/hosts/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update form with existing data
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          location: response.data.location || '',
          experience: response.data.experience || '',
          bio: response.data.bio || '',
          expertise: response.data.expertise || '',
          socialLinks: response.data.socialLinks || {
            facebook: { connected: false, url: '' },
            twitter: { connected: false, url: '' },
            linkedin: { connected: false, url: '' },
            instagram: { connected: false, url: '' }
          }
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile data');
        setLoading(false);
        console.error('Error fetching profile:', err);
      }
    };

    fetchHostData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (platform, field, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: {
          ...prev.socialLinks[platform],
          [field]: field === 'connected' ? value === 'true' : value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.put('http://localhost:5000/api/hosts/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Profile updated successfully');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading profile data...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Edit Host Profile</h2>
      
      {error && <div style={styles.errorMessage}>{error}</div>}
      {success && <div style={styles.successMessage}>{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formSections}>
          <div style={styles.section}>
            <h3 style={styles.sectionHeading}>Personal Information</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="name">Name</label>
              <input
                style={styles.input}
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="email">Email</label>
              <input
                style={styles.input}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email address"
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="location">Location</label>
              <input
                style={styles.input}
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Your location"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="experience">Experience</label>
              <input
                style={styles.input}
                type="text"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Your experience"
              />
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionHeading}>Professional Details</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="bio">Bio</label>
              <textarea
                style={styles.textarea}
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="expertise">Expertise</label>
              <input
                style={styles.input}
                type="text"
                id="expertise"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                placeholder="Your areas of expertise"
              />
            </div>
          </div>
        </div>
        
        <div style={styles.socialSection}>
          <h3 style={styles.sectionHeading}>Social Media Links</h3>
          
          <div style={styles.socialGrid}>
            <div style={styles.socialItem}>
              <div style={styles.socialHeader}>
                <div style={{...styles.socialIcon, ...styles.facebookIcon}}>F</div>
                <span>Facebook</span>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="facebook-status">Status</label>
                <select
                  style={styles.select}
                  id="facebook-status"
                  value={formData.socialLinks.facebook.connected.toString()}
                  onChange={(e) => handleSocialLinkChange('facebook', 'connected', e.target.value)}
                >
                  <option value="true">Connected</option>
                  <option value="false">Not Connected</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="facebook-url">Profile URL</label>
                <input
                  style={styles.input}
                  type="text"
                  id="facebook-url"
                  value={formData.socialLinks.facebook.url}
                  onChange={(e) => handleSocialLinkChange('facebook', 'url', e.target.value)}
                  placeholder="https://facebook.com/username"
                />
              </div>
            </div>
            
            <div style={styles.socialItem}>
              <div style={styles.socialHeader}>
                <div style={{...styles.socialIcon, ...styles.twitterIcon}}>T</div>
                <span>Twitter</span>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="twitter-status">Status</label>
                <select
                  style={styles.select}
                  id="twitter-status"
                  value={formData.socialLinks.twitter.connected.toString()}
                  onChange={(e) => handleSocialLinkChange('twitter', 'connected', e.target.value)}
                >
                  <option value="true">Connected</option>
                  <option value="false">Not Connected</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="twitter-url">Profile URL</label>
                <input
                  style={styles.input}
                  type="text"
                  id="twitter-url"
                  value={formData.socialLinks.twitter.url}
                  onChange={(e) => handleSocialLinkChange('twitter', 'url', e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
            
            <div style={styles.socialItem}>
              <div style={styles.socialHeader}>
                <div style={{...styles.socialIcon, ...styles.linkedinIcon}}>L</div>
                <span>LinkedIn</span>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="linkedin-status">Status</label>
                <select
                  style={styles.select}
                  id="linkedin-status"
                  value={formData.socialLinks.linkedin.connected.toString()}
                  onChange={(e) => handleSocialLinkChange('linkedin', 'connected', e.target.value)}
                >
                  <option value="true">Connected</option>
                  <option value="false">Not Connected</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="linkedin-url">Profile URL</label>
                <input
                  style={styles.input}
                  type="text"
                  id="linkedin-url"
                  value={formData.socialLinks.linkedin.url}
                  onChange={(e) => handleSocialLinkChange('linkedin', 'url', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
            
            <div style={styles.socialItem}>
              <div style={styles.socialHeader}>
                <div style={{...styles.socialIcon, ...styles.instagramIcon}}>I</div>
                <span>Instagram</span>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="instagram-status">Status</label>
                <select
                  style={styles.select}
                  id="instagram-status"
                  value={formData.socialLinks.instagram.connected.toString()}
                  onChange={(e) => handleSocialLinkChange('instagram', 'connected', e.target.value)}
                >
                  <option value="true">Connected</option>
                  <option value="false">Not Connected</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="instagram-url">Profile URL</label>
                <input
                  style={styles.input}
                  type="text"
                  id="instagram-url"
                  value={formData.socialLinks.instagram.url}
                  onChange={(e) => handleSocialLinkChange('instagram', 'url', e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div style={styles.buttons}>
          <button type="button" style={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" style={styles.saveButton}>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditHostProfile;