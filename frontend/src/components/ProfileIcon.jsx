import React from 'react';
import generateColorFromEmail from '../utils/generateColor';

const ProfileIcon = ({ 
  firstName, 
  lastName, 
  email, 
  size = '50px', 
  showInfo = false 
}) => {
  // Generate color from email
  const color = email ? generateColorFromEmail(email) : '#1f77b4';
  
  // Get initials from name
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toLowerCase();
    } else if (firstName) {
      return firstName.charAt(0).toLowerCase();
    } else if (email) {
      return email.charAt(0).toLowerCase();
    }
    return '?';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: `calc(${size} * 0.4)`,
          fontWeight: 500,
        }}
      >
        {getInitials()}
      </div>
      
      {showInfo && (
        <div style={{ marginLeft: 10 }}>
          <p style={{ margin: 0, fontWeight: 500 }}>
            {firstName} {lastName}
          </p>
          {email && <p style={{ margin: 0, color: '#718096', fontSize: '0.9em' }}>{email}</p>}
        </div>
      )}
    </div>
  );
};

export default ProfileIcon;