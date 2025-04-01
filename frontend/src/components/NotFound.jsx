import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import "../CSS/NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="action-buttons">
          <Link to="/" className="btn home-btn">
            <Home size={18} />
            <span>Go Home</span>
          </Link>
          <button onClick={() => window.history.back()} className="btn back-btn">
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
      <div className="illustration-container">
        <div className="not-found-illustration">
          {/* This would be replaced with an actual SVG or image in production */}
          <div className="illustration-placeholder">
            <div className="lost-character">
              <div className="character-face">
                <div className="eyes">
                  <div className="eye"></div>
                  <div className="eye"></div>
                </div>
                <div className="mouth">?</div>
              </div>
              <div className="character-body"></div>
            </div>
            <div className="map-icon">🗺️</div>
          </div>
        </div>
      </div>
      <div className="additional-links">
        <p>Having trouble? Try these links:</p>
        <div className="help-links">
          <Link to="/dashboard" className="help-link">Dashboard</Link>
          <Link to="/login" className="help-link">Login</Link>
          <a href="mailto:support@getepasspro.com" className="help-link">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;