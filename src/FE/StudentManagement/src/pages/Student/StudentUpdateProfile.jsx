import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Save, ArrowLeft, Calendar, UserCheck, MapPin, CreditCard, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../../services/cloudinaryService';
import '../Profile.css';

const StudentUpdateProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        ethnicity: '',
        citizenIdImage: ''
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
             const storedUser = localStorage.getItem('user');
             if (storedUser) {
                 const user = JSON.parse(storedUser);
                 try {
                     const response = await fetch(`https://localhost:7115/api/Student/profile/${user.userId}`);
                     if (response.ok) {
                         const data = await response.json();
                         setFormData({
                             fullName: data.fullName || '',
                             email: data.email || '',
                             address: data.address || '',
                             dateOfBirth: data.dateOfBirth || '',
                             gender: data.gender || '',
                             ethnicity: data.ethnicity || '',
                             citizenIdImage: data.citizenIdImage || ''
                         });
                     }
                 } catch (error) {
                     console.error("Error fetching profile:", error);
                 }
             }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setUploading(true);
        try {
            const url = await uploadImage(file);
            setFormData({ ...formData, citizenIdImage: url });
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed");
        } finally {
             setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        const user = JSON.parse(storedUser);

        // Prepare data: Convert empty strings to null for optional fields like DateOfBirth
        const submitData = {
            ...formData,
            // If dateOfBirth is empty string, send null to avoid parsing error on backend
            dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null,
            // Ensure other fields are strings
            address: formData.address || "",
            gender: formData.gender || "",
            ethnicity: formData.ethnicity || "",
            citizenIdImage: formData.citizenIdImage || ""
        };

        try {
            const response = await fetch(`https://localhost:7115/api/Student/profile/${user.userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', // Ensure JSON content type
                },
                body: JSON.stringify(submitData)
            });

            if (response.ok) {
                alert("Profile updated successfully!");
                navigate('/profile');
            } else {
                // Try to get error details from response
                const errorText = await response.text();
                console.error("Server Error:", errorText);
                
                // Try to parse as JSON if it's a validation error object
                try {
                    const errorObj = JSON.parse(errorText);
                    if (errorObj.errors) {
                        // Extract validation errors
                        const messages = Object.values(errorObj.errors).flat().join(", ");
                        alert(`Failed to update: ${messages}`);
                    } else {
                        alert(`Failed to update profile: ${errorText}`);
                    }
                } catch {
                     alert(`Failed to update profile: ${errorText}`);
                }
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Network error updating profile.");
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
                    <h3>Update Profile</h3>
                    <form onSubmit={handleSubmit} className="info-group">
                        <div className="info-item">
                            <label>Full Name</label>
                            <div className="info-value">
                                <User size={18} />
                                <input 
                                    type="text" 
                                    name="fullName" 
                                    value={formData.fullName} 
                                    onChange={handleChange}
                                    style={{background:'transparent', border:'none', color:'white', flex:1, outline:'none'}}
                                />
                            </div>
                        </div>

                        <div className="info-item">
                            <label>Email</label>
                            <div className="info-value">
                                <Mail size={18} />
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange}
                                    style={{background:'transparent', border:'none', color:'white', flex:1, outline:'none'}}
                                />
                            </div>
                        </div>

                        <div className="info-item">
                            <label>Address</label>
                            <div className="info-value">
                                <MapPin size={18} />
                                <input 
                                    type="text" 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleChange}
                                    style={{background:'transparent', border:'none', color:'white', flex:1, outline:'none'}}
                                />
                            </div>
                        </div>

                        <div className="info-item">
                            <label>Date of Birth</label>
                            <div className="info-value">
                                <Calendar size={18} />
                                <input 
                                    type="date" 
                                    name="dateOfBirth" 
                                    value={formData.dateOfBirth} 
                                    onChange={handleChange}
                                    style={{background:'transparent', border:'none', color:'white', flex:1, outline:'none', colorScheme: 'dark'}}
                                />
                            </div>
                        </div>

                        <div className="info-item">
                            <label>Gender</label>
                            <div className="info-value">
                                <UserCheck size={18} />
                                <select 
                                    name="gender" 
                                    value={formData.gender} 
                                    onChange={handleChange}
                                    style={{background:'transparent', border:'none', color:'white', flex:1, outline:'none', cursor:'pointer'}}
                                >
                                    <option value="" style={{color:'black'}}>Select Gender</option>
                                    <option value="Male" style={{color:'black'}}>Male</option>
                                    <option value="Female" style={{color:'black'}}>Female</option>
                                    <option value="Other" style={{color:'black'}}>Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="info-item">
                            <label>Ethnicity</label>
                            <div className="info-value">
                                <User size={18} />
                                <input 
                                    type="text" 
                                    name="ethnicity" 
                                    value={formData.ethnicity} 
                                    onChange={handleChange}
                                    placeholder="e.g. Kinh, Tay, etc."
                                    style={{background:'transparent', border:'none', color:'white', flex:1, outline:'none'}}
                                />
                            </div>
                        </div>

                        <div className="info-item" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                            <label>Citizen ID Image</label>
                            <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'5px', width: '100%'}}>
                                {formData.citizenIdImage ? (
                                    <img src={formData.citizenIdImage} alt="Citizen ID" style={{height:'60px', borderRadius:'5px'}} />
                                ) : (
                                    <div style={{height:'60px', width:'60px', background:'rgba(255,255,255,0.1)', borderRadius:'5px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                        <ImageIcon size={24} />
                                    </div>
                                )}
                                <button type="button" onClick={() => fileInputRef.current.click()} className="btn-outline" style={{padding: '5px 10px', fontSize: '0.8rem'}}>
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    style={{display:'none'}}
                                    accept="image/*"
                                />
                            </div>
                        </div>
                        
                        <button type="submit" className="btn-outline" style={{background: '#4f46e5', borderColor: '#4f46e5', marginTop:'1rem'}} disabled={uploading}>
                            <Save size={18} /> Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentUpdateProfile;
