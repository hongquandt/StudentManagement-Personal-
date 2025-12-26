import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Shield, Camera, Edit2, LogOut, ArrowLeft, Calendar, Award, Clock, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { uploadImage } from '../services/cloudinaryService';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

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

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const avatarUrl = await uploadImage(file);
            
            const response = await fetch('https://localhost:7115/api/auth/update-avatar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: user.username,
                    avatarUrl: avatarUrl
                }),
            });

            if (response.ok) {
                const newUser = { ...user, avatarUrl };
                setUser(newUser);
                localStorage.setItem('user', JSON.stringify(newUser));
                alert("Avatar updated successfully!");
            } else {
                alert("Failed to update avatar on server.");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
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
                            <button className="change-avatar-btn" onClick={handleAvatarClick} disabled={uploading}>
                                <Camera size={16} />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                style={{ display: 'none' }} 
                                accept="image/*" 
                            />
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
                        <div style={{display:'flex', gap:'10px'}}>
                            <button className="btn btn-outline edit-profile-btn" onClick={() => navigate('/student/update-profile')}>
                                <Edit2 size={16} /> Edit Profile
                            </button>
                            <button className="btn btn-outline edit-profile-btn" onClick={() => navigate('/change-password')}>
                                <Lock size={16} /> Change Password
                            </button>
                        </div>
                    </div>

                    <div className="profile-card stats-card">
                         <h3>Student Services</h3>
                         <div className="services-grid" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '10px'}}>
                            <button className="btn btn-outline" onClick={() => navigate('/student/attendance')} style={{justifyContent: 'flex-start', marginTop: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)'}}>
                                <span style={{marginRight: 'auto', display:'flex', alignItems:'center', gap: '10px'}}><Calendar size={16} /> Check Attendance</span>
                            </button>
                            <button className="btn btn-outline" onClick={() => navigate('/student/score')} style={{justifyContent: 'flex-start', marginTop: '0.5rem', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)'}}>
                                <span style={{marginRight: 'auto', display:'flex', alignItems:'center', gap: '10px'}}><Award size={16} /> View Score</span>
                            </button>
                            <button className="btn btn-outline" onClick={() => navigate('/student/timetable')} style={{justifyContent: 'flex-start', marginTop: '0.5rem', background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)'}}>
                                <span style={{marginRight: 'auto', display:'flex', alignItems:'center', gap: '10px'}}><Clock size={16} /> View Timetable</span>
                            </button>
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
