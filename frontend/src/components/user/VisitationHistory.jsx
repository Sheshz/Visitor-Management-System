function VisitationHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
  
    useEffect(() => {
      const fetchVisitationHistory = async () => {
        setLoading(true);
        const token = localStorage.getItem("authToken");
  
        try {
          const response = await fetch("http://localhost:5000/api/meetings/history", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
  
          if (response.ok) {
            const data = await response.json();
            setHistory(data);
          } else {
            console.error("Failed to fetch visitation history");
          }
        } catch (err) {
          console.error("Error fetching visitation history:", err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchVisitationHistory();
    }, []);
  
    // Filter history based on status and search term
    const filteredHistory = history.filter((visit) => {
      const matchesFilter = filter === "all" || visit.status.toLowerCase() === filter;
      const matchesSearch = 
        visit.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (visit.location && visit.location.toLowerCase().includes(searchTerm.toLowerCase()));
  
      return matchesFilter && matchesSearch;
    });
  
    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  
    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };
  
    // Format date for display
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };
  
    if (loading) return <LoadingSpinner />;
  
    return (
      <div className="visitation-history-container">
        <div className="history-header">
          <h2>Your Visitation History</h2>
          <div className="history-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by host, purpose, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-options">
              <button 
                className={`filter-button ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button 
                className={`filter-button ${filter === "completed" ? "active" : ""}`}
                onClick={() => setFilter("completed")}
              >
                Completed
              </button>
              <button 
                className={`filter-button ${filter === "upcoming" ? "active" : ""}`}
                onClick={() => setFilter("upcoming")}
              >
                Upcoming
              </button>
              <button 
                className={`filter-button ${filter === "cancelled" ? "active" : ""}`}
                onClick={() => setFilter("cancelled")}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>
  
        {filteredHistory.length === 0 ? (
          <div className="empty-history">
            <p>No visitation records found. Your meeting history will appear here.</p>
          </div>
        ) : (
          <>
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Host</th>
                    <th>Date & Time</th>
                    <th>Purpose</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((visit) => (
                    <tr key={visit._id} className={`status-${visit.status.toLowerCase()}`}>
                      <td>
                        <div className="host-info">
                          <img 
                            src={visit.hostAvatar || "https://via.placeholder.com/40"} 
                            alt={visit.hostName} 
                            className="host-avatar-small" 
                          />
                          <span>{visit.hostName}</span>
                        </div>
                      </td>
                      <td>{formatDate(visit.scheduledTime)}</td>
                      <td>{visit.purpose}</td>
                      <td>{visit.location || "Virtual"}</td>
                      <td>
                        <span className={`status-badge ${visit.status.toLowerCase()}`}>
                          {visit.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="view-button">View Details</button>
                          {visit.status === "upcoming" && (
                            <button className="cancel-button">Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
  
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`pagination-button ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
  export default VisitationHistory;
