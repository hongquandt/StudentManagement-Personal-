import React, { useState } from 'react';
import { User, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

import { useToast } from '../context/ToastContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  // Social Login Handlers
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
        const decoded = jwtDecode(credentialResponse.credential);
        await callExternalLogin(decoded.email, decoded.name, decoded.picture, 'Google');
    } catch (err) {
        console.error(err);
        showError("Google Login error");
    }
  };

  const handleFacebookSuccess = async (response) => {
    console.log("Facebook Response:", response);
    let email = response.email;
    
    if (!email) {
        if (response.id) {
            // Fallback: Create a placeholder email using the Facebook ID
            // This ensures the user can still login even if their FB account has no email
            email = `${response.id}@facebook.user`; 
            console.warn("Facebook email missing. Using fallback:", email);
        } else {
            showError("Facebook login failed: Unable to retrieve user info.");
            return;
        }
    }

    await callExternalLogin(
         email, 
         response.name || "Facebook User", 
         response.picture?.data?.url || "", 
         'Facebook'
    );
  };

  const callExternalLogin = async (email, name, avatarUrl, provider) => {
    setLoading(true);
    try {
        const response = await fetch('https://localhost:7115/api/auth/external-login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, name, avatarUrl, provider })
        });
        if (response.ok) {
             const data = await response.json();
             localStorage.setItem('user', JSON.stringify(data));
             success(`Login with ${provider} successful!`);
             navigate('/');
             window.dispatchEvent(new Event("storage"));
        } else {
             const errorText = await response.text();
             console.error(`${provider} Login Error:`, errorText);
             showError(`External login failed: ${errorText}`);
        }
    } catch(err) {
         console.error(err);
         showError("Network error check console");
    } finally {
         setLoading(false);
    }
  };

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

          <div className="social-login-section" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
             <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#ccc' }}></div>
                <span style={{ padding: '0 10px', color: '#666', fontSize: '0.8rem' }}>OR CONTINIE WITH</span>
                <div style={{ flex: 1, height: '1px', background: '#ccc' }}></div>
             </div>
             
             <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                     <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => showError('Google Login Failed')}
                        useOneTap
                    />
                </div>
             </GoogleOAuthProvider>

             <FacebookLogin
                appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                scope="public_profile,email"
                fields="name,email,picture"
                onFail={(error) => {
                    console.log('Login Failed!', error);
                    showError('Facebook Login Failed');
                }}
                onProfileSuccess={handleFacebookSuccess}
                render={({ onClick }) => (
                    <button onClick={onClick} style={{
                        backgroundColor: '#1877f2',
                        color: '#fff',
                        fontSize: '14px',
                        padding: '10px',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        Login with Facebook
                    </button>
                )}
             />
          </div>
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
