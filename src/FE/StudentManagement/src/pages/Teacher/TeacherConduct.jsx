import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BookOpen, Calendar, Save } from 'lucide-react';
import './Teacher.css';

const TeacherConduct = () => {
    const { teacherId } = useOutletContext();
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [semesterId, setSemesterId] = useState(1);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch classes
    useEffect(() => {
        if (teacherId) {
            fetch(`https://localhost:7115/api/Teacher/classes/${teacherId}`)
                .then(res => res.json())
                .then(data => setClasses(data))
                .catch(err => console.error(err));
        }
    }, [teacherId]);

    // Fetch conduct data
    useEffect(() => {
        if (selectedClassId && semesterId) {
            setLoading(true);
            fetch(`https://localhost:7115/api/Teacher/conduct/${selectedClassId}/${semesterId}`)
                .then(res => res.json())
                .then(data => {
                    setStudents(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        } else {
            setStudents([]);
        }
    }, [selectedClassId, semesterId]);

    const handleConductChange = (studentId, value) => {
        setStudents(prev => prev.map(s => 
            s.studentId === studentId ? { ...s, conductLevel: value } : s
        ));
    };

    const handleCommentChange = (studentId, value) => {
        setStudents(prev => prev.map(s => 
            s.studentId === studentId ? { ...s, comment: value } : s
        ));
    };

    const handleSave = () => {
        fetch('https://localhost:7115/api/Teacher/conduct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(students)
        })
        .then(res => {
            if (res.ok) alert('Conduct saved!');
            else alert('Failed to save conduct.');
        })
        .catch(err => console.error(err));
    };

    return (
        <div className="teacher-page">
            <div className="dashboard-card mb-6">
                <div className="card-header">
                    <h2 className="card-title flex items-center gap-2">
                        <BookOpen size={24} color="#4f46e5"/>
                        Student Conduct Assessment
                    </h2>
                </div>
                <div className="card-body">
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="block text-sm font-medium mb-1">Select Class</label>
                            <select 
                                className="form-control"
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                            >
                                <option value="">-- Select Class --</option>
                                {classes.map(c => (
                                    <option key={c.classId} value={c.classId}>{c.className}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="block text-sm font-medium mb-1">Semester</label>
                            <select 
                                className="form-control"
                                value={semesterId}
                                onChange={(e) => setSemesterId(parseInt(e.target.value))}
                            >
                                <option value={1}>Semester 1</option>
                                <option value={2}>Semester 2</option>
                            </select>
                        </div>
                   </div>
                </div>
            </div>

            {selectedClassId && (
                <div className="dashboard-card">
                    <div className="card-header flex justify-between items-center">
                        <h3 className="card-title">Detailed Assessment</h3>
                        <button className="btn btn-primary flex items-center gap-2" onClick={handleSave}>
                            <Save size={18}/> Save Conduct
                        </button>
                    </div>
                    
                    {loading ? <div className="p-4">Loading...</div> : (
                        <div className="table-responsive">
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ padding: '12px' }}>ID</th>
                                        <th style={{ padding: '12px' }}>Student Name</th>
                                        <th style={{ padding: '12px' }}>Conduct Grade</th>
                                        <th style={{ padding: '12px' }}>Notes / Comments</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.studentId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '12px' }}>{s.studentId}</td>
                                            <td style={{ padding: '12px', fontWeight: '500' }}>{s.studentName}</td>
                                            <td style={{ padding: '12px' }}>
                                                <select 
                                                    value={s.conductLevel || ''} 
                                                    onChange={(e) => handleConductChange(s.studentId, e.target.value)}
                                                    style={{ 
                                                        padding: '8px', 
                                                        borderRadius: '6px', 
                                                        border: '1px solid #d1d5db',
                                                        width: '150px'
                                                    }}
                                                >
                                                    <option value="">-- Rate --</option>
                                                    <option value="Tốt">Tốt (Good)</option>
                                                    <option value="Khá">Khá (Fair)</option>
                                                    <option value="Trung Bình">Trung Bình (Average)</option>
                                                    <option value="Yếu">Yếu (Weak)</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <input 
                                                    type="text" 
                                                    value={s.comment || ''}
                                                    onChange={(e) => handleCommentChange(s.studentId, e.target.value)}
                                                    placeholder="Add comment..."
                                                    style={{ 
                                                        padding: '8px', 
                                                        borderRadius: '6px', 
                                                        border: '1px solid #d1d5db', 
                                                        width: '100%' 
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {students.length === 0 && <p className="p-4 text-center">No students found.</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default TeacherConduct;
