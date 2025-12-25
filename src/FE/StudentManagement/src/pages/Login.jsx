import React, { useState } from 'react';
import { User, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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
    setLoading(true);

    try {
      const response = await fetch('https://localhost:7115/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data));
        success('Login successful! Welcome back.');
        // Navigate and then reload or just navigate if state is managed globally
        // For simple implementations, just navigating to home is enough if Home checks localStorage on mount
        navigate('/'); 
        // window.location.reload(); // Might not be needed if Home component updates or we use context for auth. 
        // But since we aren't using AuthContext yet, a reload or event dispatch might be safer for header update. 
        // Use custom event to notify header.
        window.dispatchEvent(new Event("storage"));
      } else {
        const errorText = await response.text();
        showError(errorText || 'Invalid credentials');
      }
    } catch (err) {
      showError('Network error. Is the server running?');
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
          <h2>Welcome Back</h2>
          <p>Please enter your details to sign in.</p>
        </div>



        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <div className="input-wrapper">
              <User size={20} />
              <input 
                type="text" 
                name="username"
                className="form-input" 
                placeholder="Enter your username" 
                required 
                value={formData.username}
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
                placeholder="Enter your password" 
                required 
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <Link to="/forgot-password" style={{ color: '#4f46e5', fontSize: '0.9rem', textDecoration: 'none' }}>Forgot Password?</Link>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? 
          <Link to="/register" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
