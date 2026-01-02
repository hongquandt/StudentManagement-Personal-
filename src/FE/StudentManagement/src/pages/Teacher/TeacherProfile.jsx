import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Mail, Shield, Book, Phone } from 'lucide-react';

const TeacherProfile = () => {
    const { user } = useOutletContext(); // Get user from layout context to start
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      if (user?.userId) {
        fetch(`https://localhost:7115/api/Teacher/profile/${user.userId}`)
          .then(res => res.json())
          .then(data => {
            setProfile(data);
            setLoading(false);
          })
          .catch(err => {
             console.error(err);
             setLoading(false);
          });
      }
    }, [user?.userId]);
  
    if (loading) return <div>Loading profile...</div>;
    if (!profile) return <div>Full profile not found.</div>;
    
    // profile object from backend is Teacher entity including User: { teacherId, fullName, specialization, phone, user: { email, username, ... } }
  
    return (
      <div className="dashboard-card">
        <div className="card-header">
           <h3 className="card-title">My Profile</h3>
           <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
               Edit Profile
           </button>
        </div>
        
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#4f46e5', border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                 {profile.user?.avatarUrl ? <img src={profile.user.avatarUrl} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}/> : (profile.fullName?.[0] || 'T')}
              </div>
              <span style={{ padding: '4px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                 Teacher
              </span>
           </div>
  
           <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="info-group">
                 <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Full Name</label>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '500' }}>
                    <User size={18} color="#9ca3af" />
                    {profile.fullName || 'N/A'}
                 </div>
              </div>
  
              <div className="info-group">
                 <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Username</label>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '500' }}>
                    <Shield size={18} color="#9ca3af" />
                    {profile.user?.username || 'N/A'}
                 </div>
              </div>
  
              <div className="info-group">
                 <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Email</label>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '500' }}>
                    <Mail size={18} color="#9ca3af" />
                    {profile.user?.email || 'N/A'}
                 </div>
              </div>

              <div className="info-group">
                 <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Specialization</label>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '500' }}>
                    <Book size={18} color="#9ca3af" />
                    {profile.specialization || 'N/A'}
                 </div>
              </div>

              <div className="info-group">
                 <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Phone</label>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '500' }}>
                    <Phone size={18} color="#9ca3af" />
                    {profile.phone || 'N/A'}
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };
  export default TeacherProfile;
