import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/ResetPasswordPage.css';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Both fields are required.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized. Please log in again.');
        return;
      }
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/reset-password',
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert('Password updated successfully. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(response.data.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Reset Password Error:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="reset-password-container">
      <form className="form" onSubmit={handleChangePassword}>
        <p className="form-title"><b>Change Your Password</b></p>
        <div className="input-container">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="password-input"
          />
        </div>
        <div className="input-container password-container">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
        <button type="submit" className="submit">Change Password</button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
