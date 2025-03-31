import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HostLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/hosts/loginHost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login Response:", data); // Debugging

      if (response.ok && data.token) {
        // Store the token in localStorage
        localStorage.setItem("hostToken", data.token);
        console.log("Token stored successfully!"); // Debugging message
        alert("Login successful!");
        navigate("/host-dashboard");
      } else {
        alert(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <form 
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '30px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }} 
        onSubmit={handleSubmit}
      >
        <h2 style={{
          textAlign: 'center',
          margin: '0 0 20px 0',
          color: '#333',
          fontSize: '24px'
        }}>Host Login</h2>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '12px 15px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.3s',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: '12px 15px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.3s',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
        
        <button 
          type="submit"
          style={{
            backgroundColor: '#4a90e2',
            color: 'white',
            padding: '12px 15px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            fontWeight: 'bold',
            width: '100%',
            marginTop: '10px'
          }}
        >Login</button>
      </form>
    </div>
  );
};

export default HostLogin;