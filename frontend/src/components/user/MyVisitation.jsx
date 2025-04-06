import React, { useState, useEffect } from 'react';
import { Eye, CheckSquare, FileText, CheckCircle, ClipboardList, Calendar, UserX } from 'lucide-react';
import '../../CSS/MyVisitation.css';

const MyVisitation = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVisitors, setSelectedVisitors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    // Fetch visitor data when component mounts or tab changes
    fetchVisitorData();
  }, [activeTab]);

  const fetchVisitorData = async () => {
    try {
      setLoading(true);
      
      // Get the token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Determine API endpoint based on active tab
      const endpoint = activeTab === 'history' 
        ? 'http://localhost:5000/api/visitors'
        : 'http://localhost:5000/api/visitors/recent?status=rejected';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Server returned HTML instead of JSON. You may need to log in again.');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }
      
      const data = await response.json();
      setVisitors(data);
      setSelectedVisitors([]);
      setCurrentPage(1);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching visitor data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const toggleSelectVisitor = (id) => {
    setSelectedVisitors(prev => 
      prev.includes(id) 
        ? prev.filter(visitorId => visitorId !== id) 
        : [...prev, id]
    );
  };

  const selectAllVisitors = () => {
    if (selectedVisitors.length === currentVisitors.length) {
      setSelectedVisitors([]);
    } else {
      setSelectedVisitors(currentVisitors.map(visitor => visitor.id));
    }
  };

  const generateReport = async () => {
    try {
      const selectedData = visitors.filter(visitor => selectedVisitors.includes(visitor.id));
      
      if (selectedData.length === 0) {
        alert('Please select at least one visitor to generate report');
        return;
      }

      // Create a CSV string from the data
      const headers = ['Name', 'Phone', 'Email', 'Purpose', 'Visit Date', 'Status'];
      const csvContent = [
        headers.join(','),
        ...selectedData.map(visitor => [
          visitor.name,
          visitor.phone,
          visitor.email,
          visitor.purpose,
          new Date(visitor.visitDate).toLocaleString(),
          visitor.status
        ].join(','))
      ].join('\n');

      // Create a downloadable link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `visitor-report-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report. Please try again.');
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVisitors = visitors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(visitors.length / itemsPerPage);

  // Format date and time nicely
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    };
  };

  if (loading) return (
    <div className="my-visitation-container">
      <h1>My Visitation</h1>
      <div className="loading">Loading visitor data...</div>
    </div>
  );
  
  if (error) return (
    <div className="my-visitation-container">
      <h1>My Visitation</h1>
      <div className="error">Error: {error}</div>
    </div>
  );

  return (
    <div className="my-visitation-container">
      <h1>My Visitation</h1>
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          Visitor History
        </button>
        <button 
          className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => handleTabChange('rejected')}
        >
          Rejected Visitors
        </button>
      </div>
      
      <div className="action-bar">
        <div className="selection-controls">
          <button 
            className="select-all-btn" 
            onClick={selectAllVisitors}
            disabled={visitors.length === 0}
          >
            <CheckCircle size={16} />
            {selectedVisitors.length === currentVisitors.length && currentVisitors.length > 0
              ? 'Unselect All' 
              : 'Select All'}
          </button>
          <span className="selected-count">
            {selectedVisitors.length} visitors selected
          </span>
        </div>
        
        <button 
          className="generate-report-btn"
          onClick={generateReport}
          disabled={selectedVisitors.length === 0}
        >
          <FileText size={16} />
          Generate Report
        </button>
      </div>
      
      <div className="visitors-table-container">
        <table className="visitors-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input 
                  type="checkbox" 
                  checked={selectedVisitors.length === currentVisitors.length && currentVisitors.length > 0}
                  onChange={selectAllVisitors}
                  disabled={visitors.length === 0}
                />
              </th>
              <th>VISITOR</th>
              <th>HOST</th>
              <th>PURPOSE</th>
              <th>DATE & TIME</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentVisitors.length > 0 ? (
              currentVisitors.map(visitor => {
                const dateTime = formatDateTime(visitor.visitDate);
                const initials = visitor.name.split(' ').map(n => n[0]).join('').toUpperCase();
                
                return (
                  <tr key={visitor.id} className={selectedVisitors.includes(visitor.id) ? 'selected' : ''}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedVisitors.includes(visitor.id)}
                        onChange={() => toggleSelectVisitor(visitor.id)}
                      />
                    </td>
                    <td>
                      <div className="visitor-info">
                        <div className="avatar">{initials}</div>
                        <div>
                          <div className="visitor-name">{visitor.name}</div>
                          <div className="email">{visitor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{visitor.host || 'Not specified'}</td>
                    <td>{visitor.purpose}</td>
                    <td>
                      {dateTime.date}<br />
                      <span className="time">{dateTime.time}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${visitor.status.toLowerCase()}`}>
                        {visitor.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="action-btn view">
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                        {visitor.status === 'Scheduled' && (
                          <button className="action-btn check-in">
                            <CheckSquare size={16} />
                            <span>Check In</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="no-data-row">
                <td colSpan="7" className="no-data-cell">
                  <div className="no-data-message">
                    <div className="no-data-icon">
                      {activeTab === 'history' ? 
                        <ClipboardList size={28} /> : 
                        <UserX size={28} />
                      }
                    </div>
                    <div className="no-data-text">
                      No {activeTab === 'history' ? 'visitor history' : 'rejected visitors'} found
                    </div>
                    <div className="no-data-subtext">
                      {activeTab === 'history' 
                        ? 'When visitors check in, they will appear here.' 
                        : 'Any rejected visitor requests will be displayed here.'}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVisitation;