import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Camera, Edit2, LogOut, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="profile-container">
             <div className="profile-blur-bg"></div>
             
             <div className="profile-content">
                <Link to="/" className="back-btn">
                    <ArrowLeft size={20} /> Back Home
                </Link>

                <div className="profile-header">
                    <div className="profile-cover"></div>
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                            <button className="change-avatar-btn">
                                <Camera size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="profile-title">
                        <h1>{user.fullName || user.username}</h1>
                        <span className="role-badge">{user.role || 'Student'}</span>
                    </div>
                </div>

                <div className="profile-grid">
                    <div className="profile-card info-card">
                        <h3>Personal Information</h3>
                        <div className="info-group">
                            <div className="info-item">
                                <label>Full Name</label>
                                <div className="info-value">
                                    <User size={18} />
                                    <span>{user.fullName || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <label>Username</label>
                                <div className="info-value">
                                    <Shield size={18} />
                                    <span>{user.username}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <label>Email</label>
                                <div className="info-value">
                                    <Mail size={18} />
                                    <span>{user.email || 'No email provided'}</span>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-outline edit-profile-btn">
                            <Edit2 size={16} /> Edit Profile
                        </button>
                    </div>

                    <div className="profile-card stats-card">
                        <h3>Account Status</h3>
                        {/* Placeholder stats */}
                         <div className="stat-row">
                            <span>Status</span>
                            <span className="status-active">Active</span>
                         </div>
                         <div className="stat-row">
                            <span>Member Since</span>
                            <span>{new Date().getFullYear()}</span>
                         </div>
                         
                         <div className="divider"></div>
                         
                         <button className="btn btn-danger logout-btn" onClick={handleLogout}>
                            <LogOut size={16} /> Logout
                         </button>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default Profile;
