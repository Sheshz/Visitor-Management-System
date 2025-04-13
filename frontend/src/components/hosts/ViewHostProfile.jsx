import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SessionManager } from "../../utils/SessionManager";
import { 
  FaMapMarkerAlt, 
  FaStar, 
  FaLinkedin, 
  FaTwitter, 
  FaFacebook, 
  FaInstagram, 
  FaArrowLeft 
} from "react-icons/fa";
import { 
  MdEmail, 
  MdOutlineMessage,
  MdComment
} from "react-icons/md";
import { AiOutlineStar, AiOutlineClockCircle } from "react-icons/ai";
import "../../CSS/ViewHostProfile.css";

const ViewHostProfile = () => {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [reviewSectionRef, setReviewSectionRef] = useState(null);

  useEffect(() => {
    // Fetch host details and reviews
    fetchHostDetails();
  }, [hostId]);

  // Handle scrolling to reviews section if requested via URL hash
  useEffect(() => {
    if (window.location.hash === '#reviews' && reviewSectionRef) {
      reviewSectionRef.scrollIntoView({ behavior: 'smooth' });
    }
  }, [reviewSectionRef, host]);

  const fetchHostDetails = async () => {
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
      
      // Make API request to get host details
      const response = await fetch(`http://localhost:5000/api/hosts/${hostId}`, {
        method: 'GET',
        headers: config.headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch host details');
      }
      
      const data = await response.json();
      setHost(data);
      
      // Fetch comments/reviews for this host
      fetchHostComments(hostId);
      
    } catch (err) {
      console.error('Error fetching host details:', err);
      setError('Failed to load host profile. Please try again later.');
    } finally {
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
      const response = await fetch(`http://localhost:5000/api/reviews/host/${hostId}`, {
        method: 'GET',
        headers: config.headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch host reviews');
      }
      
      const data = await response.json();
      setComments(data);
      
    } catch (err) {
      console.error('Error fetching host comments:', err);
      // Don't set error state, as this is not a critical function
    } finally {
      setCommentsLoading(false);
    }
  };

  // Function to request a meeting with the host
  const requestMeeting = () => {
    navigate(`/host-dashboard/meeting?hostId=${hostId}`);
  };

  // Return to hosts list
  const goBack = () => {
    navigate('/host-dashboard/network');
  };

  if (loading) {
    return (
      <div className="view-host-profile loading-container">
        <div className="loading-spinner"></div>
        <p>Loading host profile...</p>
      </div>
    );
  }

  if (error || !host) {
    return (
      <div className="view-host-profile error-container">
        <div className="error-message">{error || 'Host not found'}</div>
        <button className="back-button" onClick={goBack}>
          <FaArrowLeft /> Back to Host Network
        </button>
      </div>
    );
  }

  return (
    <div className="view-host-profile-container">
      <div className="profile-navigation">
        <button className="back-button" onClick={goBack}>
          <FaArrowLeft /> Back to Host Network
        </button>
      </div>

      <div className="host-profile-header">
        <div className="host-avatar-container">
          <div className="host-avatar">
            {host.avatar ? (
              <img src={host.avatar} alt={`${host.name}'s profile`} />
            ) : (
              <div className="default-avatar">
                {host.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className={`status-indicator ${host.isActive ? 'active' : 'inactive'}`}>
            {host.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        <div className="host-info-header">
          <h1>{host.name}</h1>
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
          <div className="host-tags">
            <span className="expertise-tag">{host.expertise}</span>
            <span className="experience-tag">{host.experience} experience</span>
          </div>
          <div className="host-actions">
            <button className="request-meeting-btn" onClick={requestMeeting}>
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
            <p>{host.bio}</p>
          </section>

          <section className="host-details-section">
            <h2>Experience</h2>
            <p>{host.experience}</p>
          </section>

          <section className="host-social-section">
            <h2>Contact & Social Media</h2>
            <div className="host-social-links">
              {host.socialMedia && host.socialMedia.linkedin && (
                <div className="social-link-container">
                  <a href={host.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                    <FaLinkedin className="social-icon" />
                    <span className="social-text">LinkedIn</span>
                  </a>
                </div>
              )}
              {host.socialMedia && host.socialMedia.twitter && (
                <div className="social-link-container">
                  <a href={host.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                    <FaTwitter className="social-icon" />
                    <span className="social-text">Twitter</span>
                  </a>
                </div>
              )}
              {host.socialMedia && host.socialMedia.facebook && (
                <div className="social-link-container">
                  <a href={host.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                    <FaFacebook className="social-icon" />
                    <span className="social-text">Facebook</span>
                  </a>
                </div>
              )}
              {host.socialMedia && host.socialMedia.instagram && (
                <div className="social-link-container">
                  <a href={host.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                    <FaInstagram className="social-icon" />
                    <span className="social-text">Instagram</span>
                  </a>
                </div>
              )}
              <div className="social-link-container">
                <a href={`mailto:${host.email}`} className="social-link email">
                  <MdEmail className="social-icon" />
                  <span className="social-text">{host.email}</span>
                </a>
              </div>
            </div>
          </section>
        </div>

        <section 
          id="reviews" 
          className="host-reviews-section"
          ref={ref => setReviewSectionRef(ref)}
        >
          <div className="section-header">
            <MdComment className="section-icon" /> 
            <h2>User Feedback and Reviews</h2>
          </div>
          
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
};

export default ViewHostProfile;