import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Auth.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { success, error: showError } = useToast();
    
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const t = searchParams.get('token');
        const e = searchParams.get('email');
        if (t) setToken(t);
        if (e) setEmail(e);
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://localhost:7115/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword: password })
            });

            if (response.ok) {
                success('Password reset successfully. Please login.');
                navigate('/login');
            } else {
                 const text = await response.text();
                showError(text || 'Failed to reset password.');
            }
        } catch (err) {
            showError('Network error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Link to="/login" className="back-home">
                <ArrowLeft size={18} /> Back to Login
            </Link>

            <div className="auth-card">
                <div className="auth-header">
                    <h2>Reset Password</h2>
                    <p>Create a new password for your account.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <input type="hidden" value={email} />
                    <input type="hidden" value={token} />
                    
                    <div className="form-group">
                        <label>New Password</label>
                        <div className="input-wrapper">
                            <Lock size={20} />
                            <input 
                                type="password" 
                                className="form-input" 
                                placeholder="Enter new password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock size={20} />
                            <input 
                                type="password" 
                                className="form-input" 
                                placeholder="Confirm new password" 
                                required 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Reseting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
