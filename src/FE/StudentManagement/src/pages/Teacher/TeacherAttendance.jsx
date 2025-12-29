import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ClipboardCheck, Save, Calendar, CheckCircle, XCircle } from 'lucide-react';
import './Teacher.css';

const TeacherAttendance = () => {
    const { teacherId } = useOutletContext();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        if (teacherId) {
            // Fetch list of classes taught by this teacher
            fetch(`https://localhost:7115/api/Teacher/classes/${teacherId}`)
                .then(res => res.json())
                .then(data => {
                    setClasses(data);
                    if (data.length > 0) setSelectedClass(data[0].classId);
                })
                .catch(err => console.error(err));
        }
    }, [teacherId]);

    // Fetch attendance when class or date changes
    useEffect(() => {
        if (selectedClass && selectedDate && teacherId) {
            setLoading(true);
            fetch(`https://localhost:7115/api/Teacher/attendance/${selectedClass}/${selectedDate}`)
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
    }, [selectedClass, selectedDate, teacherId]);

    const handleStatusChange = (studentId, status) => {
        setStudents(prev => prev.map(s => 
            s.studentId === studentId ? { ...s, status: status } : s
        ));
    };

    const handleSave = () => {
        setSaveStatus('Saving...');
        fetch(`https://localhost:7115/api/Teacher/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(students) // Students array already matches AttendanceDto structure mostly
        })
        .then(res => {
            if (res.ok) {
                setSaveStatus('Saved successfully!');
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
                        <ClipboardCheck size={24} color="#4f46e5" />
                        Record Attendance
                    </h2>
                    {saveStatus && <span className={`text-sm font-medium ${saveStatus.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>{saveStatus}</span>}
                </div>
                
                <div className="filters flex gap-4 flex-wrap">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
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
                         <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                         <input 
                            type="date" 
                            className="form-control"
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                         />
                    </div>
                </div>
            </div>

            <div className="dashboard-card">
                {loading ? <p className="p-4 text-center">Loading student list...</p> : (
                    <div className="table-responsive">
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Student Name</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Present</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Absent</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Late</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.studentId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px', fontWeight: '500' }}>{student.studentName}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <input 
                                                type="radio" 
                                                name={`status-${student.studentId}`} 
                                                checked={student.status?.toLowerCase() === 'present' || student.status?.toLowerCase() === 'có mặt'}
                                                onChange={() => handleStatusChange(student.studentId, 'Present')}
                                                style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <input 
                                                type="radio" 
                                                name={`status-${student.studentId}`} 
                                                checked={student.status?.toLowerCase() === 'absent' || student.status?.toLowerCase() === 'vắng'}
                                                onChange={() => handleStatusChange(student.studentId, 'Absent')}
                                                style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                             <input 
                                                type="radio" 
                                                name={`status-${student.studentId}`} 
                                                checked={student.status?.toLowerCase() === 'late' || student.status?.toLowerCase() === 'trễ'}
                                                onChange={() => handleStatusChange(student.studentId, 'Late')}
                                                style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {students.length === 0 && <p className="p-4 text-center text-gray-500">No students found for this class.</p>}
                        
                        {students.length > 0 && (
                            <div className="mt-6 flex justify-end">
                                <button 
                                    onClick={handleSave}
                                    className="btn btn-primary flex items-center gap-2"
                                    style={{ padding: '10px 24px', background: '#4f46e5', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    <Save size={18} />
                                    Save Attendance
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default TeacherAttendance;
