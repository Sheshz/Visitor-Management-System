import React from 'react';

const AboutUsPage = () => {
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f0f4ff, #e8eeff)',
      padding: '24px',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    logo: {
      width: '48px',
      height: '48px',
      background: '#4f46e5',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '20px'
    },
    logoText: {
      marginLeft: '12px',
      fontWeight: '600',
      color: '#1e293b',
      fontSize: '20px'
    },
    nav: {
      display: 'flex',
      gap: '24px'
    },
    navLink: {
      color: '#4f46e5',
      fontWeight: '500',
      textDecoration: 'none',
      transition: 'color 0.3s'
    },
    heroSection: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
      padding: '32px 40px',
      marginBottom: '24px',
      textAlign: 'center'
    },
    heroTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '16px',
      background: 'linear-gradient(to right, #4f46e5, #7e22ce)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'inline-block'
    },
    section: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
      padding: '32px 40px',
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '24px',
      color: '#1e293b'
    },
    paragraph: {
      color: '#64748b',
      lineHeight: '1.6',
      marginBottom: '16px',
      fontSize: '16px'
    },
    teamSection: {
      marginTop: '40px'
    },
    teamGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '24px',
      marginTop: '24px'
    },
    teamCard: {
      background: '#f0f4ff',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      border: '1px solid #e2e8f0'
    },
    teamMemberImage: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      margin: '0 auto 16px auto',
      overflow: 'hidden'
    },
    teamMemberName: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '4px'
    },
    teamMemberRole: {
      color: '#64748b',
      fontSize: '14px',
      marginBottom: '12px'
    },
    socialLinks: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      marginTop: '16px'
    },
    socialIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: '#e0e7ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#4f46e5'
    },
    timeline: {
      marginTop: '40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    },
    timelineItem: {
      display: 'flex',
      gap: '24px'
    },
    timelineYear: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#4f46e5',
      width: '80px',
      flexShrink: '0'
    },
    timelineContent: {
      flex: '1'
    },
    timelineTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px'
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '24px',
      marginTop: '40px'
    },
    statCard: {
      background: 'linear-gradient(to right, #4f46e5, #7e22ce)',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      color: 'white'
    },
    statNumber: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '14px',
      opacity: '0.9'
    },
    footer: {
      marginTop: '40px',
      textAlign: 'center',
      color: '#64748b',
      padding: '24px'
    },
    footerText: {
      borderTop: '1px solid #e2e8f0',
      paddingTop: '24px'
    }
  };

  // Team members data with actual image URLs
  const teamMembers = [
    {
      name: "Michael Chen",
      role: "CEO & Co-Founder",
      bio: "Previously founded two successful tech startups and has a background in software engineering and product management.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
    },
    {
      name: "Sarah Johnson",
      role: "CTO & Co-Founder",
      bio: "A technologist with 15+ years of experience in building secure, scalable platforms and leading engineering teams.",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80"
    },
    {
      name: "David Rodriguez",
      role: "COO",
      bio: "Expert in operations and business development with experience scaling international marketplaces.",
      imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
    },
    {
      name: "Emily Patel",
      role: "CMO",
      bio: "Marketing strategist with a passion for building brands that connect with users on a meaningful level.",
      imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=871&q=80"
    }
  ];

  // Determine if we're on mobile
  const isMobile = window.innerWidth < 768;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>
            GP
          </div>
          <span style={styles.logoText}>GetePass Pro</span>
        </div>
        
        <nav style={styles.nav}>
          <a href="/" style={styles.navLink}>Home</a>
          <a href="/about" style={{...styles.navLink, color: '#7e22ce'}}>About</a>
          <a href="/experts" style={styles.navLink}>Experts</a>
          <a href="/contact" style={styles.navLink}>Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>
          Our Mission & Vision
        </h1>
        
        <p style={{...styles.paragraph, maxWidth: '800px', margin: '0 auto'}}>
          At GetePass Pro, we're dedicated to breaking down barriers in professional consultations, making expertise accessible to everyone, anywhere. Our platform connects individuals with world-class professionals across various fields.
        </p>
      </div>
      
      {/* Our Story Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Story</h2>
        
        <p style={styles.paragraph}>
          GetePass Pro was founded in 2023 by a team of technology entrepreneurs who recognized a significant gap in the market: while digital transformation was revolutionizing most industries, professional consultations remained largely traditional, expensive, and inaccessible to many.
        </p>
        
        <p style={styles.paragraph}>
          Our founders envisioned a platform that would democratize access to expertise across various fields, from healthcare to finance, engineering to life coaching. They believed that by leveraging technology, they could create a marketplace where professionals could offer their services more efficiently and individuals could access specialized knowledge more affordably.
        </p>
        
        <p style={styles.paragraph}>
          After months of development and testing, GetePass Pro launched with a mission to connect people with verified experts through a secure, user-friendly platform. Since then, we've grown to include thousands of professionals across dozens of specialties, serving clients around the globe.
        </p>
        
        <div style={styles.timeline}>
          <h3 style={{...styles.sectionTitle, fontSize: '20px'}}>Our Journey</h3>
          
          <div style={styles.timelineItem}>
            <div style={styles.timelineYear}>2023</div>
            <div style={styles.timelineContent}>
              <h4 style={styles.timelineTitle}>GetePass Pro Founded</h4>
              <p style={styles.paragraph}>Our team of founders came together with a vision to revolutionize professional consultations through technology.</p>
            </div>
          </div>
          
          <div style={styles.timelineItem}>
            <div style={styles.timelineYear}>2023</div>
            <div style={styles.timelineContent}>
              <h4 style={styles.timelineTitle}>Beta Launch</h4>
              <p style={styles.paragraph}>We released our beta platform with 50 experts across 5 categories, gathering valuable user feedback.</p>
            </div>
          </div>
          
          <div style={styles.timelineItem}>
            <div style={styles.timelineYear}>2024</div>
            <div style={styles.timelineContent}>
              <h4 style={styles.timelineTitle}>Official Launch</h4>
              <p style={styles.paragraph}>GetePass Pro officially launched to the public with 500+ experts across 20+ categories.</p>
            </div>
          </div>
          
          <div style={styles.timelineItem}>
            <div style={styles.timelineYear}>2024</div>
            <div style={styles.timelineContent}>
              <h4 style={styles.timelineTitle}>International Expansion</h4>
              <p style={styles.paragraph}>We expanded our services globally, offering consultations in multiple languages and across different time zones.</p>
            </div>
          </div>
          
          <div style={styles.timelineItem}>
            <div style={styles.timelineYear}>2025</div>
            <div style={styles.timelineContent}>
              <h4 style={styles.timelineTitle}>Present Day</h4>
              <p style={styles.paragraph}>Today, GetePass Pro connects thousands of clients with experts every day, making professional guidance accessible to all.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Our Values Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Values</h2>
        
        <div style={isMobile ? {display: 'flex', flexDirection: 'column', gap: '16px'} : {display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px'}}>
          <div style={{background: '#f0f4ff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0'}}>
            <h3 style={{fontSize: '20px', fontWeight: '600', color: '#4f46e5', marginBottom: '12px'}}>Accessibility</h3>
            <p style={{...styles.paragraph, marginBottom: '0'}}>We believe expertise should be available to anyone, regardless of location or background. Our platform makes professional guidance more accessible and affordable.</p>
          </div>
          
          <div style={{background: '#f0f4ff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0'}}>
            <h3 style={{fontSize: '20px', fontWeight: '600', color: '#4f46e5', marginBottom: '12px'}}>Quality</h3>
            <p style={{...styles.paragraph, marginBottom: '0'}}>We rigorously vet our experts to ensure they have the credentials, experience, and communication skills to provide exceptional consultation experiences.</p>
          </div>
          
          <div style={{background: '#f0f4ff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0'}}>
            <h3 style={{fontSize: '20px', fontWeight: '600', color: '#4f46e5', marginBottom: '12px'}}>Security</h3>
            <p style={{...styles.paragraph, marginBottom: '0'}}>We prioritize the privacy and security of our users and experts. Our platform employs end-to-end encryption and adheres to strict data protection protocols.</p>
          </div>
          
          <div style={{background: '#f0f4ff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0'}}>
            <h3 style={{fontSize: '20px', fontWeight: '600', color: '#4f46e5', marginBottom: '12px'}}>Innovation</h3>
            <p style={{...styles.paragraph, marginBottom: '0'}}>We continuously improve our platform with new technologies to enhance the consultation experience for both clients and experts.</p>
          </div>
          
          <div style={{background: '#f0f4ff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0'}}>
            <h3 style={{fontSize: '20px', fontWeight: '600', color: '#4f46e5', marginBottom: '12px'}}>Inclusivity</h3>
            <p style={{...styles.paragraph, marginBottom: '0'}}>We foster a diverse community of experts and clients, embracing different backgrounds, perspectives, and areas of expertise.</p>
          </div>
          
          <div style={{background: '#f0f4ff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0'}}>
            <h3 style={{fontSize: '20px', fontWeight: '600', color: '#4f46e5', marginBottom: '12px'}}>Integrity</h3>
            <p style={{...styles.paragraph, marginBottom: '0'}}>We operate with honesty, transparency, and ethical standards in all aspects of our business, from pricing to user data management.</p>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>GetePass Pro Impact</h2>
        
        <div style={isMobile ? {display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px'} : styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>10,000+</div>
            <div style={styles.statLabel}>Verified Experts</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statNumber}>50+</div>
            <div style={styles.statLabel}>Specialties</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statNumber}>100,000+</div>
            <div style={styles.statLabel}>Consultations Completed</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statNumber}>150+</div>
            <div style={styles.statLabel}>Countries Served</div>
          </div>
        </div>
      </div>
      
      {/* Team Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Leadership Team</h2>
        
        <div style={isMobile ? {display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px'} : styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <div key={index} style={styles.teamCard}>
              <div style={styles.teamMemberImage}>
                <img 
                  src={member.imageUrl} 
                  alt={member.name} 
                  style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/240/240";
                  }}
                />
              </div>
              <h3 style={styles.teamMemberName}>{member.name}</h3>
              <p style={styles.teamMemberRole}>{member.role}</p>
              <p style={{...styles.paragraph, fontSize: '14px'}}>{member.bio}</p>
              <div style={styles.socialLinks}>
                <a href="#" style={styles.socialIcon}>
                  <svg style={{width: '16px', height: '16px'}} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="#" style={styles.socialIcon}>
                  <svg style={{width: '16px', height: '16px'}} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2025 GetePass Pro. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AboutUsPage;