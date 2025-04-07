import React from "react";

const HomePage = () => {
  // Define styles as objects for inline CSS
  const styles = {
    // All your existing styles remain the same
    container: {
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #f0f4ff, #e8eeff)",
      padding: "24px",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: "16px",
      marginBottom: "24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
    },
    logo: {
      width: "48px",
      height: "48px",
      background: "#4f46e5",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "bold",
      fontSize: "20px",
    },
    logoText: {
      marginLeft: "12px",
      fontWeight: "600",
      color: "#1e293b",
      fontSize: "20px",
    },
    nav: {
      display: "flex",
      gap: "24px",
    },
    navLink: {
      color: "#4f46e5",
      fontWeight: "500",
      textDecoration: "none",
      transition: "color 0.3s",
    },
    heroSection: {
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
      padding: "32px 40px",
      marginBottom: "24px",
      textAlign: "center",
    },
    heroTitle: {
      fontSize: "32px",
      fontWeight: "bold",
      marginBottom: "16px",
      background: "linear-gradient(to right, #4f46e5, #7e22ce)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      display: "inline-block",
    },
    heroDescription: {
      color: "#64748b",
      marginBottom: "32px",
      fontSize: "18px",
      maxWidth: "600px",
      margin: "0 auto 32px auto",
    },
    buttonContainer: {
      display: "flex",
      flexDirection: "row",
      gap: "16px",
      maxWidth: "400px",
      margin: "0 auto",
      justifyContent: "center",
    },
    primaryButton: {
      padding: "12px 24px",
      background: "#4f46e5",
      color: "white",
      fontWeight: "600",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      textDecoration: "none",
      transition: "background 0.3s",
    },
    secondaryButton: {
      padding: "12px 24px",
      background: "#06b6d4",
      color: "white",
      fontWeight: "600",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      textDecoration: "none",
      transition: "background 0.3s",
    },
    tertiaryButton: {
      padding: "12px 24px",
      background: "#7e22ce",
      color: "white",
      fontWeight: "600",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      textDecoration: "none",
      transition: "background 0.3s",
    },
    section: {
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
      padding: "32px 40px",
    },
    sectionTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "32px",
      textAlign: "center",
      color: "#1e293b",
    },
    featuresGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "24px",
    },
    featureCard: {
      display: "flex",
      padding: "20px",
      background: "#f0f4ff",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
    },
    featureIcon: {
      width: "48px",
      height: "48px",
      background: "#e0e7ff",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#4f46e5",
      marginRight: "16px",
      flexShrink: "0",
    },
    featureTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "8px",
    },
    featureText: {
      color: "#64748b",
      fontSize: "14px",
    },
    stepsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "32px",
    },
    stepItem: {
      textAlign: "center",
    },
    stepNumber: {
      width: "64px",
      height: "64px",
      background: "#e0e7ff",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#4f46e5",
      margin: "0 auto 16px auto",
      fontSize: "24px",
      fontWeight: "bold",
    },
    stepTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "8px",
    },
    stepText: {
      color: "#64748b",
      fontSize: "14px",
    },
    expertsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "24px",
    },
    expertCard: {
      background: "#f0f4ff",
      borderRadius: "12px",
      padding: "20px",
      textAlign: "center",
      border: "1px solid #e2e8f0",
    },
    expertImage: {
      width: "80px",
      height: "80px",
      margin: "0 auto 16px auto",
      overflow: "hidden",
      borderRadius: "50%",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    realImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    expertName: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#1e293b",
    },
    expertSpecialty: {
      color: "#64748b",
      fontSize: "14px",
      marginBottom: "8px",
    },
    ratingContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#eab308",
    },
    ratingText: {
      fontSize: "14px",
      color: "#64748b",
      marginLeft: "4px",
    },
    viewAllButton: {
      display: "inline-block",
      padding: "8px 24px",
      background: "#4f46e5",
      color: "white",
      fontWeight: "600",
      borderRadius: "8px",
      textDecoration: "none",
      transition: "background 0.3s",
      marginTop: "32px",
    },
    gradientSection: {
      background: "linear-gradient(to right, #4f46e5, #7e22ce)",
      borderRadius: "16px",
      padding: "32px",
      marginTop: "24px",
      textAlign: "center",
      color: "white",
    },
    gradientTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "16px",
    },
    gradientText: {
      marginBottom: "24px",
      opacity: "0.9",
      maxWidth: "600px",
      margin: "0 auto 24px auto",
    },
    whiteButton: {
      display: "inline-block",
      padding: "12px 24px",
      background: "white",
      color: "#4f46e5",
      fontWeight: "600",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      textDecoration: "none",
      transition: "background 0.3s",
    },
    outlineButton: {
      padding: "12px 24px",
      background: "transparent",
      border: "2px solid white",
      color: "white",
      fontWeight: "600",
      borderRadius: "8px",
      textDecoration: "none",
      transition: "background 0.3s",
    },
    testimonialsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "24px",
    },
    testimonialCard: {
      background: "#f0f4ff",
      borderRadius: "12px",
      padding: "24px",
      border: "1px solid #e2e8f0",
    },
    testimonialText: {
      color: "#64748b",
      fontStyle: "italic",
      marginBottom: "16px",
    },
    testimonialProfile: {
      display: "flex",
      alignItems: "center",
    },
    profileImage: {
      width: "48px",
      height: "48px",
      marginRight: "16px",
      borderRadius: "50%",
      overflow: "hidden",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    profileName: {
      color: "#1e293b",
      fontWeight: "600",
    },
    profileTitle: {
      color: "#64748b",
      fontSize: "14px",
    },
    footer: {
      marginTop: "40px",
      textAlign: "center",
      color: "#64748b",
      padding: "24px",
    },
    footerGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "32px",
      textAlign: "left",
      marginBottom: "32px",
    },
    footerTitle: {
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "16px",
    },
    footerText: {
      fontSize: "14px",
    },
    footerList: {
      listStyle: "none",
      padding: "0",
      margin: "0",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      fontSize: "14px",
    },
    footerLink: {
      color: "inherit",
      textDecoration: "none",
      transition: "color 0.3s",
    },
    footerBottom: {
      borderTop: "1px solid #e2e8f0",
      paddingTop: "24px",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    policiesLinks: {
      display: "flex",
      gap: "24px",
    },
    policyLink: {
      color: "#4f46e5",
      textDecoration: "none",
      transition: "color 0.3s",
    },
    // Media queries are handled through conditional styling in the JSX
    mobileButtonContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      maxWidth: "400px",
      margin: "0 auto",
      justifyContent: "center",
    },
  };

  // Determine if we're on mobile (simple approach for the example)
  const isMobile = window.innerWidth < 768;

  // Expert profiles with Unsplash images
  const experts = [
    {
      name: "Dr. Sarah Chen",
      specialty: "Cardiologist",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Mark Johnson",
      specialty: "Civil Engineer",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Dr. James Wilson",
      specialty: "Financial Advisor",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Emily Rodriguez",
      specialty: "Life Coach",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    },
  ];

  // Testimonial profiles with Unsplash images
  const testimonials = [
    {
      text: '"GetePass Pro changed my life. I was able to connect with a financial advisor who helped me reorganize my finances and plan for retirement. The platform is so easy to use!"',
      name: "Robert M.",
      title: "Business Owner",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    },
    {
      text: '"As a doctor, GetePass Pro has allowed me to expand my practice and help patients who wouldn\'t otherwise have access to specialized care. The platform is secure and reliable."',
      name: "Dr. Lisa J.",
      title: "Neurologist",
      image:
        "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    },
  ];

  return (
    <div style={styles.container}>
      {/* Modern Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>GP</div>
          <span style={styles.logoText}>GetePass Pro</span>
        </div>

        <nav style={styles.nav}>
          <a href="#features" style={styles.navLink}>
            Features
          </a>
          <a href="#how-it-works" style={styles.navLink}>
            How It Works
          </a>
          <a href="#experts" style={styles.navLink}>
            Our Experts
          </a>
          <a href="#contact" style={styles.navLink}>
            Contact
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>Connect With World-Class Professionals</h1>

        <p style={styles.heroDescription}>
          GetePass Pro connects you with experts across various fields including
          healthcare, engineering, finance, and life coaching for personalized
          consultations and guidance.
        </p>

        <div
          style={
            isMobile ? styles.mobileButtonContainer : styles.buttonContainer
          }
        >
          <a href="/login" style={styles.primaryButton}>
            Sign In
          </a>

          <a href="/register" style={styles.secondaryButton}>
            Create Account
          </a>

          <a href="/host-login" style={styles.tertiaryButton}>
            Expert Portal
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={styles.section}>
        <h2 style={styles.sectionTitle}>Premium Features</h2>

        <div
          style={
            isMobile
              ? { display: "flex", flexDirection: "column", gap: "24px" }
              : styles.featuresGrid
          }
        >
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg
                style={{ width: "24px", height: "24px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 style={styles.featureTitle}>Instant Scheduling</h3>
              <p style={styles.featureText}>
                Book meetings with experts in seconds with our intuitive
                scheduling system and receive instant confirmations.
              </p>
            </div>
          </div>

          <div style={styles.featureCard}>
            <div
              style={{
                ...styles.featureIcon,
                backgroundColor: "#cffafe",
                color: "#0891b2",
              }}
            >
              <svg
                style={{ width: "24px", height: "24px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 style={styles.featureTitle}>Verified Experts</h3>
              <p style={styles.featureText}>
                Connect with thoroughly vetted professionals with verified
                credentials and expertise in their fields.
              </p>
            </div>
          </div>

          <div style={styles.featureCard}>
            <div
              style={{
                ...styles.featureIcon,
                backgroundColor: "#f3e8ff",
                color: "#7e22ce",
              }}
            >
              <svg
                style={{ width: "24px", height: "24px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 style={styles.featureTitle}>Secure Meetings</h3>
              <p style={styles.featureText}>
                End-to-end encrypted video consultations with sophisticated
                privacy controls to protect sensitive discussions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" style={{ ...styles.section, marginTop: "24px" }}>
        <h2 style={styles.sectionTitle}>How It Works</h2>

        <div
          style={
            isMobile
              ? { display: "flex", flexDirection: "column", gap: "32px" }
              : styles.stepsGrid
          }
        >
          <div style={styles.stepItem}>
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>Create an Account</h3>
            <p style={styles.stepText}>
              Sign up in minutes and complete your profile to help us match you
              with the right experts.
            </p>
          </div>

          <div style={styles.stepItem}>
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>Browse Experts</h3>
            <p style={styles.stepText}>
              Explore our network of professionals across various categories and
              review their credentials.
            </p>
          </div>

          <div style={styles.stepItem}>
            <div style={styles.stepNumber}>3</div>
            <h3 style={styles.stepTitle}>Book & Connect</h3>
            <p style={styles.stepText}>
              Schedule a session at your convenience and meet virtually through
              our secure platform.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Experts Section */}
      <div id="experts" style={{ ...styles.section, marginTop: "24px" }}>
        <h2 style={styles.sectionTitle}>Featured Experts</h2>

        <div
          style={
            isMobile
              ? {
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                }
              : styles.expertsGrid
          }
        >
          {experts.map((expert, index) => (
            <div key={index} style={styles.expertCard}>
              <div style={styles.expertImage}>
                <img
                  src={expert.image}
                  alt={expert.name}
                  style={styles.realImage}
                />
              </div>
              <h3 style={styles.expertName}>{expert.name}</h3>
              <p style={styles.expertSpecialty}>{expert.specialty}</p>
              <div style={styles.ratingContainer}>
                <span style={{ marginRight: "4px" }}>★</span>
                <span style={styles.ratingText}>{expert.rating}/5.0</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <a href="/experts" style={styles.viewAllButton}>
            View All Experts
          </a>
        </div>
      </div>

      {/* Become a Host Section */}
      <div style={styles.gradientSection}>
        <h2 style={styles.gradientTitle}>Share Your Expertise</h2>
        <p style={styles.gradientText}>
          Are you a professional looking to connect with clients? Join our
          network of experts and start offering your services through GetePass
          Pro.
        </p>
        {/* FIXED: Changed from /host/register to /expert/apply to match expected route */}
        <a href="/expert/apply" style={styles.whiteButton}>
          Apply to Become an Expert
        </a>
      </div>

      {/* Testimonials */}
      <div style={{ ...styles.section, marginTop: "24px" }}>
        <h2 style={styles.sectionTitle}>What Our Users Say</h2>

        <div
          style={
            isMobile
              ? { display: "flex", flexDirection: "column", gap: "24px" }
              : styles.testimonialsGrid
          }
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} style={styles.testimonialCard}>
              <p style={styles.testimonialText}>{testimonial.text}</p>
              <div style={styles.testimonialProfile}>
                <div style={styles.profileImage}>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    style={styles.realImage}
                  />
                </div>
                <div>
                  <h4 style={styles.profileName}>{testimonial.name}</h4>
                  <p style={styles.profileTitle}>{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div style={styles.gradientSection}>
        <h2 style={styles.gradientTitle}>
          Ready to connect with world-class experts?
        </h2>
        <p style={styles.gradientText}>
          Join thousands of users who are transforming their lives through
          expert guidance and consultation.
        </p>
        <div
          style={
            isMobile
              ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  alignItems: "center",
                }
              : {
                  display: "flex",
                  flexDirection: "row",
                  gap: "16px",
                  justifyContent: "center",
                }
          }
        >
          <a href="/register" style={styles.whiteButton}>
            Get Started Now
          </a>
          <a href="/demo" style={styles.outlineButton}>
            Request a Demo
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer id="contact" style={styles.footer}>
        <div
          style={
            isMobile
              ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: "32px",
                  textAlign: "left",
                  marginBottom: "32px",
                }
              : styles.footerGrid
          }
        >
          <div>
            <h3 style={styles.footerTitle}>GetePass Pro</h3>
            <p style={styles.footerText}>
              Connecting people with experts for better guidance and solutions.
            </p>
          </div>

          <div>
            <h3 style={styles.footerTitle}>Quick Links</h3>
            <ul style={styles.footerList}>
              <li>
                <a href="/about" style={styles.footerLink}>
                  About Us
                </a>
              </li>
              <li>
                <a href="/experts" style={styles.footerLink}>
                  Our Experts
                </a>
              </li>
              <li>
                <a href="/pricing" style={styles.footerLink}>
                  Pricing
                </a>
              </li>
              <li>
                <a href="/blog" style={styles.footerLink}>
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 style={styles.footerTitle}>Support</h3>
            <ul style={styles.footerList}>
              <li>
                <a href="/help" style={styles.footerLink}>
                  Help Center
                </a>
              </li>
              <li>
                <a href="/faq" style={styles.footerLink}>
                  FAQs
                </a>
              </li>
              <li>
                <a href="/contact" style={styles.footerLink}>
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/feedback" style={styles.footerLink}>
                  Feedback
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 style={styles.footerTitle}>Contact</h3>
            <ul style={styles.footerList}>
              <li>Email: contact@getepasspro.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Innovation Blvd, Tech City, CA 94103</li>
            </ul>
          </div>
        </div>

        <div
          style={
            isMobile
              ? {
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                }
              : styles.footerBottom
          }
        >
          <p>© 2025 GetePass Pro. All rights reserved.</p>
          <div style={styles.policiesLinks}>
            <a href="/privacy" style={styles.policyLink}>
              Privacy Policy
            </a>
            <a href="/terms" style={styles.policyLink}>
              Terms of Service
            </a>
            <a href="/cookies" style={styles.policyLink}>
              Cookie Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
