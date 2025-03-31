// HostRequests.jsx - Hosts manage applications
import { useEffect, useState } from "react";
import axios from "axios";

const HostRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios.get("/api/hosts/requests").then((res) => setRequests(res.data));
  }, []);

  const handleApprove = async (id) => {
    await axios.put(`/api/hosts/approve/${id}`);
    setRequests(requests.filter((req) => req._id !== id));
  };

  return (
    <div>
      <h2>Pending Host Applications</h2>
      {requests.map((req) => (
        <div key={req._id}>
          <p>{req.name} - {req.email}</p>
          <button onClick={() => handleApprove(req._id)}>Approve</button>
        </div>
      ))}
    </div>
  );
};

export default HostRequests;
