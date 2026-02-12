import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserPlus, Users, BookOpen, Eye } from 'lucide-react';

const AdminClasses = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [years, setYears] = useState([]);
    
    const [loading, setLoading] = useState(true);
    
    // UI State
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'create' | 'assignments'
    const [selectedClass, setSelectedClass] = useState(null);
    
    // Details Modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [classDetails, setClassDetails] = useState(null);

    // Create Class Form
    const [classForm, setClassForm] = useState({ className: '', grade: 10, academicYearId: '', homeroomTeacherId: '' });

    // Assignment Form
    const [assignForm, setAssignForm] = useState({ subjectId: '', teacherId: '', semesterId: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [clsRes, teaRes, subRes, semRes, yrRes] = await Promise.all([
                 fetch('https://localhost:7115/api/Admin/classes'),
                 fetch('https://localhost:7115/api/Admin/teachers-simple'), 
                 fetch('https://localhost:7115/api/Admin/subjects'),
                 fetch('https://localhost:7115/api/Admin/semesters'),
                 fetch('https://localhost:7115/api/Admin/academic-years')
            ]);
            
            if (clsRes.ok) setClasses(await clsRes.json());
            if (teaRes.ok) setTeachers(await teaRes.json());
            if (subRes.ok) setSubjects(await subRes.json());
            if (semRes.ok) setSemesters(await semRes.json());
            if (yrRes.ok) setYears(await yrRes.json());

        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        const payload = {
            className: classForm.className,
            grade: parseInt(classForm.grade),
            academicYearId: parseInt(classForm.academicYearId),
            homeroomTeacherId: classForm.homeroomTeacherId ? parseInt(classForm.homeroomTeacherId) : null 
        };

        try {
            const res = await fetch('https://localhost:7115/api/Admin/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                fetchInitialData();
                setViewMode('list');
                setClassForm({ className: '', grade: 10, academicYearId: '', homeroomTeacherId: '' });
                alert("Class created successfully!");
            } else {
                const text = await res.text();
                alert(`Failed to create class: ${text}`);
            }
        } catch(err) { console.error(err); }
    };

    const handleAssignHomeroom = async (classId, teacherId) => {
        try {
            const res = await fetch(`https://localhost:7115/api/Admin/classes/${classId}/assign-homeroom`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parseInt(teacherId)) 
            });
             if (res.ok) {
                fetchInitialData();
                alert("Homeroom teacher assigned!");
            } else {
                alert("Failed to assign");
            }
        } catch(err) { console.error(err); }
    };

    const handleAssignSubjectTeacher = async (e) => {
        e.preventDefault();
        if(!selectedClass) return;

        const payload = {
            classId: selectedClass.classId,
            subjectId: parseInt(assignForm.subjectId),
            teacherId: parseInt(assignForm.teacherId),
            semesterId: parseInt(assignForm.semesterId)
        };

        try {
            const res = await fetch('https://localhost:7115/api/Admin/assignments', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert("Subject Teacher Assigned!");
            } else {
                const txt = await res.text();
                alert("Failed: " + txt);
            }
        } catch(err) { console.error(err); }
    };

    const handleViewDetails = async (id) => {
        try {
            const res = await fetch(`https://localhost:7115/api/Admin/classes/${id}`);
            if (res.ok) {
                const data = await res.json();
                setClassDetails(data);
                setShowDetailModal(true);
            } else {
                alert("Failed to fetch class details");
            }
        } catch(e) { console.error(e); }
    };

    const renderListView = () => (
        <div className="table-card">
            <table className="modern-table">
                <thead>
                    <tr>
                        <th>Class Name</th>
                        <th>Grade</th>
                        <th>Academic Year</th>
                        <th>Homeroom Teacher</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {classes.map(cls => (
                        <tr key={cls.classId}>
                            <td className="font-medium">{cls.className}</td>
                            <td>{cls.grade}</td>
                            <td>{cls.academicYear?.yearName}</td>
                            <td>
                                {cls.homeroomTeacher ? (
                                    <span className="badge success">{cls.homeroomTeacher.fullName}</span>
                                ) : (
                                    <div className="flex-center-row" style={{justifyContent: 'flex-start', gap: '8px'}}>
                                        <select 
                                            className="small-select"
                                            onChange={(e) => {
                                                if(window.confirm(`Assign ${e.target.options[e.target.selectedIndex].text} as homeroom teacher?`)) {
                                                    handleAssignHomeroom(cls.classId, e.target.value);
                                                }
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select Teacher</option>
                                            {teachers.map(t => (
                                                <option key={t.teacherId} value={t.teacherId}>{t.fullName}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button 
                                        className="icon-btn primary" 
                                        title="View Details"
                                        onClick={() => handleViewDetails(cls.classId)}
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button 
                                        className="icon-btn info" 
                                        title="Manage Assignments"
                                        onClick={() => { setSelectedClass(cls); setViewMode('assignments'); }}
                                    >
                                        <BookOpen size={18} />
                                    </button>
                                     <button className="icon-btn danger" title="Delete Class">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderAssignmentsView = () => (
        <div className="col-card">
            <h3>Manage Assignments for {selectedClass.className}</h3>
            <div className="form-section">
                <h4>Assign Subject Teacher</h4>
                <form onSubmit={handleAssignSubjectTeacher} className="grid-form">
                    <div className="form-group">
                        <label>Semester</label>
                        <select className="form-input" required onChange={e => setAssignForm({...assignForm, semesterId: e.target.value})}>
                            <option value="">Select Semester</option>
                            {semesters.filter(s => s.academicYearId === selectedClass.academicYearId).map(s => (
                                <option key={s.semesterId} value={s.semesterId}>{s.semesterName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Subject</label>
                        <select className="form-input" required onChange={e => setAssignForm({...assignForm, subjectId: e.target.value})}>
                            <option value="">Select Subject</option>
                            {subjects.map(s => (
                                <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Teacher</label>
                        <select className="form-input" required onChange={e => setAssignForm({...assignForm, teacherId: e.target.value})}>
                            <option value="">Select Teacher</option>
                            {teachers.map(t => (
                                <option key={t.teacherId} value={t.teacherId}>{t.fullName}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary full-width">Assign Teacher</button>
                </form>
            </div>
            <button className="btn btn-secondary mt-4" onClick={() => setViewMode('list')}>Back to List</button>
        </div>
    );

    return (
        <div className="admin-page fade-in">
             <div className="page-header">
                <div>
                   <h2 className="page-title">Class Management</h2>
                   <p className="page-subtitle">Structure, Homeroom & Subject Assignments</p>
                </div>
                 {viewMode === 'list' && (
                    <button 
                        onClick={() => setViewMode('create')}
                        className="btn btn-primary btn-icon-text"
                    >
                        <Plus size={18} /> Create Class
                    </button>
                 )}
            </div>

            {loading && <p>Loading data...</p>}

            {!loading && viewMode === 'list' && renderListView()}

            {!loading && viewMode === 'create' && (
                <div className="col-card max-w-md mx-auto">
                    <h3>Create New Class</h3>
                    <form onSubmit={handleCreateClass}>
                         <div className="form-group">
                            <label>Class Name (e.g. 10A1)</label>
                            <input className="form-input" required value={classForm.className} onChange={e => setClassForm({...classForm, className: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Grade</label>
                            <input type="number" className="form-input" required value={classForm.grade} onChange={e => setClassForm({...classForm, grade: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Academic Year</label>
                            <select className="form-input" required value={classForm.academicYearId} onChange={e => setClassForm({...classForm, academicYearId: e.target.value})}>
                                <option value="">Select Year</option>
                                <option value="2024">2024-2025</option> {/* Fallback if fetch fails */}
                                {years.map(y => <option key={y.academicYearId} value={y.academicYearId}>{y.yearName}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Homeroom Teacher (Optional)</label>
                            <select className="form-input" value={classForm.homeroomTeacherId} onChange={e => setClassForm({...classForm, homeroomTeacherId: e.target.value})}>
                                <option value="">None</option>
                                {teachers.map(t => <option key={t.teacherId} value={t.teacherId}>{t.fullName}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-4">
                             <button type="button" className="btn btn-secondary" onClick={() => setViewMode('list')}>Cancel</button>
                             <button type="submit" className="btn btn-primary">Create Class</button>
                        </div>
                    </form>
                </div>
            )}

            {!loading && viewMode === 'assignments' && renderAssignmentsView()}

            {/* Class Details Modal */}
            {showDetailModal && classDetails && (
                <div className="modal-overlay">
                    <div className="modal-content large">
                        <div className="modal-header">
                            <h3>Class Details: {classDetails.className}</h3>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="info-grid mb-4">
                                <div><span className="font-bold">Grade:</span> {classDetails.grade}</div>
                                <div><span className="font-bold">Year:</span> {classDetails.academicYear}</div>
                                <div><span className="font-bold">Homeroom:</span> {classDetails.homeroomTeacherName || 'N/A'}</div>
                                <div><span className="font-bold">Total Students:</span> {classDetails.students.length}</div>
                            </div>
                            
                            <h4>Student List</h4>
                            <div style={{maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px'}}>
                                <table className="modern-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Full Name</th>
                                            <th>Gender</th>
                                            <th>Date of Birth</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classDetails.students.length === 0 ? (
                                            <tr><td colSpan="4" className="text-center p-4">No students enrolled.</td></tr>
                                        ) : (
                                            classDetails.students.map(s => (
                                                <tr key={s.studentId}>
                                                    <td>{s.studentId}</td>
                                                    <td className="font-medium">{s.fullName}</td>
                                                    <td>{s.gender || '-'}</td>
                                                    <td>{s.dateOfBirth || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminClasses;
