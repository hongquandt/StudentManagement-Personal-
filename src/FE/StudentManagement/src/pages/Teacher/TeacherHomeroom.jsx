import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, BookOpen, Edit, Save, X, Mail, MapPin, Calendar, User as UserIcon } from 'lucide-react';
import './Teacher.css';

const TeacherHomeroom = () => {
    const context = useOutletContext();
    const teacherId = context?.teacherId;
    
    const [classData, setClassData] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Edit Modal State
    const [editingStudent, setEditingStudent] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Fetch Data
    useEffect(() => {
        if (!teacherId) return;

        setLoading(true);
        fetch(`https://localhost:7115/api/Teacher/homeroom/${teacherId}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch homeroom data');
                return res.json();
            })
            .then(data => {
                if (data && data.classInfo) {
                    setClassData(data.classInfo);
                    setStudents(data.students || []);
                } else {
                    setError("No class assigned to this teacher.");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching homeroom:", err);
                setError(err.message);
                setLoading(false);
            });
    }, [teacherId]);

    const handleEditClick = (student) => {
        setEditingStudent(student);
        setEditForm({
            fullName: student.fullName || '',
            gender: student.gender || '',
            dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
            address: student.address || '',
            status: student.status || 'Đang học'
        });
    };

    const handleSaveEdit = () => {
        if (!editingStudent) return;

        fetch(`https://localhost:7115/api/Teacher/student/${editingStudent.studentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm)
        })
        .then(res => {
            if (res.ok) {
                alert("Student profile updated!");
                setStudents(prev => prev.map(s => 
                    s.studentId === editingStudent.studentId 
                    ? { ...s, ...editForm } 
                    : s
                ));
                setEditingStudent(null);
            } else {
                alert("Failed to update student.");
            }
        })
        .catch(err => console.error("Error updating student:", err));
    };

    if (!teacherId && !loading) return <div style={{padding:'20px', color:'#333'}}>Loading teacher profile...</div>;
    if (loading) return <div style={{padding:'20px', color:'#333'}}>Loading class data...</div>;
    if (error) return <div style={{padding:'20px', color:'red'}}>Error: {error}</div>;
    if (!classData) return <div style={{padding:'20px', color:'#333'}}>No homeroom class assigned.</div>;

    return (
        <div className="teacher-page">
            {/* Class Info Card */}
            <div className="dashboard-card mb-6" style={{ background: 'linear-gradient(to right, #4f46e5, #818cf8)', color: 'white' }}>
                <div className="card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                    <h2 className="card-title flex items-center gap-2" style={{ color: 'white' }}>
                        <BookOpen size={24} color="white" />
                        Homeroom: {classData.className}
                    </h2>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>
                        Grade {classData.grade}
                    </span>
                </div>
                <div className="card-body" style={{ display: 'flex', gap: '40px' }}>
                    <div>
                        <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Academic Year ID</p>
                        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{classData.academicYearId}</p>
                    </div>
                    <div>
                        <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Total Students</p>
                        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{students.length}</p>
                    </div>
                </div>
            </div>

            {/* Student List Card */}
            <div className="dashboard-card">
                <div className="card-header">
                    <h3 className="card-title flex items-center gap-2">
                        <Users size={20} />
                        Student List (Detailed)
                    </h3>
                </div>
                <div className="table-responsive">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '12px' }}>Student</th>
                                <th style={{ padding: '12px' }}>Gender</th>
                                <th style={{ padding: '12px' }}>DOB</th>
                                <th style={{ padding: '12px' }}>Address</th>
                                <th style={{ padding: '12px' }}>Ethnicity</th>
                                <th style={{ padding: '12px' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.studentId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {student.user?.avatarUrl ? (
                                                <img src={student.user.avatarUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                    {student.fullName?.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: '500', color: '#111827' }}>{student.fullName}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Mail size={12}/> {student.user?.email || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', color: '#374151' }}>{student.gender || '-'}</td>
                                    <td style={{ padding: '12px', color: '#374151' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} className="text-gray-400"/>
                                            {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', color: '#374151' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <MapPin size={14} className="text-gray-400"/>
                                            {student.address || '-'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', color: '#374151' }}>{student.user?.ethnicity || '-'}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '15px', 
                                            background: student.status === 'Đang học' ? '#d1fae5' : '#fee2e2', 
                                            color: student.status === 'Đang học' ? '#065f46' : '#991b1b',
                                            fontSize: '0.85rem',
                                            display: 'inline-block'
                                        }}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleEditClick(student)}
                                            style={{ 
                                                border: 'none', 
                                                background: 'transparent', 
                                                color: '#4f46e5', 
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            <Edit size={16} /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {students.length === 0 && <p style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>No students found in this class.</p>}
                </div>
            </div>

            {/* Modal */}
            {editingStudent && (
                 <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>Edit Profile: {editingStudent.fullName}</h3>
                            <button onClick={() => setEditingStudent(null)} style={{ background: 'transparent', color: '#9ca3af' }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Full Name</label>
                                <input 
                                   className="form-control" 
                                   value={editForm.fullName} 
                                   onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                                   style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Gender</label>
                                <select 
                                   className="form-control" 
                                   value={editForm.gender} 
                                   onChange={e => setEditForm({...editForm, gender: e.target.value})}
                                   style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Date of Birth</label>
                                <input 
                                   type="date"
                                   className="form-control" 
                                   value={editForm.dateOfBirth} 
                                   onChange={e => setEditForm({...editForm, dateOfBirth: e.target.value})}
                                   style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Address</label>
                                <input 
                                   className="form-control" 
                                   value={editForm.address} 
                                   onChange={e => setEditForm({...editForm, address: e.target.value})}
                                   style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Status</label>
                                <select 
                                   className="form-control" 
                                   value={editForm.status} 
                                   onChange={e => setEditForm({...editForm, status: e.target.value})}
                                   style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                >
                                    <option value="Đang học">Đang học</option>
                                    <option value="Nghỉ học">Nghỉ học</option>
                                    <option value="Bảo lưu">Bảo lưu</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button onClick={() => setEditingStudent(null)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                            <button onClick={handleSaveEdit} style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherHomeroom;


