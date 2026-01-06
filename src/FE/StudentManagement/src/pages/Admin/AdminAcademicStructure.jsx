import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const AdminAcademicStructure = () => {
    const [years, setYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showYearModal, setShowYearModal] = useState(false);
    const [showSemesterModal, setShowSemesterModal] = useState(false);
    
    // Form Data
    const [yearForm, setYearForm] = useState({ yearName: '', isActive: false });
    const [semesterForm, setSemesterForm] = useState({ semesterName: '', startDate: '', endDate: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [yearRes, semRes] = await Promise.all([
                 fetch('https://localhost:7115/api/Admin/academic-years'),
                 fetch('https://localhost:7115/api/Admin/semesters')
            ]);
            
            if(yearRes.ok && semRes.ok) {
                const y = await yearRes.json();
                const s = await semRes.json();
                setYears(y);
                setSemesters(s);
                if (y.length > 0 && !selectedYear) {
                    setSelectedYear(y[0]);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Year Logic ---
    const handleYearSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing 
            ? `https://localhost:7115/api/Admin/academic-years/${yearForm.academicYearId}`
            : 'https://localhost:7115/api/Admin/academic-years';
        
        try {
            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(yearForm)
            });
            if (res.ok) {
                fetchData();
                setShowYearModal(false);
                setYearForm({ yearName: '', isActive: false });
                setIsEditing(false);
            }
        } catch (err) { console.error(err); }
    };

    const deleteYear = async (id) => {
        if (!confirm("Delete this year?")) return;
        try {
            await fetch(`https://localhost:7115/api/Admin/academic-years/${id}`, { method: 'DELETE' });
            fetchData();
        } catch(err) { console.error(err); }
    };

    // --- Semester Logic ---
    // --- Semester Logic ---
    // --- Semester Logic ---
    const handleSemesterSubmit = async (e) => {
        e.preventDefault();
        // Prepare Payload based on DTO
        const payload = {
            semesterName: semesterForm.semesterName,
            startDate: semesterForm.startDate,
            endDate: semesterForm.endDate,
            academicYearId: selectedYear.academicYearId
        };
        
        let url = 'https://localhost:7115/api/Admin/semesters';
        let method = 'POST';

        if (isEditing) {
            payload.semesterId = semesterForm.semesterId;
            url = `https://localhost:7115/api/Admin/semesters/${semesterForm.semesterId}`;
            method = 'PUT';
        }

        try {
             const res = await fetch(url, {
                method: method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                fetchData();
                setShowSemesterModal(false);
                setSemesterForm({ semesterName: '', startDate: '', endDate: '' });
                setIsEditing(false);
            } else {
                alert("Failed to save semester. Check console.");
                console.error(await res.text());
            }
        } catch(err) { console.error(err); }
    };

    const deleteSemester = async (id) => {
        if (!confirm("Delete this semester?")) return;
        try {
            await fetch(`https://localhost:7115/api/Admin/semesters/${id}`, { method: 'DELETE' });
            fetchData();
        } catch(err) { console.error(err); }
    };

    return (
        <div className="admin-page fade-in">
            <div className="page-header">
                <div>
                   <h2 className="page-title">Academic Structure</h2>
                   <p className="page-subtitle">Manage School Years and Semesters</p>
                </div>
            </div>

            <div className="multi-col-layout">
                {/* Left Column: Academic Years */}
                <div className="col-card">
                    <div className="card-header">
                        <h3>Academic Years</h3>
                        <button 
                            className="btn-icon-text primary small"
                            onClick={() => { setYearForm({ yearName: '', isActive: false }); setIsEditing(false); setShowYearModal(true); }}
                        >
                            <Plus size={16} /> Add
                        </button>
                    </div>
                    <div className="list-group">
                        {years.map(year => (
                            <div 
                                key={year.academicYearId} 
                                className={`list-item ${selectedYear?.academicYearId === year.academicYearId ? 'active' : ''}`}
                                onClick={() => setSelectedYear(year)}
                            >
                                <div className="item-content">
                                    <span className="item-title">{year.yearName}</span>
                                    {year.isActive && <span className="badge success">Active</span>}
                                </div>
                                <div className="item-actions">
                                    <button onClick={(e) => { e.stopPropagation(); setYearForm(year); setIsEditing(true); setShowYearModal(true); }}><Edit size={16}/></button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteYear(year.academicYearId); }} className="danger"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Semesters for Selected Year */}
                <div className="col-card main-col">
                    <div className="card-header">
                        <h3>
                            Semesters for {selectedYear?.yearName || '...'}
                        </h3>
                        {selectedYear && (
                            <button 
                                className="btn-icon-text primary small"
                                onClick={() => { setSemesterForm({ semesterName: '', startDate: '', endDate: '' }); setIsEditing(false); setShowSemesterModal(true); }}
                            >
                                <Plus size={16} /> Add Semester
                            </button>
                        )}
                    </div>
                    
                    {!selectedYear ? (
                        <div className="empty-state">Select an academic year to view semesters</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {semesters.filter(s => s.academicYearId === selectedYear.academicYearId).length === 0 ? (
                                        <tr><td colSpan="4" className="text-center">No semesters found.</td></tr>
                                    ) : semesters.filter(s => s.academicYearId === selectedYear.academicYearId).map(sem => {
                                        const isActive = new Date() >= new Date(sem.startDate) && new Date() <= new Date(sem.endDate);
                                        return (
                                            <tr key={sem.semesterId}>
                                                <td className="font-medium">{sem.semesterName}</td>
                                                <td className="text-sm text-gray">
                                                    {new Date(sem.startDate).toLocaleDateString()} - {new Date(sem.endDate).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    {isActive ? <span className="status-dot online" title="Current"></span> : <span className="status-dot offline" title="Not Current"></span>}
                                                </td>
                                                <td>
                                                     <div className="action-buttons">
                                                        <button 
                                                            className="icon-btn info"
                                                            onClick={() => { 
                                                                setSemesterForm({ 
                                                                    ...sem, 
                                                                    startDate: sem.startDate.split('T')[0],
                                                                    endDate: sem.endDate.split('T')[0]
                                                                }); 
                                                                setIsEditing(true); 
                                                                setShowSemesterModal(true); 
                                                            }}
                                                        >
                                                            <Edit size={16}/>
                                                        </button>
                                                        <button className="icon-btn danger" onClick={() => deleteSemester(sem.semesterId)}>
                                                            <Trash2 size={16}/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Year Modal */}
            {showYearModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{isEditing ? 'Edit Year' : 'Add Year'}</h3>
                        <form onSubmit={handleYearSubmit}>
                            <input className="form-input" placeholder="Year Name (e.g. 2024-2025)" value={yearForm.yearName} onChange={e => setYearForm({...yearForm, yearName: e.target.value})} required />
                            <div className="checkbox-wrap">
                                <input type="checkbox" id="activeYear" checked={yearForm.isActive} onChange={e => setYearForm({...yearForm, isActive: e.target.checked})} />
                                <label htmlFor="activeYear">Set as Active Year</label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowYearModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Semester Modal */}
            {/* Semester Modal */}
             {showSemesterModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                             <h3>{isEditing ? 'Edit Semester' : 'Add Semester'}</h3>
                             <button className="close-btn" onClick={() => setShowSemesterModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form id="semForm" onSubmit={handleSemesterSubmit}>
                                <div className="form-group">
                                    <label>Semester Name</label>
                                    <input className="form-input" placeholder="e.g. Semester 1" value={semesterForm.semesterName} onChange={e => setSemesterForm({...semesterForm, semesterName: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input type="date" className="form-input" value={semesterForm.startDate} onChange={e => setSemesterForm({...semesterForm, startDate: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input type="date" className="form-input" value={semesterForm.endDate} onChange={e => setSemesterForm({...semesterForm, endDate: e.target.value})} required />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowSemesterModal(false)}>Cancel</button>
                            <button type="submit" form="semForm" className="btn btn-primary">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAcademicStructure;
