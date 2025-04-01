import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProfileIcon from '../components/ProfileIcon';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Fetch user data from your API
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user/profile');
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      <div className="profile-header">
        <ProfileIcon 
          firstName={user.firstName}
          lastName={user.lastName}
          color={user.profileColor}
          size="80px"
        />
        <div className="profile-info">
          <div>
            <span>First Name</span>
            <h3>{user.firstName}</h3>
          </div>
          <div>
            <span>Last Name</span>
            <h3>{user.lastName}</h3>
          </div>
          <div>
            <span>Email</span>
            <p>{user.email}</p>
          </div>
          <div>
            <span>Role</span>
            <p>{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;