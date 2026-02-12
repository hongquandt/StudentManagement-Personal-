import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { GraduationCap, Save } from 'lucide-react';
import './Teacher.css';

const TeacherGradeEntry = () => {
    const { teacherId } = useOutletContext();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSemester, setSelectedSemester] = useState(1);
    // Ideally fetch subjects assigned to this teacher for this class. 
    // For now assuming a single subject or hardcoded logic as simplified in backend 
    // (backend assumes subjectId passed, let's hardcode Subject 1 or fetch from assignment logic if added later)
    // We inserted 'Hóa Học' as Subject ID 2 (or scope identity). Let's assume passed in props or we'll default to 1 for demo if 'Hóa Học' was 1.
    // Actually, let's fetch subjects later. For now, we use subjectId=1 (Math/Chem depending on DB state).
    const [selectedSubject, setSelectedSubject] = useState(1); 
    
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        if (teacherId) {
            fetch(`https://localhost:7115/api/Teacher/classes/${teacherId}`)
                .then(res => res.json())
                .then(data => {
                    setClasses(data);
                    if (data.length > 0) setSelectedClass(data[0].classId);
                })
                .catch(err => console.error(err));
        }
    }, [teacherId]);

    useEffect(() => {
        if (selectedClass && teacherId) {
             // In a real app, we'd fetch subjects taught by this teacher to this class here.
             // We'll proceed with default subjectId=1
             setLoading(true);
             fetch(`https://localhost:7115/api/Teacher/grades/${selectedClass}/${selectedSubject}/${selectedSemester}`)
                .then(res => res.json())
                .then(data => {
                    setStudents(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [selectedClass, selectedSemester, selectedSubject, teacherId]);

    const handleScoreChange = (studentId, field, value) => {
        setStudents(prev => prev.map(s => 
            s.studentId === studentId ? { ...s, [field]: value ? parseFloat(value) : null } : s
        ));
    };

    const handleSave = () => {
        setSaveStatus('Saving...');
        fetch(`https://localhost:7115/api/Teacher/grades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(students)
        })
        .then(res => {
            if (res.ok) {
                setSaveStatus('Grades saved!');
                setTimeout(() => setSaveStatus(''), 3000);
            } else {
                setSaveStatus('Failed to save.');
            }
        })
        .catch(err => setSaveStatus('Error saving.'));
    };

    return (
        <div className="teacher-page">
            <div className="dashboard-card mb-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title flex items-center gap-2">
                        <GraduationCap size={24} color="#4f46e5" />
                        Enter Student Grades
                    </h2>
                    {saveStatus && <span className={`text-sm font-medium ${saveStatus.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>{saveStatus}</span>}
                </div>

                <div className="filters flex gap-4 flex-wrap">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select 
                            className="form-control" 
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            {classes.map(c => (
                                <option key={c.classId} value={c.classId}>{c.className}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                         <select 
                            className="form-control"
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                         >
                            <option value={1}>Semester 1</option>
                            <option value={2}>Semester 2</option>
                         </select>
                    </div>
                </div>
            </div>

            <div className="dashboard-card">
                 {loading ? <p className="p-4 text-center">Loading grades...</p> : (
                    <div className="table-responsive">
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Student Name</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Oral (x1)</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>15 Min (x1)</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Midterm (x2)</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Final (x3)</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Average</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.studentId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px', fontWeight: '500' }}>{student.studentName}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <input 
                                                type="number" 
                                                min="0" max="10" step="0.1"
                                                className="form-control"
                                                style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                                value={student.oralScore ?? ''}
                                                onChange={(e) => handleScoreChange(student.studentId, 'oralScore', e.target.value)}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <input 
                                                type="number" 
                                                min="0" max="10" step="0.1"
                                                className="form-control"
                                                style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                                value={student.quizScore ?? ''}
                                                onChange={(e) => handleScoreChange(student.studentId, 'quizScore', e.target.value)}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <input 
                                                type="number" 
                                                min="0" max="10" step="0.1"
                                                className="form-control"
                                                style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                                value={student.midtermScore ?? ''}
                                                onChange={(e) => handleScoreChange(student.studentId, 'midtermScore', e.target.value)}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <input 
                                                type="number" 
                                                min="0" max="10" step="0.1"
                                                className="form-control"
                                                style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                                value={student.finalScore ?? ''}
                                                onChange={(e) => handleScoreChange(student.studentId, 'finalScore', e.target.value)}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                                            {/* Calculate visual average on client or display saved average */}
                                            {student.averageScore ? parseFloat(student.averageScore).toFixed(1) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {students.length === 0 && <p className="p-4 text-center text-gray-500">No students found.</p>}
                        
                        {students.length > 0 && (
                            <div className="mt-6 flex justify-end">
                                <button 
                                    onClick={handleSave}
                                    className="btn btn-primary flex items-center gap-2"
                                    style={{ padding: '10px 24px', background: '#4f46e5', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    <Save size={18} />
                                    Save Grades
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default TeacherGradeEntry;
