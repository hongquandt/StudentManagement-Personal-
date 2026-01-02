import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Book, Phone, Lock, Save, X } from 'lucide-react';

const TeacherProfile = () => {
    const { user } = useOutletContext(); // Get user from layout context to start
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
  
    const fetchProfile = () => {
        if (user?.userId) {
            setLoading(true);
            fetch(`https://localhost:7115/api/Teacher/profile/${user.userId}`)
              .then(res => res.json())
              .then(data => {
                setProfile(data);
                setFormData({
                    fullName: data.fullName,
                    specialization: data.specialization,
                    phone: data.phone
                });
                setLoading(false);
              })
              .catch(err => {
                 console.error(err);
                 setLoading(false);
              });
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user?.userId]);

    const handleSave = async () => {
        try {
            const res = await fetch(`https://localhost:7115/api/Teacher/profile/${profile.teacherId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsEditing(false);
                fetchProfile(); // Refresh
                alert("Profile updated successfully!");
            } else {
                alert("Failed to update profile.");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating profile.");
        }
    };

    if (loading) return <div>Loading profile...</div>;
    if (!profile) return <div>Full profile not found.</div>;
    
    return (

      <div className="teacher-page">
         <div className="dashboard-card mb-6" style={{ background: 'linear-gradient(to right, #4f46e5, #818cf8)', color: 'white' }}>
            <div className="flex items-center gap-6">
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#4f46e5', border: '4px solid rgba(255,255,255,0.3)' }}>
                    {profile.user?.avatarUrl ? <img src={profile.user.avatarUrl} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}/> : (profile.fullName?.[0] || 'T')}
                </div>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{profile.fullName || 'Teacher Name'}</h1>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                        <span style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px' }}>Teacher</span>
                        <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{profile.specialization}</span>
                    </div>
                </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="dashboard-card md:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="card-title flex items-center gap-2">
                        <User size={20} color="#4f46e5" />
                        Personal Information
                    </h3>
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="btn btn-primary" style={{ background: '#10b981', display:'flex', alignItems:'center', gap:'5px' }}>
                                <Save size={16}/> Save
                            </button>
                            <button onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                                <X size={16}/> Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label className="text-sm text-gray-500 mb-1 block">Full Name</label>
                        {isEditing ? (
                            <input 
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                value={formData.fullName || ''}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            />
                        ) : (
                            <div className="text-lg font-medium text-gray-800">{profile.fullName || 'N/A'}</div>
                        )}
                    </div>
                     <div className="form-group">
                        <label className="text-sm text-gray-500 mb-1 block">Username</label>
                        <div className="flex items-center gap-2 text-lg font-medium text-gray-800">
                             <Shield size={16} color="#9ca3af" /> 
                             {profile.user?.username}
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="text-sm text-gray-500 mb-1 block">Email Address</label>
                         <div className="flex items-center gap-2 text-lg font-medium text-gray-800">
                             <Mail size={16} color="#9ca3af" /> 
                             {profile.user?.email || 'N/A'}
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="text-sm text-gray-500 mb-1 block">Phone Number</label>
                        {isEditing ? (
                            <input 
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        ) : (
                             <div className="flex items-center gap-2 text-lg font-medium text-gray-800">
                                 <Phone size={16} color="#9ca3af" /> 
                                 {profile.phone || 'N/A'}
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label className="text-sm text-gray-500 mb-1 block">Specialization</label>
                         {isEditing ? (
                            <input 
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                value={formData.specialization || ''}
                                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                            />
                        ) : (
                             <div className="flex items-center gap-2 text-lg font-medium text-gray-800">
                                 <Book size={16} color="#9ca3af" /> 
                                 {profile.specialization || 'N/A'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="dashboard-card">
                 <h3 className="card-title mb-4 flex items-center gap-2">
                    <Shield size={20} color="#4f46e5" />
                    Security
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <p className="text-sm text-gray-600 mb-4">Manage your password and security capability.</p>
                    <button 
                        onClick={() => navigate('/change-password')}
                        className="w-full py-2 px-4 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center gap-2 font-medium text-gray-700 transition"
                    >
                        <Lock size={16} /> Change Password
                    </button>
                </div>
            </div>
         </div>
      </div>
    );
  };
export default TeacherProfile;
