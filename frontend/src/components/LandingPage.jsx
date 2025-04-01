import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "../CSS/LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <nav className="nav-container">
          <div className="logo">
            <span className="logo-text">GetePass Pro</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>
          <div className="auth-buttons">
            <Link to="/login" className="btn login-btn">Login</Link>
            <Link to="/register" className="btn register-btn">Register</Link>
          </div>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to GetePass Pro</h1>
          <p className="hero-subtitle">
            Your all-in-one visitor management solution for modern businesses
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn primary-btn">
              Get Started
              <ArrowRight size={18} className="icon-right" />
            </Link>
            <a href="#features" className="btn secondary-btn">
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            {/* Image placeholder - in production, replace with your actual image */}
            <div className="placeholder-text">Dashboard Preview</div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-circle">📊</div>
            </div>
            <h3 className="feature-title">Visitor Analytics</h3>
            <p className="feature-description">
              Track and analyze visitor patterns with detailed analytics and reporting.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-circle">🔐</div>
            </div>
            <h3 className="feature-title">Secure Check-in</h3>
            <p className="feature-description">
              Streamline visitor registration with secure and contactless check-in processes.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-circle">📱</div>
            </div>
            <h3 className="feature-title">Mobile Notifications</h3>
            <p className="feature-description">
              Instant alerts when visitors arrive, with automated host notifications.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-circle">🗓️</div>
            </div>
            <h3 className="feature-title">Appointment Scheduling</h3>
            <p className="feature-description">
              Easily schedule and manage visitor appointments in advance.
            </p>
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-content">
          <h2 className="section-title">About GetePass Pro</h2>
          <p className="about-text">
            GetePass Pro is a comprehensive visitor management system designed to modernize your front desk operations. Our platform helps organizations of all sizes create a secure, efficient, and professional check-in experience.
          </p>
          <p className="about-text">
            Whether you're a corporate office, healthcare facility, educational institution, or government building, GetePass Pro provides the tools you need to manage visitors effectively while maintaining security and compliance.
          </p>
        </div>
        <div className="about-image">
          <div className="image-placeholder">
            <div className="placeholder-text">About Image</div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <h2 className="section-title">Contact Us</h2>
        <div className="contact-container">
          <div className="contact-form">
            <form>
              <div className="form-group">
                <label className="label">Name</label>
                <input type="text" placeholder="Your name" className="input" />
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input type="email" placeholder="Your email" className="input" />
              </div>
              <div className="form-group">
                <label className="label">Message</label>
                <textarea placeholder="Your message" className="textarea" rows="5"></textarea>
              </div>
              <button type="submit" className="btn submit-btn">Send Message</button>
            </form>
          </div>
          <div className="contact-info">
            <h3 className="info-title">Get in Touch</h3>
            <div className="info-item">
              <strong>Email:</strong> info@getepasspro.com
            </div>
            <div className="info-item">
              <strong>Phone:</strong> +1 (555) 123-4567
            </div>
            <div className="info-item">
              <strong>Address:</strong> 123 Business Avenue, Suite 456, Tech City, TC 12345
            </div>
            <div className="social-links">
              <a href="#" className="social-link">Facebook</a>
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">Instagram</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-text">GetePass Pro</span>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-title">Company</h4>
              <a href="#" className="footer-link">About Us</a>
              <a href="#" className="footer-link">Careers</a>
              <a href="#" className="footer-link">Press</a>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Resources</h4>
              <a href="#" className="footer-link">Blog</a>
              <a href="#" className="footer-link">Documentation</a>
              <a href="#" className="footer-link">Support</a>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Legal</h4>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Cookie Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">© {new Date().getFullYear()} GetePass Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;