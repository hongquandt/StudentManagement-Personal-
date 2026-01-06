import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const AdminAcademicYears = () => {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentYear, setCurrentYear] = useState({ yearName: '', isActive: false });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        try {
            const response = await fetch('https://localhost:7115/api/Admin/academic-years');
            if (response.ok) {
                const data = await response.json();
                setYears(data);
            }
        } catch (error) {
            console.error("Error fetching years:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This might act weird if foreign keys exist.")) return;
        try {
            const response = await fetch(`https://localhost:7115/api/Admin/academic-years/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setYears(years.filter(y => y.academicYearId !== id));
            } else {
                alert("Failed to delete. It might be in use.");
            }
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing 
            ? `https://localhost:7115/api/Admin/academic-years/${currentYear.academicYearId}`
            : 'https://localhost:7115/api/Admin/academic-years';
        
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentYear)
            });

            if (response.ok) {
                fetchYears();
                setIsModalOpen(false);
                resetForm();
            } else {
                alert("Operation failed.");
            }
        } catch (error) {
            console.error("Error saving:", error);
        }
    };

    const resetForm = () => {
        setCurrentYear({ yearName: '', isActive: false });
        setIsEditing(false);
    };

    const openEdit = (year) => {
        setCurrentYear(year);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Academic Years</h2>
                <button 
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> Add Year
                </button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Year Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4">Loading...</td></tr>
                        ) : years.map(year => (
                            <tr key={year.academicYearId}>
                                <td>{year.academicYearId}</td>
                                <td>{year.yearName}</td>
                                <td>
                                    {year.isActive ? (
                                        <span className="status-badge success"><CheckCircle size={14} /> Active</span>
                                    ) : (
                                        <span className="status-badge error"><XCircle size={14} /> Inactive</span>
                                    )}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => openEdit(year)} title="Edit">
                                            <Edit size={18} className="text-blue-600" />
                                        </button>
                                        <button onClick={() => handleDelete(year.academicYearId)} title="Delete">
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
                        <h3>{isEditing ? 'Edit Academic Year' : 'Add Academic Year'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Year Name (e.g., 2023-2024)</label>
                                <input 
                                    type="text" 
                                    value={currentYear.yearName} 
                                    onChange={(e) => setCurrentYear({...currentYear, yearName: e.target.value})}
                                    required 
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={currentYear.isActive}
                                    onChange={(e) => setCurrentYear({...currentYear, isActive: e.target.checked})}
                                    id="isActive"
                                />
                                <label htmlFor="isActive" style={{ margin: 0 }}>Is Component Active</label>
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

export default AdminAcademicYears;
