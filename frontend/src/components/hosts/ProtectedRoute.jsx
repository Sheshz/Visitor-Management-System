// frontend/src/components/ProtectedRoute.jsx

import React, { useEffect } from "react";

const ProtectedRoute = () => {
  useEffect(() => {
    const token = localStorage.getItem("hostToken");

    fetch("http://localhost:5000/api/hosts/protected-route", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  return (
    <div>
      <h2>Protected Route</h2>
    </div>
  );
};

export default ProtectedRoute;
