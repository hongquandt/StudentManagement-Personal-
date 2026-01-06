import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminSemesters = () => {
    const [semesters, setSemesters] = useState([]);
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSemester, setCurrentSemester] = useState({ 
        semesterName: '', 
        startDate: '', 
        endDate: '', 
        academicYearId: '' 
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [semRes, yearRes] = await Promise.all([
                fetch('https://localhost:7115/api/Admin/semesters'),
                fetch('https://localhost:7115/api/Admin/academic-years')
            ]);
            
            if (semRes.ok && yearRes.ok) {
                const semData = await semRes.json();
                const yearData = await yearRes.json();
                setSemesters(semData);
                setYears(yearData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const response = await fetch(`https://localhost:7115/api/Admin/semesters/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setSemesters(semesters.filter(s => s.semesterId !== id));
            } else {
                alert("Failed to delete.");
            }
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing 
            ? `https://localhost:7115/api/Admin/semesters/${currentSemester.semesterId}`
            : 'https://localhost:7115/api/Admin/semesters';
        
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentSemester)
            });

            if (response.ok) {
                fetchData(); // Refresh to get combined data (e.g. year name)
                setIsModalOpen(false);
                resetForm();
            } else {
                alert("Operation failed. Ensure dates are valid.");
            }
        } catch (error) {
            console.error("Error saving:", error);
        }
    };

    const resetForm = () => {
        setCurrentSemester({ 
            semesterName: '', 
            startDate: '', 
            endDate: '', 
            academicYearId: years.length > 0 ? years[0].academicYearId : '' 
        });
        setIsEditing(false);
    };

    const openEdit = (semester) => {
        // Format dates for input type="date"
        const start = semester.startDate ? semester.startDate.split('T')[0] : '';
        const end = semester.endDate ? semester.endDate.split('T')[0] : '';

        setCurrentSemester({
            ...semester,
            startDate: start,
            endDate: end
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const getYearName = (id) => {
        const y = years.find(y => y.academicYearId === id);
        return y ? y.yearName : 'Unknown';
    };

    function formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Semesters</h2>
                <button 
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> Add Semester
                </button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Semester Name</th>
                            <th>Academic Year</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5">Loading...</td></tr>
                        ) : semesters.map(sem => (
                            <tr key={sem.semesterId}>
                                <td>{sem.semesterName}</td>
                                <td>{sem.academicYear?.yearName || getYearName(sem.academicYearId)}</td>
                                <td>{formatDate(sem.startDate)}</td>
                                <td>{formatDate(sem.endDate)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => openEdit(sem)} title="Edit">
                                            <Edit size={18} className="text-blue-600" />
                                        </button>
                                        <button onClick={() => handleDelete(sem.semesterId)} title="Delete">
                                            <Trash2 size={18} className="text-red-600" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{isEditing ? 'Edit Semester' : 'Add Semester'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Semester Name</label>
                                <input 
                                    type="text" 
                                    value={currentSemester.semesterName} 
                                    onChange={(e) => setCurrentSemester({...currentSemester, semesterName: e.target.value})}
                                    required 
                                    className="form-input"
                                    placeholder="e.g. Hiking 1"
                                />
                            </div>
                            <div className="form-group">
                                <label>Academic Year</label>
                                <select 
                                    value={currentSemester.academicYearId} 
                                    onChange={(e) => setCurrentSemester({...currentSemester, academicYearId: parseInt(e.target.value)})}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Select Year</option>
                                    {years.map(y => (
                                        <option key={y.academicYearId} value={y.academicYearId}>{y.yearName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input 
                                    type="date" 
                                    value={currentSemester.startDate} 
                                    onChange={(e) => setCurrentSemester({...currentSemester, startDate: e.target.value})}
                                    required 
                                    className="form-input"
                                />
                            </div>
                             <div className="form-group">
                                <label>End Date</label>
                                <input 
                                    type="date" 
                                    value={currentSemester.endDate} 
                                    onChange={(e) => setCurrentSemester({...currentSemester, endDate: e.target.value})}
                                    required 
                                    className="form-input"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">{isEditing ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSemesters;
