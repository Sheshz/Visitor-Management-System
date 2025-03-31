import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';  // Add this import
import "../../CSS/Register.css";

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Now this works!

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/users/register", formData);
      console.log("Registration successful:", res.data);
      alert("User Registered Successfully!");
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setMessage("");
    setLoading(true);

    try {
      // Simulate API call for social login
      console.log(`Initiating ${provider} login`);
      const res = await axios.get(`http://localhost:5000/api/auth/${provider}`);
      
      console.log(`${provider} login initiated:`, res.data);

      setTimeout(() => {
        alert(`${provider} login successful!`);
        navigate("/dashboard");
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setMessage(`${provider} login failed. Please try again.`);
      console.error(`${provider} login error:`, err);
      setLoading(false);
    }
  };

  
  return (
    <div className="create-account-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
      
      {loading && <div className="loading-spinner"></div>}
      {message && <p className="error-message">{message}</p>}
      
      <div className="social-login-section">
        <h3>Or continue with</h3>
        <div className="social-buttons">
          <button className="social-button" onClick={() => handleSocialLogin("google")}>G</button>
          <button className="social-button" onClick={() => handleSocialLogin("facebook")}>f</button>
          <button className="social-button" onClick={() => handleSocialLogin("apple")}>a</button>
        </div>
      </div>
      
      <a href="/login" className="login-link">Already have an account? Login</a>
    </div>
  );
}

export default CreateAccount;
