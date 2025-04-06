import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Make sure this CSS file path is correct
import '../../CSS/HostDirectory.css';

// Updated mock data with reliable avatar URLs
const MOCK_HOSTS = [
  {
    _id: '1',
    name: 'Dr. Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    title: 'Licensed Therapist',
    rating: 4.9,
    location: 'New York, NY',
    specialties: ['Anxiety', 'Depression', 'Stress Management', 'CBT']
  },
  // Add more hosts as needed
];

const HostDirectory = () => {
  const [hosts, setHosts] = useState([]);
  const [filteredHosts, setFilteredHosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  // Default avatar as inline SVG for guaranteed fallback
  const defaultAvatarSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23E0E0E0'/%3E%3Ccircle cx='50' cy='35' r='20' fill='%23AEAEAE'/%3E%3Cpath d='M25,85 Q50,65 75,85' fill='%23AEAEAE'/%3E%3C/svg%3E`;

  // Fetch all available hosts on component mount
  useEffect(() => {
    const fetchHosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/hosts/available');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setHosts(data);
        setFilteredHosts(data);
        setUsingMockData(false);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching hosts:', err);
        
        // Use mock data as fallback
        setHosts(MOCK_HOSTS);
        setFilteredHosts(MOCK_HOSTS);
        setUsingMockData(true);
        setError('Could not connect to server. Displaying sample data.');
        setIsLoading(false);
      }
    };

    fetchHosts();
  }, []);

  // Retry fetching hosts from the server
  const retryFetch = async () => {
    try {
      setIsRetrying(true);
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/hosts/available');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setHosts(data);
      setFilteredHosts(data);
      setUsingMockData(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching hosts on retry:', err);
      setError('Failed to connect to the server. Using sample data instead.');
      setUsingMockData(true);
    } finally {
      setIsRetrying(false);
      setIsLoading(false);
    }
  };

  // Filter hosts based on search term
  useEffect(() => {
    if (!hosts || hosts.length === 0) return;
    
    if (searchTerm.trim() === '') {
      setFilteredHosts(hosts);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = hosts.filter(host => 
        (host.name && host.name.toLowerCase().includes(searchTermLower)) ||
        (host.specialties && Array.isArray(host.specialties) && 
          host.specialties.some(specialty => 
            specialty && specialty.toLowerCase().includes(searchTermLower)
          )
        ) ||
        (host.location && host.location.toLowerCase().includes(searchTermLower)) ||
        (host.title && host.title.toLowerCase().includes(searchTermLower))
      );
      setFilteredHosts(filtered);
    }
  }, [searchTerm, hosts]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Navigate to appointment booking page for a specific host
  const handleBookAppointment = (hostId) => {
    navigate(`/appointments/book/${hostId}`);
  };

  // Render loading state
  if (isLoading && !isRetrying) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading available hosts...</p>
      </div>
    );
  }

  return (
    <div className="host-directory-container">
      <header className="directory-header">
        <h1>Find Your Perfect Host</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, specialty, location, or title..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
            aria-label="Search hosts"
          />
          {searchTerm && (
            <button 
              className="clear-search-button" 
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
          <button className="search-button" aria-label="Search">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </header>

      {/* Improved Error notification */}
      {error && (
        <div className={`notification-bar ${isRetrying ? 'retrying' : ''}`}>
          <div className="notification-content">
            <i className="fas fa-exclamation-triangle notification-icon"></i>
            <p>{error}</p>
          </div>
          {usingMockData && (
            <button 
              className={`retry-button ${isRetrying ? 'retrying' : ''}`} 
              onClick={retryFetch}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <span className="retry-spinner"></span>
                  Connecting...
                </>
              ) : (
                'Try Again'
              )}
            </button>
          )}
        </div>
      )}

      <div className="host-directory-scrollable-content">
        {isRetrying && (
          <div className="overlay-loading">
            <div className="loading-spinner"></div>
            <p>Reconnecting to server...</p>
          </div>
        )}
        
        {filteredHosts.length === 0 ? (
          <div className="no-results">
            <p>No hosts found matching your search criteria.</p>
            {searchTerm && (
              <button className="clear-search-button-large" onClick={clearSearch}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* All Hosts Section */}
            <section className="all-hosts-section">
              <h2>All Available Hosts</h2>
              <div className="hosts-grid">
                {filteredHosts.map(host => (
                  <div key={host._id} className="host-card">
                    <div className="host-card-header">
                      <div className="host-avatar">
                        <img 
                          src={host.avatar || defaultAvatarSvg}
                          alt={`${host.name}'s profile`}
                          onError={(e) => {e.target.onerror = null; e.target.src = defaultAvatarSvg}}
                          className="host-avatar-img"
                        />
                      </div>
                      <div className="host-info">
                        <h3>{host.name}</h3>
                        <p className="host-title">{host.title}</p>
                        {host.location && (
                          <span className="host-location">
                            {host.location}
                          </span>
                        )}
                      </div>
                      <div className="host-rating">
                        <span>{host.rating}</span>
                      </div>
                    </div>
                    <div className="host-specialties">
                      {host.specialties && host.specialties.map((specialty, index) => (
                        <span key={index} className="specialty-tag">{specialty}</span>
                      ))}
                    </div>
                    <div className="host-card-footer">
                      <button 
                        className="view-profile-button"
                        onClick={() => navigate(`/hosts/${host._id}`)}
                      >
                        View Profile
                      </button>
                      <button 
                        className="book-button"
                        onClick={() => handleBookAppointment(host._id)}
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HostDirectory;