import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, HelpCircle, Mail } from "lucide-react";
import "../CSS/NotFound.css";

const NotFound = () => {
  useEffect(() => {
    // Prevent scrolling on this page
    document.body.style.overflow = "hidden";
    
    // Cleanup function
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="not-found-container">
      {/* Background elements */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>
      
      <div className="content-wrapper">
        <div className="error-section">
          <div className="error-code-container">
            <h1 className="error-code">404</h1>
            <div className="error-line"></div>
          </div>
          
          <div className="error-details">
            <h2 className="error-title">Page Not Found</h2>
            <p className="error-message">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            <div className="action-buttons">
              <Link to="/" className="btn primary-btn">
                <Home size={18} />
                <span>Go Home</span>
              </Link>
              <button onClick={() => window.history.back()} className="btn secondary-btn">
                <ArrowLeft size={18} />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="illustration-section">
          <div className="character">
            <div className="character-head">
              <div className="character-face">
                <div className="eyes">
                  <div className="eye"></div>
                  <div className="eye"></div>
                </div>
                <div className="mouth">?</div>
              </div>
            </div>
            <div className="character-body">
              <div className="arm left-arm"></div>
              <div className="arm right-arm"></div>
            </div>
          </div>
          
          <div className="map-wrapper">
            <div className="map-icon">🗺️</div>
          </div>
          
          <div className="location-pin"></div>
        </div>
      </div>
      
      <div className="help-section">
        <p className="help-text">Need help finding your way?</p>
        <div className="help-links">
          <Link to="/" className="help-link">
            <span>Home</span>
          </Link>
          <Link to="/contact" className="help-link">
            <Mail size={14} />
            <span>Contact Us</span>
          </Link>
          <Link to="/help" className="help-link">
            <HelpCircle size={14} />
            <span>Help Center</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;