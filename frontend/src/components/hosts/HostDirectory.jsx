import React, { useState, useEffect } from 'react';
import { FaStar, FaSearch, FaMapMarkerAlt, FaTimes, FaExclamationTriangle, FaCalendarAlt, FaClock, FaUserFriends, FaBriefcase, FaArrowLeft, FaUserCheck, FaRocketchat, FaThumbsUp, FaThumbsDown, FaComment } from 'react-icons/fa';
import apiClient, { apiHelper } from '../../utils/apiClient';
import '../../CSS/HostDirectory.css';


const HostDirectory = () => {
  const [hosts, setHosts] = useState([]);
  const [filteredHosts, setFilteredHosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedHost, setSelectedHost] = useState(null);
  const [selectedTab, setSelectedTab] = useState('about');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Default avatar as fallback for broken image links
  const defaultAvatarSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23E0E0E0'/%3E%3Ccircle cx='50' cy='35' r='20' fill='%23AEAEAE'/%3E%3Cpath d='M25,85 Q50,65 75,85' fill='%23AEAEAE'/%3E%3C/svg%3E`;

  // Fetch all available hosts on component mount
  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the API helper to try multiple endpoints for fetching hosts
      const hostData = await apiHelper.tryAlternateEndpoints([
        '/api/hosts/available',
        '/api/hosts/active',
        '/api/hosts',
        '/api/users/hosts/available'
      ], []);
      
      if (!Array.isArray(hostData) || hostData.length === 0) {
        setError('No hosts available at this time.');
        setHosts([]);
        setFilteredHosts([]);
      } else {
        // Sort hosts by rating in descending order, with new hosts at the end
        const sortedHosts = hostData.sort((a, b) => {
          if (!a.rating && !b.rating) return 0;
          if (!a.rating) return 1;
          if (!b.rating) return -1;
          return b.rating - a.rating;
        });
        setHosts(sortedHosts);
        setFilteredHosts(sortedHosts);
      }
    } catch (err) {
      console.error('Error fetching hosts:', err);
      setError('Could not connect to server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Retry fetching from server with token refresh
  const retryFetch = async () => {
    setIsRetrying(true);
    
    // Refresh token first in case that's the issue
    await apiHelper.refreshTokenIfNeeded();
    
    fetchHosts().finally(() => setIsRetrying(false));
  };

  // Filter hosts based on search term and selected filter
  useEffect(() => {
    if (!hosts || hosts.length === 0) return;
    
    let filtered = [...hosts];
    
    // Apply category filter first
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(host => 
        host.specialties && 
        Array.isArray(host.specialties) && 
        host.specialties.some(specialty => 
          specialty && specialty.toLowerCase() === selectedFilter.toLowerCase()
        )
      );
    }
    
    // Then apply search term
    if (searchTerm.trim() !== '') {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(host => 
        (host.name && host.name.toLowerCase().includes(searchTermLower)) ||
        (host.specialties && Array.isArray(host.specialties) && 
          host.specialties.some(specialty => 
            specialty && specialty.toLowerCase().includes(searchTermLower)
          )
        ) ||
        (host.location && host.location.toLowerCase().includes(searchTermLower)) ||
        (host.title && host.title.toLowerCase().includes(searchTermLower))
      );
    }
    
    setFilteredHosts(filtered);
  }, [searchTerm, hosts, selectedFilter]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Handle filter selection
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  // Navigate to appointment booking page for a specific host
  const handleBookAppointment = (hostId) => {
    // You might want to use a router navigation here in a real app
    console.log(`Booking appointment with host ${hostId}`);
  };

  // Get all unique specialties for filter categories
  const getUniqueSpecialties = () => {
    if (!hosts || hosts.length === 0) return [];
    
    const allSpecialties = hosts.reduce((acc, host) => {
      if (host.specialties && Array.isArray(host.specialties)) {
        return [...acc, ...host.specialties];
      }
      return acc;
    }, []);
    
    return [...new Set(allSpecialties)].filter(Boolean).sort();
  };

  // View host profile
  const viewHostProfile = async (hostId) => {
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      // Find host in already loaded hosts first
      const hostFromList = hosts.find(h => h._id === hostId);
      
      if (hostFromList && Object.keys(hostFromList).length > 5) {
        // If host data seems complete enough, use it directly
        setSelectedHost(hostFromList);
      } else {
        // Otherwise fetch detailed host data
        const hostData = await apiHelper.tryAlternateEndpoints([
          `/api/hosts/${hostId}`,
          `/api/hosts/details/${hostId}`,
          `/api/users/hosts/${hostId}`
        ], null);
        
        if (!hostData) {
          setProfileError('Host information not available at this time.');
        } else {
          setSelectedHost(hostData);
        }
      }
    } catch (err) {
      console.error('Error fetching host details:', err);
      setProfileError('Could not retrieve host information. Please try again later.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Go back to directory
  const handleBackToDirectory = () => {
    setSelectedHost(null);
    setSelectedTab('about');
    setProfileError(null);
    setShowFeedbackForm(false);
  };

  // Contact host
  const handleContactHost = (hostId) => {
    console.log(`Contacting host ${hostId}`);
  };

  // Submit feedback for a host
  const handleFeedbackSubmit = async (type) => {
    if (!selectedHost) return;
    
    try {
      // In a real app, you would send this to your API
      console.log(`Submitting ${type} feedback for host ${selectedHost._id}: ${feedbackMessage}`);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success message
      alert(`Thank you for your feedback!`);
      
      // Reset form
      setFeedbackMessage('');
      setShowFeedbackForm(false);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  // Render loading state
  if (isLoading && !isRetrying) {
    return (
      <div className="HostDirectoryLoading">
        <div className="HostDirectoryLoadingSpinner"></div>
        <p>Loading available hosts...</p>
      </div>
    );
  }

  // If a host is selected, render the host profile view
  if (selectedHost) {
    if (profileLoading) {
      return (
        <div className="HostProfileLoading">
          <div className="HostProfileLoadingSpinner"></div>
          <p>Loading host profile...</p>
        </div>
      );
    }

    if (profileError) {
      return (
        <div className="HostProfileError">
          <div className="HostProfileErrorContent">
            <FaExclamationTriangle className="HostProfileErrorIcon" />
            <h2>Error Loading Profile</h2>
            <p>{profileError}</p>
          </div>
          <div className="HostProfileErrorActions">
            <button className="HostProfileBackButton" onClick={handleBackToDirectory}>
              <FaArrowLeft /> Back to Directory
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="HostProfileContainer">
        <div className="HostProfileBackNavigation">
          <button className="HostProfileBackButton" onClick={handleBackToDirectory}>
            <FaArrowLeft /> Back to Directory
          </button>
        </div>
        
        <div className="HostProfileHeader">
          <div className="HostProfileHeaderContent">
            <div className="HostProfileAvatarContainer">
              <img 
                src={selectedHost.avatar || defaultAvatarSvg}
                alt={`${selectedHost.name}'s profile`}
                onError={(e) => {e.target.onerror = null; e.target.src = defaultAvatarSvg}}
                className="HostProfileAvatar"
              />
              {selectedHost.isActive && <span className="HostProfileStatusBadge">Available</span>}
            </div>
            
            <div className="HostProfileBasicInfo">
              <h1 className="HostProfileName">{selectedHost.name}</h1>
              <p className="HostProfileTitle">{selectedHost.title || selectedHost.expertise || 'Professional Host'}</p>
              
              {selectedHost.location && (
                <div className="HostProfileLocation">
                  <FaMapMarkerAlt className="HostProfileIcon" />
                  <span>{selectedHost.location}</span>
                </div>
              )}
              
              <div className="HostProfileRatingContainer">
                <div className="HostProfileRating">
                  <FaStar className="HostProfileStarIcon" />
                  <span>{selectedHost.rating ? parseFloat(selectedHost.rating).toFixed(1) : 'New'}</span>
                  {selectedHost.totalReviews > 0 && (
                    <span className="HostProfileReviewCount">
                      ({selectedHost.totalReviews} review{selectedHost.totalReviews !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
                
                {selectedHost.verificationStatus && (
                  <div className="HostProfileVerification">
                    <FaUserCheck className="HostProfileIcon" />
                    <span>Verified Professional</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="HostProfileActions">
              <button className="HostProfileBookButton" onClick={() => handleBookAppointment(selectedHost._id)}>
                Book Appointment
              </button>
              <button className="HostProfileContactButton" onClick={() => handleContactHost(selectedHost._id)}>
                <FaRocketchat /> Contact Host
              </button>
            </div>
          </div>
        </div>
        
        <div className="HostProfileTabs">
          <button 
            className={`HostProfileTab ${selectedTab === 'about' ? 'active' : ''}`} 
            onClick={() => setSelectedTab('about')}
          >
            About
          </button>
          <button 
            className={`HostProfileTab ${selectedTab === 'services' ? 'active' : ''}`} 
            onClick={() => setSelectedTab('services')}
          >
            Services
          </button>
          <button 
            className={`HostProfileTab ${selectedTab === 'reviews' ? 'active' : ''}`} 
            onClick={() => setSelectedTab('reviews')}
          >
            Reviews
          </button>
          <button 
            className={`HostProfileTab ${selectedTab === 'availability' ? 'active' : ''}`} 
            onClick={() => setSelectedTab('availability')}
          >
            Availability
          </button>
          <button 
            className={`HostProfileTab ${selectedTab === 'feedback' ? 'active' : ''}`} 
            onClick={() => setSelectedTab('feedback')}
          >
            Feedback
          </button>
        </div>
        
        <div className="HostProfileContent">
          {selectedTab === 'about' && (
            <div className="HostProfileAbout">
              <div className="HostProfileSection">
                <h2 className="HostProfileSectionTitle">About Me</h2>
                <p className="HostProfileBio">
                  {selectedHost.bio || selectedHost.description || "This host hasn't added a bio yet."}
                </p>
              </div>
              
              <div className="HostProfileSection">
                <h2 className="HostProfileSectionTitle">Expertise</h2>
                <div className="HostProfileSpecialties">
                  {selectedHost.specialties && selectedHost.specialties.length > 0 ? (
                    selectedHost.specialties.map((specialty, index) => (
                      <span key={index} className="HostProfileSpecialtyTag">{specialty}</span>
                    ))
                  ) : (
                    <p>No specialties listed</p>
                  )}
                </div>
              </div>
              
              <div className="HostProfileDetailsGrid">
                <div className="HostProfileDetailCard">
                  <div className="HostProfileDetailIcon">
                    <FaBriefcase />
                  </div>
                  <div className="HostProfileDetailContent">
                    <h3>Experience</h3>
                    <p>{selectedHost.experience || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="HostProfileDetailCard">
                  <div className="HostProfileDetailIcon">
                    <FaClock />
                  </div>
                  <div className="HostProfileDetailContent">
                    <h3>Session Length</h3>
                    <p>{selectedHost.sessionLength ? `${selectedHost.sessionLength} minutes` : "Not specified"}</p>
                  </div>
                </div>
                
                <div className="HostProfileDetailCard">
                  <div className="HostProfileDetailIcon">
                    <FaCalendarAlt />
                  </div>
                  <div className="HostProfileDetailContent">
                    <h3>Next Available</h3>
                    <p>{selectedHost.nextAvailability || "Check availability calendar"}</p>
                  </div>
                </div>
                
                {selectedHost.languages && (
                  <div className="HostProfileDetailCard">
                    <div className="HostProfileDetailIcon">
                      <FaRocketchat />
                    </div>
                    <div className="HostProfileDetailContent">
                      <h3>Languages</h3>
                      <p>{Array.isArray(selectedHost.languages) ? selectedHost.languages.join(', ') : selectedHost.languages}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {selectedTab === 'services' && (
            <div className="HostProfileServices">
              <h2 className="HostProfileSectionTitle">Services Offered</h2>
              
              {selectedHost.services && selectedHost.services.length > 0 ? (
                <div className="HostProfileServicesGrid">
                  {selectedHost.services.map((service, index) => (
                    <div key={index} className="HostProfileServiceCard">
                      <h3 className="HostProfileServiceTitle">{service.name}</h3>
                      <p className="HostProfileServiceDescription">{service.description}</p>
                      
                      {service.duration && (
                        <div className="HostProfileServiceDetail">
                          <FaClock className="HostProfileServiceIcon" />
                          <span>{service.duration} minutes</span>
                        </div>
                      )}
                      
                      {service.price && (
                        <div className="HostProfileServicePrice">
                          ${service.price}
                          {service.priceType && <span className="HostProfileServicePriceType">/{service.priceType}</span>}
                        </div>
                      )}
                      
                      <button 
                        className="HostProfileServiceBookButton" 
                        onClick={() => handleBookAppointment(selectedHost._id)}
                      >
                        Book This Service
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="HostProfileNoContent">This host hasn't added any services yet.</p>
              )}
            </div>
          )}
          
          {selectedTab === 'reviews' && (
            <div className="HostProfileReviews">
              <div className="HostProfileReviewsHeader">
                <h2 className="HostProfileSectionTitle">Client Reviews</h2>
                
                <div className="HostProfileRatingSummary">
                  <div className="HostProfileRatingNumber">
                    <FaStar className="HostProfileStarIconLarge" />
                    <span>{selectedHost.rating ? parseFloat(selectedHost.rating).toFixed(1) : 'New'}</span>
                  </div>
                  <div className="HostProfileRatingText">
                    <p>Based on {selectedHost.totalReviews || 0} review{selectedHost.totalReviews !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
              
              {selectedHost.reviews && selectedHost.reviews.length > 0 ? (
                <div className="HostProfileReviewsList">
                  {selectedHost.reviews.map((review, index) => (
                    <div key={index} className="HostProfileReviewCard">
                      <div className="HostProfileReviewHeader">
                        <div className="HostProfileReviewerInfo">
                          <img 
                            src={review.reviewerAvatar || defaultAvatarSvg}
                            alt={`${review.reviewerName}'s avatar`}
                            className="HostProfileReviewerAvatar"
                            onError={(e) => {e.target.onerror = null; e.target.src = defaultAvatarSvg}}
                          />
                          <div>
                            <h3 className="HostProfileReviewerName">{review.reviewerName}</h3>
                            <p className="HostProfileReviewDate">{review.date}</p>
                          </div>
                        </div>
                        <div className="HostProfileReviewRating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar 
                              key={i} 
                              className={`HostProfileReviewStar ${i < review.rating ? 'filled' : 'empty'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="HostProfileReviewContent">{review.content}</p>
                      
                      {review.hostReply && (
                        <div className="HostProfileReviewReply">
                          <h4 className="HostProfileReplyHeader">Host Response:</h4>
                          <p className="HostProfileReplyContent">{review.hostReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="HostProfileNoContent">No reviews yet. Be the first to leave a review!</p>
              )}
            </div>
          )}
          
          {selectedTab === 'availability' && (
            <div className="HostProfileAvailability">
              <h2 className="HostProfileSectionTitle">Host Availability</h2>
              
              {selectedHost.availabilityCalendar ? (
                <div className="HostProfileCalendarContainer">
                  {/* Calendar component would go here */}
                  <p className="HostProfileCalendarPlaceholder">
                    Calendar integration coming soon. For now, please book an appointment to see available times.
                  </p>
                </div>
              ) : (
                <div className="HostProfileAvailabilityMessage">
                  <p>
                    {selectedHost.nextAvailability 
                      ? `Next available: ${selectedHost.nextAvailability}`
                      : "Please book an appointment to see available times."
                    }
                  </p>
                  <button className="HostProfileBookButton" onClick={() => handleBookAppointment(selectedHost._id)}>
                    Book Appointment
                  </button>
                </div>
              )}
              
              {selectedHost.availabilityNotes && (
                <div className="HostProfileAvailabilityNotes">
                  <h3>Availability Notes</h3>
                  <p>{selectedHost.availabilityNotes}</p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'feedback' && (
            <div className="HostProfileFeedback">
              <h2 className="HostProfileSectionTitle">Provide Feedback</h2>
              
              <div className="HostProfileFeedbackSection">
                <h3>Previous Feedback</h3>
                
                {selectedHost.feedback && selectedHost.feedback.length > 0 ? (
                  <div className="HostProfileFeedbackList">
                    {selectedHost.feedback.map((item, index) => (
                      <div key={index} className="HostProfileFeedbackItem">
                        <div className="HostProfileFeedbackHeader">
                          <span className={`HostProfileFeedbackType ${item.type}`}>
                            {item.type === 'positive' ? <FaThumbsUp /> : <FaThumbsDown />}
                            <span>{item.type === 'positive' ? 'Positive' : 'Needs Improvement'}</span>
                          </span>
                          <span className="HostProfileFeedbackDate">{item.date}</span>
                        </div>
                        <p className="HostProfileFeedbackContent">{item.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="HostProfileNoContent">No feedback has been submitted yet.</p>
                )}

                <div className="HostProfileFeedbackActions">
                  <button className="HostProfileFeedbackButton" onClick={() => setShowFeedbackForm(true)}>
                    <FaComment /> Leave Feedback
                  </button>
                </div>
              </div>
              
              {showFeedbackForm && (
                <div className="HostProfileFeedbackForm">
                  <h3>Your Feedback</h3>
                  <p>Help us improve by sharing your experience with this host</p>
                  
                  <textarea
                    className="HostProfileFeedbackTextarea"
                    placeholder="Share your experience and suggestions..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    rows={4}
                  />
                  
                  <div className="HostProfileFeedbackFormActions">
                    <button 
                      className="HostProfileFeedbackPositiveButton"
                      onClick={() => handleFeedbackSubmit('positive')}
                      disabled={!feedbackMessage.trim()}
                    >
                      <FaThumbsUp /> Positive
                    </button>
                    <button 
                      className="HostProfileFeedbackNegativeButton"
                      onClick={() => handleFeedbackSubmit('negative')}
                      disabled={!feedbackMessage.trim()}
                    >
                      <FaThumbsDown /> Needs Improvement
                    </button>
                    <button 
                      className="HostProfileFeedbackCancelButton"
                      onClick={() => {
                        setShowFeedbackForm(false);
                        setFeedbackMessage('');
                      }}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Otherwise render the host directory
  return (
    <div className="HostDirectoryContainer">
      <header className="HostDirectoryHeader">
        <h1>Find Your Perfect Host</h1>
        <p className="HostDirectorySubheading">Browse our selection of qualified professionals ready to help you</p>
        
        <div className="HostDirectorySearchContainer">
          <FaSearch className="HostDirectorySearchIcon" />
          <input
            type="text"
            placeholder="Search by name, specialty, location, or title..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="HostDirectorySearchInput"
            aria-label="Search hosts"
          />
          {searchTerm && (
            <button 
              className="HostDirectoryClearSearch" 
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
        
        <div className="HostDirectoryCategoriesFilter">
          <button 
            className={`HostDirectoryCategoryButton ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All Categories
          </button>
          
          {getUniqueSpecialties().map(specialty => (
            <button 
              key={specialty}
              className={`HostDirectoryCategoryButton ${selectedFilter === specialty ? 'active' : ''}`}
              onClick={() => handleFilterChange(specialty)}
            >
              {specialty}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div className="HostDirectoryError">
          <div className="HostDirectoryErrorContent">
            <FaExclamationTriangle className="HostDirectoryErrorIcon" />
            <p>{error}</p>
          </div>
          <button 
            className={`HostDirectoryRetryButton ${isRetrying ? 'retrying' : ''}`} 
            onClick={retryFetch}
            disabled={isRetrying}
          >
            {isRetrying ? 'Trying...' : 'Try Again'}
          </button>
        </div>
      )}

      <div className="HostDirectoryContent">
        {isRetrying && (
          <div className="HostDirectoryOverlayLoading">
            <div className="HostDirectoryLoadingSpinner"></div>
            <p>Reconnecting to server...</p>
          </div>
        )}
        
        <div className="HostDirectoryResultsSummary">
          {filteredHosts.length > 0 ? (
            <p>Showing {filteredHosts.length} {filteredHosts.length === 1 ? 'host' : 'hosts'} {selectedFilter !== 'all' ? `in ${selectedFilter}` : ''}</p>
          ) : null}
        </div>
        
        {filteredHosts.length === 0 && !error ? (
          <div className="HostDirectoryNoResults">
            <div className="HostDirectoryNoResultsIcon">
              <FaUserFriends size={48} />
            </div>
            <h2>No hosts found</h2>
            <p>We couldn't find any hosts matching your search criteria.</p>
            {(searchTerm || selectedFilter !== 'all') && (
              <button className="HostDirectoryClearFiltersButton" onClick={() => {
                clearSearch();
                handleFilterChange('all');
              }}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="HostDirectoryGrid">
            {filteredHosts.map(host => (
              <div key={host._id} className="HostDirectoryCard">
                <div className="HostDirectoryCardHeader">
                  <div className="HostDirectoryAvatarContainer">
                    <img 
                      src={host.avatar || defaultAvatarSvg}
                      alt={`${host.name}'s profile`}
                      onError={(e) => {e.target.onerror = null; e.target.src = defaultAvatarSvg}}
                      className="HostDirectoryAvatar"
                    />
                    {host.isActive && <span className="HostDirectoryStatusBadge">Available</span>}
                  </div>
                  <div className="HostDirectoryCardInfo">
                    <h2 className="HostDirectoryCardName">{host.name}</h2>
                    <p className="HostDirectoryCardTitle">{host.title || host.expertise || 'Professional Host'}</p>
                    
                    {host.location && (
                      <div className="HostDirectoryCardLocation">
                        <FaMapMarkerAlt className="HostDirectoryLocationIcon" />
                        <span>{host.location}</span>
                      </div>
                    )}
                    
                    <div className="HostDirectoryCardRating">
                      <FaStar className="HostDirectoryStarIcon" />
                      <span>{host.rating ? parseFloat(host.rating).toFixed(1) : 'New'}</span>
                      {host.totalReviews > 0 && (
                        <span className="HostDirectoryReviewCount">
                          ({host.totalReviews} review{host.totalReviews !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="HostDirectoryCardDetails">
                  {host.nextAvailability && (
                    <div className="HostDirectoryAvailability">
                      <FaCalendarAlt className="HostDirectoryDetailIcon" />
                      <span>Next Available: {host.nextAvailability}</span>
                    </div>
                  )}
                  
                  {host.sessionLength && (
                    <div className="HostDirectorySessionLength">
                      <FaClock className="HostDirectoryDetailIcon" />
                      <span>Session: {host.sessionLength} minutes</span>
                    </div>
                  )}
                  
                  {host.experience && (
                    <div className="HostDirectoryExperience">
                      <FaBriefcase className="HostDirectoryDetailIcon" />
                      <span>Experience: {host.experience}</span>
                    </div>
                  )}
                </div>
                
                <div className="HostDirectoryCardSpecialties">
                  {host.specialties && host.specialties.map((specialty, index) => (
                    <span key={index} className="HostDirectorySpecialtyTag">{specialty}</span>
                  ))}
                </div>
                
                <div className="HostDirectoryCardActions">
                  <button 
                    className="HostDirectoryProfileButton"
                    onClick={() => viewHostProfile(host._id)}
                    aria-label={`View ${host.name}'s profile`}
                  >
                    View Profile
                  </button>
                  <button 
                    className="HostDirectoryBookButton"
                    onClick={() => handleBookAppointment(host._id)}
                    aria-label={`Book appointment with ${host.name}`}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDirectory;