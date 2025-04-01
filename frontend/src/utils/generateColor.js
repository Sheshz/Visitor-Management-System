// Helper function for generating color from email
const generateColorFromEmail = (email) => {
    if (!email) return '#1f77b4'; // Default color if no email provided
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = ((hash << 5) - hash) + email.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return `#${((hash >>> 0) & 0x00ffffff).toString(16).padStart(6, '0')}`;
  };
  
  export default generateColorFromEmail;
  