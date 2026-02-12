import React, { useState, useEffect } from 'react';
import { Search, UserPlus, CheckCircle, ArrowRight, X } from 'lucide-react';

const AdminAssignStudent = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchInit = async () => {
            setLoading(true);
            try {
                const [clsRes, userRes] = await Promise.all([
                    fetch('https://localhost:7115/api/Admin/classes'),
                    fetch('https://localhost:7115/api/Admin/users')
                ]);
                
                if (clsRes.ok) setClasses(await clsRes.json());
                if (userRes.ok) {
                    const allUsers = await userRes.json();
                    // Filter for active students
                    const studList = allUsers
                        .filter(u => u.role?.roleName?.toLowerCase() === 'student' && u.isActive && u.student)
                        .map(u => ({
                            studentId: u.student.studentId,
                            fullName: u.student.fullName,
                            username: u.username,
                            enrollmentYear: u.student.enrollmentYear
                        }));
                    setStudents(studList);
                }
            } catch(e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchInit();
    }, []);

    const handleAssign = async (studentId) => {
        if (!selectedClass) {
            alert("Please select a target class first.");
            return;
        }
        
        setSubmitting(true);
        try {
            const res = await fetch(`https://localhost:7115/api/Admin/classes/${selectedClass}/assign-student`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(studentId)
            });
            
            if (res.ok) {
                alert(`Student assigned to class successfully!`);
            } else {
                alert("Failed to assign student.");
            }
        } catch(e) { console.error(e); }
        finally { setSubmitting(false); }
    };

    const filteredStudents = students.filter(s => 
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-page fade-in">
             <div className="page-header">
                <div>
                   <h2 className="page-title">Assign Students</h2>
                   <p className="page-subtitle">Add students to classes manually</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="card-body">
                    {/* Class Selector */}
                    <div className="form-group mb-6">
                        <label className="text-sm font-semibold mb-2 block">Select Target Class</label>
                        <select 
                            className="form-input" 
                            value={selectedClass} 
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">-- Choose a Class --</option>
                            {classes.map(c => (
                                <option key={c.classId} value={c.classId}>
                                    {c.className} (Grade {c.grade})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="divider"></div>

                    {/* Student Search */}
                    <div className="search-bar mb-4">
                        <Search size={18} className="search-icon"/>
                        <input 
                            type="text" 
                            placeholder="Search student by name or username..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Student List */}
                    <div className="student-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {loading ? <p className="text-center p-4">Loading students...</p> : (
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Student Info</th>
                                        <th>Year</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center p-4">No students found.</td></tr>
                                    ) : filteredStudents.map(s => (
                                        <tr key={s.studentId}>
                                            <td>
                                                <div className="font-medium">{s.fullName}</div>
                                                <div className="text-xs text-gray-500">@{s.username}</div>
                                            </td>
                                            <td>{s.enrollmentYear}</td>
                                            <td>
                                                <button 
                                                    className="btn-icon-text primary small"
                                                    onClick={() => handleAssign(s.studentId)}
                                                    disabled={submitting || !selectedClass}
                                                >
                                                    <UserPlus size={16}/> Assign
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
            `}</style>
        </div>
    );
};

export default AdminAssignStudent;
