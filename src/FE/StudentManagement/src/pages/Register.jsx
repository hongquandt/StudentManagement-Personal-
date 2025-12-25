import React, { useState } from 'react';
import { User, Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

import { useToast } from '../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://localhost:7115/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        success('Registration successful! Please login.');
        navigate('/login');
      } else {
        const data = await response.text();
        showError(data || 'Registration failed');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Link to="/" className="back-home">
        <ArrowLeft size={18} /> Back to Home
      </Link>
      
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join us to manage your school efficiently.</p>
        </div>



        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <User size={20} />
              <input 
                type="text" 
                name="fullName"
                className="form-input" 
                placeholder="Enter your full name" 
                required 
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Username</label>
            <div className="input-wrapper">
              <User size={20} />
              <input 
                type="text" 
                name="username"
                className="form-input" 
                placeholder="Choose a username" 
                required 
                value={formData.username}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={20} />
              <input 
                type="email" 
                name="email"
                className="form-input" 
                placeholder="Enter your email" 
                required 
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input 
                type="password" 
                name="password"
                className="form-input" 
                placeholder="Create a password" 
                required 
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input 
                type="password" 
                name="confirmPassword"
                className="form-input" 
                placeholder="Confirm your password" 
                required 
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? 
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
