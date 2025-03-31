import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../CSS/Login.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });
  
      const { token, role } = response.data;
      localStorage.setItem("token", token); // Changed from "authToken" to "token"
      localStorage.setItem("userRole", role);
  
      if (role === "host") {
        navigate("/host-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      setError("Invalid email or password");
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
      padding: '3rem 1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '24rem',
        transition: 'transform 0.3s ease',
      }}>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#1f2937',
          marginBottom: '1.5rem'
        }}>Sign In</h2>
        <p style={{
          textAlign: 'center',
          color: '#4b5563',
          marginBottom: '1rem'
        }}>Please enter your credentials</p>
        
        <form onSubmit={handleLogin} style={{ marginTop: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{
                display: 'block',
                width: '100%',
                padding: '0.625rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none',
                transition: 'all 0.3s ease-in-out',
                fontSize: '1rem',
                marginTop: '0.5rem'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{
                display: 'block',
                width: '100%',
                padding: '0.625rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none',
                transition: 'all 0.3s ease-in-out',
                fontSize: '1rem',
                marginTop: '0.5rem'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe} 
                onChange={() => setRememberMe(!rememberMe)} 
                style={{
                  height: '1rem',
                  width: '1rem',
                  borderRadius: '0.25rem',
                  accentColor: '#2563eb'
                }}
              />
              <label htmlFor="remember" style={{
                marginLeft: '0.5rem',
                fontSize: '0.875rem',
                color: '#4b5563'
              }}>Remember Me</label>
            </div>
            <a href="/forgot-password" style={{
              fontSize: '0.875rem',
              color: '#2563eb',
              textDecoration: 'none',
              transition: 'color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.color = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.color = '#2563eb'}>
              Forgot Password?
            </a>
          </div>

          {error && <p style={{
            color: '#ef4444',
            fontSize: '0.875rem',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>{error}</p>}

          <button 
            type="submit" 
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              marginBottom: '1.5rem',
              fontSize: '1rem'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Log In
          </button>
          
          <div style={{
            textAlign: 'center',
            margin: '1.5rem 0',
            position: 'relative',
          }}>
            <span style={{
              backgroundColor: 'white',
              padding: '0 0.75rem',
              color: '#6b7280',
              position: 'relative',
              zIndex: '1'
            }}>Or sign in with</span>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '0',
              right: '0',
              height: '1px',
              backgroundColor: '#e5e7eb',
              zIndex: '0'
            }}></div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <button 
              type="button"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                color: '#4b5563',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: 'white',
                fontSize: '0.875rem'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.color = '#2563eb';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.color = '#4b5563';
              }}
            >
              <i className="fab fa-google"></i> Google
            </button>
            <button 
              type="button"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                color: '#4b5563',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: 'white',
                fontSize: '0.875rem'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.color = '#2563eb';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.color = '#4b5563';
              }}
            >
              <i className="fab fa-facebook-f"></i> Facebook
            </button>
          </div>

          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            marginTop: '1rem',
            fontSize: '0.875rem'
          }}>Don't have an account? 
            <a href="/register" style={{
              color: '#2563eb',
              textDecoration: 'none',
              transition: 'color 0.3s',
              marginLeft: '0.25rem'
            }}
            onMouseOver={(e) => e.target.style.color = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.color = '#2563eb'}>
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;