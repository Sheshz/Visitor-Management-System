import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaLinkedin, FaTwitter, FaFacebook, FaInstagram, 
  FaMapMarkerAlt, FaStar, FaFilter, FaSearch, FaArrowLeft
} from 'react-icons/fa';
import { 
  MdEmail, MdEdit, MdPerson, MdOutlineMessage, 
  MdDashboard, MdGroup, MdComment
} from 'react-icons/md';
import { 
  AiOutlineEye, AiOutlineEyeInvisible, 
  AiOutlineClockCircle, AiOutlineStar
} from 'react-icons/ai';
import axios from 'axios';
import { SessionManager } from '../../utils/SessionManager';
import '../../CSS/HostNetwork.css';
import HostProfile from './HostProfile';

const HostNetwork = () => {
  const navigate = useNavigate();
  // Tab state
  const [activeTab, setActiveTab] = useState('profile');
  
  // Component state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [selectedHostId, setSelectedHostId] = useState(null);
  const [viewingHostProfile, setViewingHostProfile] = useState(false);
  
  // My Profile state
  const [hostProfile, setHostProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState(false);
  const [activeUntil, setActiveUntil] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [activeTimeOptions] = useState([
    { value: '2h', label: '2 Hours' },
    { value: '4h', label: '4 Hours' },
    { value: '8h', label: '8 Hours' },
    { value: '12h', label: '12 Hours' },
    { value: '24h', label: '1 Day' },
    { value: '48h', label: '2 Days' },
    { value: '7d', label: '1 Week' },
  ]);
  
  // All Hosts state
  const [hosts, setHosts] = useState([]);
  const [selectedHost, setSelectedHost] = useState(null);
  const [hostComments, setHostComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('');
  const [uniqueExpertise, setUniqueExpertise] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchHostProfile();
    } else if (activeTab === 'hosts') {
      fetchAvailableHosts();
    }
  }, [activeTab]);
  
  // Fetch host profile data
  const fetchHostProfile = async () => {
    try {
      setLoading(true);
      
      // Get host token from SessionManager
      const token = SessionManager.getHostToken();
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Set headers with authorization token
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Make API request to get host profile
      const response = await axios.get('http://localhost:5000/api/hosts/getHostDetails', config);
      
      // Set host profile data
      setHostProfile(response.data.host);
      setActiveStatus(response.data.host.isActive || false);
      
      // Check if there's an active until timestamp
      if (response.data.host.activeUntil && new Date(response.data.host.activeUntil) > new Date()) {
        setActiveUntil(response.data.host.activeUntil);
      }
      
      // Fetch comments/reviews for this host
      fetchHostComments(response.data.host.hostID);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching host profile:', err);
      setError('Failed to load your host profile. Please try again later.');
      setLoading(false);
    }
  };
  
  // Fetch comments/reviews for the host
  const fetchHostComments = async (hostId) => {
    try {
      setCommentsLoading(true);
      
      // Get host token
      const token = SessionManager.getHostToken();
      
      // Set headers
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Make API request to get reviews for this host
      const response = await axios.get(`http://localhost:5000/api/reviews/host/${hostId}`, config);
      
      // Set comments data
      setComments(response.data);
      setCommentsLoading(false);
    } catch (err) {
      console.error('Error fetching host comments:', err);
      setCommentsLoading(false);
      // Don't set error state, as this is not a critical function
    }
  };
  
  // Fetch all available hosts
  const fetchAvailableHosts = async () => {
    try {
      setLoading(true);
      
      // Get host token from SessionManager
      const token = SessionManager.getHostToken();
      
      // Set headers with authorization token
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Make API request to get available hosts
      const response = await axios.get('http://localhost:5000/api/hosts/available', config);
      
      // Set hosts data
      setHosts(response.data);
      
      // Extract unique expertise areas for filter
      const expertiseSet = new Set(response.data.map(host => host.expertise));
      setUniqueExpertise([...expertiseSet]);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching available hosts:', err);
      setError('Failed to load host network. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch comments for a specific host
  const fetchHostCommentsById = async (hostId) => {
    try {
      // Get host token
      const token = SessionManager.getHostToken();
      
      // Set headers
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Make API request to get reviews for this host
      const response = await axios.get(`http://localhost:5000/api/reviews/host/${hostId}`, config);
      
      // Set host comments data
      setHostComments(response.data);
    } catch (err) {
      console.error('Error fetching host comments:', err);
      // Don't set error state, as this is not a critical function
    }
  };

  const toggleActiveStatus = async () => {
    try {
      setStatusUpdating(true);
      
      // Get host token from SessionManager
      const token = SessionManager.getHostToken();
      
      // Set headers with authorization token
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      // If activating, require a time selection
      if (!activeStatus && !activeUntil) {
        setStatusUpdating(false);
        return;
      }
      
      // Calculate activeUntil if turning active
      let activeUntilValue = null;
      if (!activeStatus) {
        // Parse the selected time option
        const timeValue = activeUntil;
        const now = new Date();
        
        if (timeValue.endsWith('h')) {
          const hours = parseInt(timeValue);
          now.setHours(now.getHours() + hours);
        } else if (timeValue.endsWith('d')) {
          const days = parseInt(timeValue);
          now.setDate(now.getDate() + days);
        }
        
        activeUntilValue = now.toISOString();
      }
      
      // Make API request to update host active status
      const response = await axios.put(
        'http://localhost:5000/api/hosts/update-status',
        {
          isActive: !activeStatus,
          activeUntil: activeUntilValue
        },
        config
      );
      
      // Update local state
      setActiveStatus(!activeStatus);
      setActiveUntil(activeUntilValue || '');
      
      setStatusUpdating(false);
    } catch (err) {
      console.error('Error updating host status:', err);
      setStatusUpdating(false);
    }
  };

  const editProfile = () => {
    setShowEditProfile(true);
  };

  // View a host's profile from the network
  const viewHostProfile = (hostId) => {
    // Find the selected host
    const host = hosts.find(h => h.hostID === hostId);
    if (host) {
      setSelectedHost(host);
      setViewingHostProfile(true);
      // Fetch comments for this host
      fetchHostCommentsById(hostId);
    }
  };

  // Handle going back to the host network
  const handleBackToNetwork = () => {
    setViewingHostProfile(false);
    setSelectedHost(null);
    setHostComments([]);
  };

  const handleProfileUpdate = () => {
    fetchHostProfile();
    setShowEditProfile(false);
  };

  // Toggle filters display on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Filter hosts based on search term and expertise filter
  const filteredHosts = hosts.filter(host => {
    const matchesSearch = host.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          host.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          host.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExpertise = expertiseFilter === '' || host.expertise === expertiseFilter;
    
    return matchesSearch && matchesExpertise;
  });

  // Function to request a meeting with a host
  const requestMeeting = (hostId) => {
    // Navigate to create meeting page with host ID
    window.location.href = `/host-dashboard/meeting?hostId=${hostId}`;
  };

  if (loading) {
    return (
      <div className="host-network-container loading-container">
        <div className="loading-spinner"></div>
        <p>Loading {activeTab === 'profile' ? 'your host profile' : 'professional hosts'}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="host-network-container error-container">
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  // Calculate time remaining if host is active with a deadline
  let timeRemaining = null;
  if (activeStatus && activeUntil) {
    const now = new Date();
    const endTime = new Date(activeUntil);
    
    if (endTime > now) {
      const diffMs = endTime - now;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      timeRemaining = `${diffHrs}h ${diffMins}m remaining`;
    } else {
      // Time has expired, should update status
      setActiveStatus(false);
      setActiveUntil('');
    }
  }

  // Render host profile edit component
  if (showEditProfile && hostProfile) {
    return (
      <div className="host-profile-edit-container">
        <div className="profile-navigation">
          <button className="back-button" onClick={() => setShowEditProfile(false)}>
            <FaArrowLeft /> Back to My Profile
          </button>
        </div>
        <HostProfile 
          hostData={hostProfile} 
          onProfileUpdate={handleProfileUpdate} 
          onCancel={() => setShowEditProfile(false)} 
        />
      </div>
    );
  }

  // Render viewing a specific host's profile
  if (viewingHostProfile && selectedHost) {
    return (
      <div className="view-host-profile-container">
        <div className="profile-navigation">
          <button className="back-button" onClick={handleBackToNetwork}>
            <FaArrowLeft /> Back to Host Network
          </button>
        </div>

        <div className="host-profile-header">
          <div className="host-avatar-container">
            <div className="host-avatar">
              {selectedHost.avatar ? (
                <img src={selectedHost.avatar} alt={`${selectedHost.name}'s profile`} />
              ) : (
                <div className="default-avatar">
                  {selectedHost.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className={`status-indicator ${selectedHost.isActive ? 'active' : 'inactive'}`}>
              {selectedHost.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          <div className="host-info-header">
            <h1>{selectedHost.name}</h1>
            <div className="host-location">
              <FaMapMarkerAlt /> {selectedHost.location}
            </div>
            <div className="host-rating">
              <FaStar className="star-icon" />
              <span>{selectedHost.rating > 0 ? selectedHost.rating.toFixed(1) : 'New'}</span>
              <span className="review-count">
                ({selectedHost.totalReviews || 0} review{selectedHost.totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
            <div className="host-tags">
              <span className="expertise-tag">{selectedHost.expertise}</span>
              <span className="experience-tag">{selectedHost.experience} experience</span>
            </div>
            <div className="host-actions">
              <button className="request-meeting-btn" onClick={() => requestMeeting(selectedHost.hostID)}>
                <MdOutlineMessage /> Request Meeting
              </button>
              <a href="#reviews" className="view-reviews-link">
                View Reviews
              </a>
            </div>
          </div>
        </div>

        <div className="host-profile-content">
          <div className="host-profile-main">
            <section className="host-bio-section">
              <h2>About</h2>
              <p>{selectedHost.bio}</p>
            </section>

            <section className="host-details-section">
              <h2>Experience</h2>
              <p>{selectedHost.experience}</p>
            </section>

            <section className="host-social-section">
              <h2>Contact & Social Media</h2>
              <div className="host-social-links">
                {selectedHost.socialMedia && selectedHost.socialMedia.linkedin && (
                  <a href={selectedHost.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                    <FaLinkedin /> LinkedIn
                  </a>
                )}
                {selectedHost.socialMedia && selectedHost.socialMedia.twitter && (
                  <a href={selectedHost.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                    <FaTwitter /> Twitter
                  </a>
                )}
                {selectedHost.socialMedia && selectedHost.socialMedia.facebook && (
                  <a href={selectedHost.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                    <FaFacebook /> Facebook
                  </a>
                )}
                {selectedHost.socialMedia && selectedHost.socialMedia.instagram && (
                  <a href={selectedHost.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                    <FaInstagram /> Instagram
                  </a>
                )}
                <a href={`mailto:${selectedHost.email}`} className="social-link email">
                  <MdEmail /> {selectedHost.email}
                </a>
              </div>
            </section>
          </div>

          <section id="reviews" className="host-reviews-section">
            <div className="section-header">
              <MdComment className="section-icon" /> 
              <h2>User Feedback and Reviews</h2>
            </div>
            
            {hostComments.length > 0 ? (
              <div className="comments-list">
                {hostComments.map((comment, index) => (
                  <div className="comment-card" key={index}>
                    <div className="comment-header">
                      <div className="commenter-info">
                        <div className="commenter-avatar">
                          {comment.userAvatar ? (
                            <img src={comment.userAvatar} alt={`${comment.userName}`} />
                          ) : (
                            <div className="default-avatar small">
                              {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                        <span className="commenter-name">{comment.userName}</span>
                      </div>
                      <div className="comment-rating">
                        {[...Array(5)].map((_, i) => (
                          <AiOutlineStar 
                            key={i}
                            className={`star ${i < comment.rating ? 'filled' : ''}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="comment-content">
                      <p>{comment.text}</p>
                    </div>
                    <div className="comment-date">
                      <AiOutlineClockCircle className="date-icon" />
                      {new Date(comment.createdAt).toLocaleDateString()} 
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-comments">
                <p>No reviews yet for this host.</p>
                <p>Be the first to request a meeting and leave a review!</p>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="host-network-container">
      {/* Tab Navigation */}
      <div className="host-network-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <MdDashboard className="tab-icon" />
          My Host Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'hosts' ? 'active' : ''}`}
          onClick={() => setActiveTab('hosts')}
        >
          <MdGroup className="tab-icon" />
          All Hosts
        </button>
      </div>

      {/* My Profile Tab */}
      {activeTab === 'profile' && hostProfile && (
        <div className="profile-tab-content">
          <div className="host-network-header">
            <h1>My Host Profile</h1>
            <p>Manage your availability and profile information</p>
          </div>
          
          <div className="profile-actions-container">
            <div className="status-control-panel">
              <h3>Availability Status</h3>
              <div className="status-toggle-container">
                <div className={`status-indicator ${activeStatus ? 'active' : 'inactive'}`}>
                  {activeStatus ? 'Active' : 'Inactive'}
                </div>
                
                <div className="status-controls">
                  {!activeStatus && (
                    <div className="time-selection">
                      <select 
                        value={activeUntil}
                        onChange={(e) => setActiveUntil(e.target.value)}
                        disabled={activeStatus || statusUpdating}
                      >
                        <option value="">Select active duration</option>
                        {activeTimeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <button 
                    className={`toggle-status-btn ${activeStatus ? 'deactivate' : 'activate'}`}
                    onClick={toggleActiveStatus}
                    disabled={statusUpdating || (!activeStatus && !activeUntil)}
                  >
                    {statusUpdating ? 'Updating...' : activeStatus ? 'Go Inactive' : 'Go Active'}
                  </button>
                </div>
              </div>
              
              {activeStatus && timeRemaining && (
                <div className="time-remaining">
                  <AiOutlineClockCircle />
                  <span>{timeRemaining}</span>
                </div>
              )}
              
              <div className="status-info">
                {activeStatus ? (
                  <p>
                    <AiOutlineEye className="status-icon" />
                    Your profile is currently visible to users in the host network. 
                    {timeRemaining && ' Your status will automatically change to inactive when time expires.'}
                  </p>
                ) : (
                  <p>
                    <AiOutlineEyeInvisible className="status-icon" />
                    Your profile is currently hidden from users in the host network.
                    Select how long you want to be active before clicking "Go Active".
                  </p>
                )}
              </div>
            </div>
            
            <div className="quick-actions">
              <button className="edit-profile-btn" onClick={editProfile}>
                <MdEdit /> Edit Profile
              </button>
              <button className="view-all-hosts-btn" onClick={() => setActiveTab('hosts')}>
                <MdPerson /> View All Hosts
              </button>
            </div>
          </div>

          <div className="host-profile-card">
            <div className="host-card-header">
              <div className="host-avatar">
                {hostProfile.avatar ? (
                  <img src={hostProfile.avatar} alt={`${hostProfile.name}'s profile`} />
                ) : (
                  <div className="default-avatar">
                    {hostProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="host-info">
                <h2>{hostProfile.name}</h2>
                <div className="host-location">
                  <FaMapMarkerAlt /> {hostProfile.location}
                </div>
                <div className="host-rating">
                  <FaStar className="star-icon" />
                  <span>{hostProfile.rating > 0 ? hostProfile.rating.toFixed(1) : 'New'}</span>
                  <span className="review-count">
                    ({hostProfile.totalReviews || 0} review{hostProfile.totalReviews !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            </div>
            
            <div className="host-expertise">
              <span className="expertise-tag">{hostProfile.expertise}</span>
              <span className="experience-tag">{hostProfile.experience} experience</span>
            </div>
            
            <div className="host-bio">
              <h3>About Me</h3>
              <p>{hostProfile.bio}</p>
            </div>
            
            <div className="host-social-links">
              {hostProfile.socialMedia && hostProfile.socialMedia.linkedin && (
                <a href={hostProfile.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                  <FaLinkedin />
                </a>
              )}
              {hostProfile.socialMedia && hostProfile.socialMedia.twitter && (
                <a href={hostProfile.socialMedia.twitter} target="_blank" rel="noopener noreferrer" title="Twitter">
                  <FaTwitter />
                </a>
              )}
              {hostProfile.socialMedia && hostProfile.socialMedia.facebook && (
                <a href={hostProfile.socialMedia.facebook} target="_blank" rel="noopener noreferrer" title="Facebook">
                  <FaFacebook />
                </a>
              )}
              {hostProfile.socialMedia && hostProfile.socialMedia.instagram && (
                <a href={hostProfile.socialMedia.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
                  <FaInstagram />
                </a>
              )}
              <a href={`mailto:${hostProfile.email}`} className="email-link" title="Email">
                <MdEmail />
              </a>
            </div>
          </div>
          
          {/* Reviews Section */}
          <div className="host-reviews-section">
            <h3>
              <MdComment className="section-icon" /> 
              User Feedback and Reviews
            </h3>
            
            {commentsLoading ? (
              <div className="comments-loading">Loading reviews...</div>
            ) : comments.length > 0 ? (
              <div className="comments-list">
                {comments.map((comment, index) => (
                  <div className="comment-card" key={index}>
                    <div className="comment-header">
                      <div className="commenter-info">
                        <div className="commenter-avatar">
                          {comment.userAvatar ? (
                            <img src={comment.userAvatar} alt={`${comment.userName}`} />
                          ) : (
                            <div className="default-avatar small">
                              {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                        <span className="commenter-name">{comment.userName}</span>
                      </div>
                      <div className="comment-rating">
                        {[...Array(5)].map((_, i) => (
                          <AiOutlineStar 
                            key={i}
                            className={`star ${i < comment.rating ? 'filled' : ''}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="comment-content">
                      <p>{comment.text}</p>
                    </div>
                    <div className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-comments">
                <p>No reviews yet. As you host more meetings, users will be able to leave feedback here.</p>
              </div>
            )}
          </div>
          
          <div className="network-info-section">
            <h3>About Host Status</h3>
            <p>
              When your host status is set to "Active", your profile will be visible to users
              in the host network. You can set how long you want to remain active, and your status
              will automatically change to "Inactive" after the selected duration.
            </p>
            <p>
              While active, you may receive meeting requests from users. Setting your status to "Inactive"
              will hide your profile from the network, and you won't receive new meeting requests.
            </p>
          </div>
        </div>
      )}
      
      {/* All Hosts Tab */}
      {activeTab === 'hosts' && (
        <div className="hosts-tab-content">
          <div className="host-network-header">
            <h1>Professional Host Network</h1>
            <p>Browse all active professional hosts in the network</p>
          </div>

          <div className="host-network-actions">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, bio, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button className="filter-toggle" onClick={toggleFilters}>
              <FaFilter /> Filters
            </button>
          </div>
          
          <div className={`filters-container ${showFilters ? 'show' : ''}`}>
            <div className="expertise-filter">
              <label htmlFor="expertise-select">Filter by expertise:</label>
              <select 
                id="expertise-select"
                value={expertiseFilter} 
                onChange={(e) => setExpertiseFilter(e.target.value)}
              >
                <option value="">All Expertise Areas</option>
                {uniqueExpertise.map((expertise, index) => (
                  <option key={index} value={expertise}>{expertise}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredHosts.length === 0 ? (
            <div className="no-hosts">
              <p>No hosts match your current filters. Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="host-cards-grid">
              {filteredHosts.map((host) => (
                <div className="host-card" key={host.hostID}>
                  <div className="host-card-header">
                    <div className="host-avatar">
                      {host.avatar ? (
                        <img src={host.avatar} alt={`${host.name}'s profile`} />
                      ) : (
                        <div className="default-avatar">
                          {host.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="host-info">
                      <h2>{host.name}</h2>
                      <div className="host-location">
                        <FaMapMarkerAlt /> {host.location}
                      </div>
                      <div className="host-rating">
                        <FaStar className="star-icon" />
                        <span>{host.rating > 0 ? host.rating.toFixed(1) : 'New'}</span>
                        <span className="review-count">
                          ({host.totalReviews || 0} review{host.totalReviews !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="host-expertise">
                    <span className="expertise-tag">{host.expertise}</span>
                    <span className="experience-tag">{host.experience} experience</span>
                  </div>
                  
                  <div className="host-bio">
                    <p>{host.bio.length > 150 ? `${host.bio.substring(0, 150)}...` : host.bio}</p>
                  </div>
                  
                  <div className="host-social-links">
                    {host.socialMedia && host.socialMedia.linkedin && (
                      <a href={host.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                        <FaLinkedin />
                      </a>
                    )}
                    {host.socialMedia && host.socialMedia.twitter && (
                      <a href={host.socialMedia.twitter} target="_blank" rel="noopener noreferrer" title="Twitter">
                        <FaTwitter />
                      </a>
                    )}
                    {host.socialMedia && host.socialMedia.facebook && (
                      <a href={host.socialMedia.facebook} target="_blank" rel="noopener noreferrer" title="Facebook">
                        <FaFacebook />
                      </a>
                    )}
                    {host.socialMedia && host.socialMedia.instagram && (
                      <a href={host.socialMedia.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
                        <FaInstagram />
                      </a>
                    )}
                    <a href={`mailto:${host.email}`} className="email-link" title="Email">
                      <MdEmail />
                    </a>
                  </div>
                  
                  <div className="host-actions">
                    <button 
                      className="request-meeting-btn"
                      onClick={() => requestMeeting(host.hostID)}
                    >
                      <MdOutlineMessage /> Request Meeting
                    </button>
                    <button 
                      className="view-profile-link"
                      onClick={() => viewHostProfile(host.hostID)}
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="network-info-section">
            <h3>About the Host Network</h3>
            <p>
              Our professional host network consists of highly qualified individuals who are ready to assist
              with your meetings and visit requirements. All hosts shown here have set their status to "active"
              and are available for new meeting requests.
            </p>
            <p>
              When you request a meeting with a host, they will receive a notification and can accept or
              reschedule based on their availability.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostNetwork;