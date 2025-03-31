import React, { useState } from 'react';

const ExpertsPage = () => {
  // Define styles as objects for inline CSS
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
    activeNavLink: {
      color: '#4f46e5',
      fontWeight: '700',
      textDecoration: 'none',
      transition: 'color 0.3s',
      borderBottom: '2px solid #4f46e5'
    },
    pageTitle: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '32px',
      marginBottom: '24px',
      textAlign: 'center'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: '#1e293b'
    },
    subtitle: {
      fontSize: '18px',
      color: '#64748b',
      maxWidth: '700px',
      margin: '0 auto'
    },
    filtersSection: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px'
    },
    filtersContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    filterLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b'
    },
    filterSelect: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      fontSize: '14px',
      color: '#1e293b',
      minWidth: '180px'
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      flex: '1'
    },
    searchInput: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      fontSize: '14px',
      color: '#1e293b',
      width: '100%'
    },
    clearFiltersButton: {
      padding: '10px 16px',
      backgroundColor: '#e2e8f0',
      color: '#1e293b',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    applyFiltersButton: {
      padding: '10px 16px',
      backgroundColor: '#4f46e5',
      color: 'white',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    expertsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '24px'
    },
    expertCard: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'pointer'
    },
    expertCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)'
    },
    expertImageContainer: {
      height: '180px',
      backgroundColor: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    expertImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    expertInitials: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      backgroundColor: '#e0e7ff',
      color: '#4f46e5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '36px',
      fontWeight: 'bold'
    },
    expertInfo: {
      padding: '20px'
    },
    expertName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px'
    },
    expertSpecialty: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '12px'
    },
    expertMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    expertRating: {
      display: 'flex',
      alignItems: 'center',
      color: '#eab308'
    },
    expertRatingText: {
      marginLeft: '4px',
      color: '#64748b',
      fontSize: '14px'
    },
    expertSessionCount: {
      fontSize: '14px',
      color: '#64748b'
    },
    expertTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '16px'
    },
    expertTag: {
      padding: '4px 10px',
      backgroundColor: '#f0f4ff',
      color: '#4f46e5',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500'
    },
    expertActions: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '16px'
    },
    viewProfileButton: {
      padding: '8px 12px',
      backgroundColor: '#f1f5f9',
      color: '#1e293b',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      textDecoration: 'none',
      textAlign: 'center',
      flex: '1',
      marginRight: '8px'
    },
    bookSessionButton: {
      padding: '8px 12px',
      backgroundColor: '#4f46e5',
      color: 'white',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      textDecoration: 'none',
      textAlign: 'center',
      flex: '1',
      marginLeft: '8px'
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '40px',
      gap: '8px'
    },
    paginationButton: {
      padding: '8px 16px',
      backgroundColor: '#f8fafc',
      color: '#64748b',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    paginationButtonActive: {
      padding: '8px 16px',
      backgroundColor: '#4f46e5',
      color: 'white',
      borderRadius: '8px',
      border: '1px solid #4f46e5',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    paginationEllipsis: {
      fontSize: '14px',
      color: '#64748b'
    },
    footer: {
      marginTop: '40px',
      textAlign: 'center',
      color: '#64748b',
      padding: '24px'
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '32px',
      textAlign: 'left',
      marginBottom: '32px'
    },
    footerTitle: {
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '16px'
    },
    footerText: {
      fontSize: '14px'
    },
    footerList: {
      listStyle: 'none',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontSize: '14px'
    },
    footerLink: {
      color: 'inherit',
      textDecoration: 'none',
      transition: 'color 0.3s'
    },
    footerBottom: {
      borderTop: '1px solid #e2e8f0',
      paddingTop: '24px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    policiesLinks: {
      display: 'flex',
      gap: '24px'
    },
    policyLink: {
      color: '#4f46e5',
      textDecoration: 'none',
      transition: 'color 0.3s'
    },
    noResultsContainer: {
      textAlign: 'center',
      padding: '64px 0',
      color: '#64748b'
    },
    noResultsIcon: {
      fontSize: '48px',
      marginBottom: '16px',
      color: '#94a3b8'
    },
    noResultsTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px'
    },
    noResultsText: {
      fontSize: '16px',
      color: '#64748b',
      maxWidth: '400px',
      margin: '0 auto'
    }
  };

  // Sample expert data with Unsplash images
  const expertsData = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      specialty: "Cardiologist",
      rating: 4.9,
      sessions: 342,
      tags: ["Heart Health", "Preventive Care", "Holistic"],
      bio: "Experienced cardiologist focusing on preventive care and heart health optimization.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      name: "Mark Johnson",
      specialty: "Civil Engineer",
      rating: 4.8,
      sessions: 187,
      tags: ["Infrastructure", "Project Management", "Sustainable Design"],
      bio: "Senior civil engineer with expertise in sustainable infrastructure development.",
      image: "https://images.unsplash.com/photo-1580810734178-57b3333cf6ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      name: "Dr. James Wilson",
      specialty: "Financial Advisor",
      rating: 4.7,
      sessions: 256,
      tags: ["Investment", "Retirement Planning", "Tax Strategy"],
      bio: "Financial expert helping clients build wealth through strategic investments and tax planning.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 4,
      name: "Emily Rodriguez",
      specialty: "Life Coach",
      rating: 4.9,
      sessions: 426,
      tags: ["Career Transition", "Mindfulness", "Goal Setting"],
      bio: "Transformational coach supporting clients through major life and career changes.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 5,
      name: "Dr. Michael Lee",
      specialty: "Psychiatrist",
      rating: 4.8,
      sessions: 312,
      tags: ["Anxiety", "Depression", "Stress Management"],
      bio: "Compassionate psychiatrist with a holistic approach to mental health and wellbeing.",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 6,
      name: "Jennifer Kim",
      specialty: "Nutritionist",
      rating: 4.7,
      sessions: 198,
      tags: ["Weight Management", "Sports Nutrition", "Dietary Planning"],
      bio: "Expert nutritionist helping clients achieve optimal health through personalized diet plans.",
      image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 7,
      name: "Robert Taylor",
      specialty: "Software Engineer",
      rating: 4.9,
      sessions: 165,
      tags: ["Web Development", "Cloud Architecture", "AI Integration"],
      bio: "Senior software developer specializing in scalable web applications and AI solutions.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 8,
      name: "Dr. Amanda Garcia",
      specialty: "Dermatologist",
      rating: 4.8,
      sessions: 278,
      tags: ["Skin Health", "Cosmetic Procedures", "Acne Treatment"],
      bio: "Board-certified dermatologist with expertise in both medical and cosmetic dermatology.",
      image: "https://images.unsplash.com/photo-1614608997588-730846ad47a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 9,
      name: "David Patel",
      specialty: "Business Consultant",
      rating: 4.7,
      sessions: 203,
      tags: ["Strategy", "Growth Planning", "Market Analysis"],
      bio: "Business strategist helping entrepreneurs and SMEs scale their operations effectively.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 10,
      name: "Lisa Thompson",
      specialty: "Interior Designer",
      rating: 4.9,
      sessions: 157,
      tags: ["Residential", "Sustainable Design", "Space Optimization"],
      bio: "Creative designer transforming living and working spaces with sustainable, functional designs.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 11,
      name: "Dr. Thomas Wright",
      specialty: "Orthopedic Surgeon",
      rating: 4.8,
      sessions: 231,
      tags: ["Sports Medicine", "Joint Replacement", "Physical Therapy"],
      bio: "Experienced surgeon specializing in sports injuries and minimally invasive procedures.",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 12,
      name: "Sophia Martinez",
      specialty: "Education Consultant",
      rating: 4.7,
      sessions: 189,
      tags: ["College Planning", "Academic Support", "Career Guidance"],
      bio: "Education expert guiding students through academic challenges and career decisions.",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ];

  // States for filters and pagination
  const [category, setCategory] = useState('all');
  const [rating, setRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showInitials, setShowInitials] = useState({}); // Track images that failed to load
  
  const itemsPerPage = 8;
  
  // Filter experts based on selected filters
  const filteredExperts = expertsData.filter(expert => {
    const matchesCategory = category === 'all' || expert.specialty.toLowerCase().includes(category.toLowerCase());
    const matchesRating = rating === 'all' || expert.rating >= parseFloat(rating);
    const matchesSearch = searchTerm === '' || 
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      expert.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesRating && matchesSearch;
  });
  
  // Calculate pagination values
  const indexOfLastExpert = currentPage * itemsPerPage;
  const indexOfFirstExpert = indexOfLastExpert - itemsPerPage;
  const currentExperts = filteredExperts.slice(indexOfFirstExpert, indexOfLastExpert);
  const totalPages = Math.ceil(filteredExperts.length / itemsPerPage);
  
  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Previous button
    buttons.push(
      <button 
        key="prev" 
        style={styles.paginationButton} 
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        &laquo;
      </button>
    );
    
    // First page
    buttons.push(
      <button 
        key={1} 
        style={currentPage === 1 ? styles.paginationButtonActive : styles.paginationButton}
        onClick={() => setCurrentPage(1)}
      >
        1
      </button>
    );
    
    // Ellipsis if needed
    if (currentPage > 3) {
      buttons.push(<span key="ellipsis1" style={styles.paginationEllipsis}>...</span>);
    }
    
    // Pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last pages as they're always shown
      
      buttons.push(
        <button 
          key={i} 
          style={currentPage === i ? styles.paginationButtonActive : styles.paginationButton}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    
    // Ellipsis if needed
    if (currentPage < totalPages - 2) {
      buttons.push(<span key="ellipsis2" style={styles.paginationEllipsis}>...</span>);
    }
    
    // Last page if there's more than one page
    if (totalPages > 1) {
      buttons.push(
        <button 
          key={totalPages} 
          style={currentPage === totalPages ? styles.paginationButtonActive : styles.paginationButton}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    // Next button
    buttons.push(
      <button 
        key="next" 
        style={styles.paginationButton} 
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        &raquo;
      </button>
    );
    
    return buttons;
  };
  
  // Get initials for expert avatar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };
  
  // Handle image loading error
  const handleImageError = (expertId) => {
    setShowInitials(prev => ({...prev, [expertId]: true}));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setCategory('all');
    setRating('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Determine if we're on mobile (simple approach for the example)
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
        
        <nav style={isMobile ? {display: 'none'} : styles.nav}>
          <a href="/#features" style={styles.navLink}>Features</a>
          <a href="/#how-it-works" style={styles.navLink}>How It Works</a>
          <a href="/experts" style={styles.activeNavLink}>Our Experts</a>
          <a href="/#contact" style={styles.navLink}>Contact</a>
        </nav>
      </header>
      
      {/* Page Title */}
      <div style={styles.pageTitle}>
        <h1 style={styles.title}>Connect With Our Experts</h1>
        <p style={styles.subtitle}>
          Browse our network of verified professionals across various fields. Filter by specialty, 
          check ratings, and book sessions with the perfect expert for your needs.
        </p>
      </div>
      
      {/* Filters Section */}
      <div style={styles.filtersSection}>
        <div style={isMobile ? {display: 'flex', flexDirection: 'column', gap: '16px'} : styles.filtersContainer}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Category</label>
            <select 
              style={styles.filterSelect} 
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Categories</option>
              <option value="doctor">Healthcare</option>
              <option value="engineer">Engineering</option>
              <option value="financial">Finance</option>
              <option value="coach">Coaching</option>
              <option value="consultant">Consulting</option>
            </select>
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Minimum Rating</label>
            <select 
              style={styles.filterSelect} 
              value={rating}
              onChange={(e) => {
                setRating(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Any Rating</option>
              <option value="4.5">4.5+</option>
              <option value="4">4.0+</option>
              <option value="3.5">3.5+</option>
            </select>
          </div>
          
          <div style={{...styles.filterGroup, flex: '1'}}>
            <label style={styles.filterLabel}>Search</label>
            <div style={styles.searchContainer}>
              <input 
                type="text" 
                style={styles.searchInput} 
                placeholder="Search by name, specialty, or expertise..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          
          <div style={{...styles.filterGroup, alignSelf: 'flex-end'}}>
            <button style={styles.clearFiltersButton} onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Experts Grid */}
      {currentExperts.length > 0 ? (
        <div style={styles.expertsGrid}>
          {currentExperts.map(expert => (
            <div 
              key={expert.id} 
              style={{
                ...styles.expertCard,
                ...(hoveredCard === expert.id ? styles.expertCardHover : {})
              }}
              onMouseEnter={() => setHoveredCard(expert.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={styles.expertImageContainer}>
                {showInitials[expert.id] ? (
                  <div style={styles.expertInitials}>
                    {getInitials(expert.name)}
                  </div>
                ) : (
                  <img 
                    src={expert.image} 
                    alt={expert.name}
                    style={styles.expertImage}
                    onError={() => handleImageError(expert.id)}
                  />
                )}
              </div>
              <div style={styles.expertInfo}>
                <h3 style={styles.expertName}>{expert.name}</h3>
                <p style={styles.expertSpecialty}>{expert.specialty}</p>
                
                <div style={styles.expertMeta}>
                  <div style={styles.expertRating}>
                    <span>★</span>
                    <span style={styles.expertRatingText}>{expert.rating}/5.0</span>
                  </div>
                  <div style={styles.expertSessionCount}>
                    {expert.sessions} sessions
                  </div>
                </div>
                
                <div style={styles.expertTags}>
                  {expert.tags.map((tag, index) => (
                    <span key={index} style={styles.expertTag}>{tag}</span>
                  ))}
                </div>
                
                <p style={{fontSize: '14px', color: '#64748b', marginBottom: '16px'}}>
                  {expert.bio}
                </p>
                
                <div style={styles.expertActions}>
                  <a href={`/expert/${expert.id}`} style={styles.viewProfileButton}>
                    View Profile
                  </a>
                  <a href={`/book/${expert.id}`} style={styles.bookSessionButton}>
                    Book Session
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.noResultsContainer}>
          <div style={styles.noResultsIcon}>🔍</div>
          <h3 style={styles.noResultsTitle}>No Experts Found</h3>
          <p style={styles.noResultsText}>
            We couldn't find any experts matching your criteria. Try adjusting your filters or search terms.
          </p>
          <button 
            style={{...styles.clearFiltersButton, marginTop: '16px'}} 
            onClick={clearFilters}
          >
            Clear All Filters
          </button>
        </div>
      )}
      
      {/* Pagination */}
      {filteredExperts.length > itemsPerPage && (
        <div style={styles.paginationContainer}>
          {renderPaginationButtons()}
        </div>
      )}
      
      {/* Footer */}
      <footer style={styles.footer}>
        <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left', marginBottom: '32px' } : styles.footerGrid}>
          <div>
            <h3 style={styles.footerTitle}>GetePass Pro</h3>
            <p style={styles.footerText}>Connecting people with experts for better guidance and solutions.</p>
          </div>
          
          <div>
            <h3 style={styles.footerTitle}>Quick Links</h3>
            <ul style={styles.footerList}>
              <li><a href="/about" style={styles.footerLink}>About Us</a></li>
              <li><a href="/experts" style={styles.footerLink}>Our Experts</a></li>
              <li><a href="/pricing" style={styles.footerLink}>Pricing</a></li>
              <li><a href="/blog" style={styles.footerLink}>Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 style={styles.footerTitle}>Support</h3>
            <ul style={styles.footerList}>
              <li><a href="/help" style={styles.footerLink}>Help Center</a></li>
              <li><a href="/faq" style={styles.footerLink}>FAQs</a></li>
              <li><a href="/contact" style={styles.footerLink}>Contact Us</a></li>
              <li><a href="/feedback" style={styles.footerLink}>Feedback</a></li>
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
        
        <div style={isMobile ? 
          { borderTop: '1px solid #e2e8f0', paddingTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' } : 
          styles.footerBottom
        }>
          <p>© 2025 GetePass Pro. All rights reserved.</p>
          <div style={styles.policiesLinks}>
            <a href="/privacy" style={styles.policyLink}>Privacy Policy</a>
            <a href="/terms" style={styles.policyLink}>Terms of Service</a>
            <a href="/cookies" style={styles.policyLink}>Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExpertsPage;