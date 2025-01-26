import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/LoginPage.css';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Check if the user is already logged in based on token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // If token exists, redirect to dashboard
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!name || !password) {
      setError('Both username and password are required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { name, password });

      if (response.data.token) {
        // Store token and user details in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirect to dashboard after successful login
        navigate('/dashboard');
      } else {
        setError('Something went wrong, no token received');
      }
    } catch (err) {
      console.error('Login Error:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <form className="form" onSubmit={handleLogin}>
        <p className="form-title">
          <b>Log in</b> to your account
        </p>
        <div className="input-container">
          <input
            placeholder="Enter username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="username-input"
          />
        </div>
        <div className="input-container password-container">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
          />
          <div className="password-eye-container" onClick={togglePasswordVisibility}>
            {showPassword ? (
              <AiFillEyeInvisible className="password-icon" />
            ) : (
              <AiFillEye className="password-icon" />
            )}
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="submit">
          Log in
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
