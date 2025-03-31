function HostDirectory({ hosts }) {
    const [allHosts, setAllHosts] = useState(hosts || []);
    const [filteredHosts, setFilteredHosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [availabilityFilter, setAvailabilityFilter] = useState("all");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [selectedHost, setSelectedHost] = useState(null);
  
    useEffect(() => {
      if (hosts && hosts.length > 0) {
        setAllHosts(hosts);
        setLoading(false);
      } else {
        fetchHosts();
      }
    }, [hosts]);
  
    useEffect(() => {
      applyFilters();
    }, [searchTerm, availabilityFilter, departmentFilter, allHosts]);
  
    const fetchHosts = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");
  
      try {
        const response = await fetch("http://localhost:5000/api/hosts", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
          const data = await response.json();
          setAllHosts(data);
        } else {
          console.error("Failed to fetch hosts");
        }
      } catch (err) {
        console.error("Error fetching hosts:", err);
      } finally {
        setLoading(false);
      }
    };
  
    const applyFilters = () => {
      let results = [...allHosts];
  
      // Apply search term filter
      if (searchTerm) {
        results = results.filter(
          (host) =>
            host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            host.department.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
  
      // Apply availability filter
      if (availabilityFilter !== "all") {
        results = results.filter(
          (host) => host.availability.toLowerCase() === availabilityFilter.toLowerCase()
        );
      }
  
      // Apply department filter
      if (departmentFilter !== "all") {
        results = results.filter(
          (host) => host.department.toLowerCase() === departmentFilter.toLowerCase()
        );
      }
  
      setFilteredHosts(results);
    };
  
    const getDepartments = () => {
      const departments = [...new Set(allHosts.map((host) => host.department))];
      return departments;
    };
  
    const openHostDetails = (host) => {
      setSelectedHost(host);
    };
  
    const closeHostDetails = () => {
      setSelectedHost(null);
    };
  
    const requestMeeting = async (hostId) => {
      // This would open a modal or redirect to a meeting request form
      console.log(`Request meeting with host ID ${hostId}`);
      // Placeholder for actual implementation
    };
  
    if (loading) return <LoadingSpinner />;
  
    return (
      <div className="host-directory-container">
        <div className="directory-header">
          <h2>Host Directory</h2>
          <div className="directory-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search hosts by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-container">
              <div className="filter-group">
                <label>Availability:</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="in meeting">In Meeting</option>
                  <option value="away">Away</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Department:</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Departments</option>
                  {getDepartments().map((dept) => (
                    <option key={dept} value={dept.toLowerCase()}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
  
        {filteredHosts.length === 0 ? (
          <div className="empty-hosts">
            <p>No hosts found matching your criteria.</p>
          </div>
        ) : (
          <div className="hosts-grid">
            {filteredHosts.map((host) => (
              <div key={host.id} className="host-card">
                <div className="host-avatar-container">
                  <img 
                    src={host.avatar || "https://via.placeholder.com/150"} 
                    alt={host.name} 
                    className="host-avatar" 
                  />
                  <span className={`availability-indicator ${host.availability.toLowerCase().replace(/\s+/g, '-')}`}>
                    {host.availability}
                  </span>
                </div>
                
                <div className="host-info">
                  <h3 className="host-name">{host.name}</h3>
                  <p className="host-department">{host.department}</p>
                </div>
                
                <div className="host-actions">
                  <button 
                    className="view-details-btn"
                    onClick={() => openHostDetails(host)}
                  >
                    View Details
                  </button>
                  <button 
                    className={`request-meeting-btn ${host.availability.toLowerCase() !== "available" ? "disabled" : ""}`}
                    onClick={() => requestMeeting(host.id)}
                    disabled={host.availability.toLowerCase() !== "available"}
                  >
                    Request Meeting
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
  
        {selectedHost && (
          <div className="host-details-modal">
            <div className="modal-content">
              <button className="close-modal" onClick={closeHostDetails}>×</button>
              
              <div className="host-details-header">
                <img 
                  src={selectedHost.avatar || "https://via.placeholder.com/150"} 
                  alt={selectedHost.name} 
                  className="modal-host-avatar" 
                />
                <div>
                  <h3>{selectedHost.name}</h3>
                  <p className="host-title">{selectedHost.title || "Not specified"}</p>
                  <p className="host-department">{selectedHost.department}</p>
                  <span className={`availability-badge ${selectedHost.availability.toLowerCase().replace(/\s+/g, '-')}`}>
                    {selectedHost.availability}
                  </span>
                </div>
              </div>
              
              <div className="host-details-body">
                <div className="details-section">
                  <h4>Contact Information</h4>
                  <p><strong>Email:</strong> {selectedHost.email || "Not available"}</p>
                  <p><strong>Phone:</strong> {selectedHost.phone || "Not available"}</p>
                  <p><strong>Office:</strong> {selectedHost.office || "Not available"}</p>
                </div>
                
                <div className="details-section">
                  <h4>About</h4>
                  <p>{selectedHost.bio || "No bio information available."}</p>
                </div>
                
                <div className="details-section">
                  <h4>Available Hours</h4>
                  <p>{selectedHost.hours || "Regular business hours (9:00 AM - 5:00 PM)"}</p>
                </div>
              </div>
              
              <div className="host-details-footer">
                {selectedHost.availability.toLowerCase() === "available" ? (
                  <button 
                    className="request-meeting-btn large"
                    onClick={() => requestMeeting(selectedHost.id)}
                  >
                    Schedule a Meeting
                  </button>
                ) : (
                  <p className="unavailable-message">
                    This host is currently {selectedHost.availability.toLowerCase()}. 
                    Please check back later or contact them via email.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  export default HostDirectory;
