import React, { useState, useEffect } from 'react';

const AvailableHosts = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/host/available');
        const data = await response.json();
        setHosts(data);
      } catch (error) {
        console.error('Error fetching hosts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHosts();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Available Hosts</h1>
      <ul>
        {hosts.map((host) => (
          <li key={host._id}>
            <h3>{host.user.name}</h3>
            <p>{host.bio}</p>
            <p>{host.expertise}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AvailableHosts;
