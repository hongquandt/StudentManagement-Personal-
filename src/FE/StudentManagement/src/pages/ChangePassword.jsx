import React, { useState } from 'react';
import { Lock, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        const user = JSON.parse(storedUser);

        try {
            const response = await fetch('https://localhost:7115/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.userId,
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword
                })
            });

            if (response.ok) {
                alert("Password changed successfully!");
                navigate('/profile');
            } else {
                const errorText = await response.text();
                alert(errorText || "Failed to change password.");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert("Error changing password.");
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-blur-bg"></div>
            <div className="profile-content">
                <button onClick={() => navigate('/profile')} className="back-btn" style={{background: 'none', border:'none', cursor:'pointer'}}>
                    <ArrowLeft size={20} /> Back to Profile
                </button>

                <div className="profile-card">
                    <h3>Change Password</h3>
                    <form onSubmit={handleSubmit} className="info-group">
                        <div className="info-item">
                            <label>Old Password</label>
                            <div className="info-value">
                                <Lock size={18} />
                                <input 
                                    type="password" 
                                    name="oldPassword" 
                                    value={formData.oldPassword} 
                                    onChange={handleChange}
                                    required
                                    style={{background:'transparent', border:'none', color:'white', flex:1, outline:'none'}}
                                />
                            </div>
                        </div>

                        <div className="info-item">
                            <label>New Password</label>
                            <div className="info-value">
                                <Lock size={18} />
                                <input 
                                    type="password" 
                                    name="newPassword" 
                                    value={formData.newPassword} 
                                    onChange={handleChange}
                                    required
                                    style={{background:'transparent', border:'none', color:'white', flex:1, outline:'none'}}
                                />
                            </div>
                        </div>

                        <div className="info-item">
                            <label>Confirm New Password</label>
                            <div className="info-value">
                                <Lock size={18} />
                                <input 
                                    type="password" 
                                    name="confirmPassword" 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange}
                                    required
                                    style={{background:'transparent', border:'none', color:'white', flex:1, outline:'none'}}
                                />
                            </div>
                        </div>
                        
                        <button type="submit" className="btn-outline" style={{background: '#4f46e5', borderColor: '#4f46e5', marginTop:'1rem'}}>
                            <Save size={18} /> Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
