import React from 'react';
import Register from "../components/user/Register"; // Correct path


const RegisterPage = () => {
  const handleRegister = (userData) => {
    // Call an API or perform register logic
    console.log('Registering with: ', userData);
    // After registration, maybe redirect to login or dashboard
  };

  return (
    <div className="register-page">
      <Register onRegister={handleRegister} />
    </div>
  );
};

export default RegisterPage;
