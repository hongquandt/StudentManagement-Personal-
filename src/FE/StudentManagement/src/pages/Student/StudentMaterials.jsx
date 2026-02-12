import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Book, ArrowLeft } from 'lucide-react';

const StudentMaterials = () => {
    const { user } = useOutletContext() || {}; 
    // Wait, useOutletContext might not supply user directly if not in layout, assume passed or fetch. 
    // In Profile.jsx flow, we usually get user from localStorage or context. 
    // Let's rely on localStorage if context missing.

    const [studentId, setStudentId] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser?.userId) {
            // Need to get StudentID from UserID first if not stored.
            // But Profile.jsx usually navigates here.
            fetch(`https://localhost:7115/api/Student/profile/${storedUser.userId}`)
                .then(res => res.json())
                .then(data => {
                    setStudentId(data.studentId);
                })
                .catch(err => console.error(err));
        }
    }, []);

    useEffect(() => {
        if (studentId) {
            fetch(`https://localhost:7115/api/Student/materials/${studentId}`)
                .then(res => res.json())
                .then(data => {
                    setMaterials(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [studentId]);

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#6b7280', marginBottom: '20px' }}>
                <ArrowLeft size={18} /> Back to Profile
            </Link>
            
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '10px', background: '#dbeafe', borderRadius: '12px', color: '#2563eb' }}>
                        <Book size={32} />
                    </div>
                    Learning Materials
                </h1>

                {loading ? <p>Loading materials...</p> : (
                    <div>
                        {materials.length === 0 ? <p>No materials uploaded for your classes yet.</p> : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {materials.map(mat => (
                                    <div key={mat.materialId} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <div style={{ marginBottom: 'auto' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                                                {mat.className}
                                            </span>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '10px 0', color: '#1f2937' }}>{mat.title}</h3>
                                            <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '15px' }}>{mat.description}</p>
                                        </div>
                                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '15px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{new Date(mat.uploadDate).toLocaleDateString()}</span>
                                            {mat.filePath && (
                                                <a 
                                                    href={mat.filePath.startsWith('/uploads') ? `https://localhost:7115${mat.filePath}` : mat.filePath} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}
                                                >
                                                    Open Resource →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentMaterials;
