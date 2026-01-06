import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';

const AdminSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState({ subjectName: '', credit: 1 });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://localhost:7115/api/Admin/subjects');
            if (response.ok) {
                const data = await response.json();
                setSubjects(data);
            } else {
                console.error("Failed to fetch subjects");
            }
        } catch (error) {
            console.error("Error fetching subjects:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const response = await fetch(`https://localhost:7115/api/Admin/subjects/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setSubjects(subjects.filter(s => s.subjectId !== id));
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
            ? `https://localhost:7115/api/Admin/subjects/${currentSubject.subjectId}`
            : 'https://localhost:7115/api/Admin/subjects';
        
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentSubject)
            });

            if (response.ok) {
                fetchSubjects();
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
        setCurrentSubject({ subjectName: '', credit: 1 });
        setIsEditing(false);
    };

    const openEdit = (subject) => {
        setCurrentSubject(subject);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    return (
        <div className="admin-page fade-in">
             <div className="page-header">
                <div>
                   <h2 className="page-title">Course Management</h2>
                   <p className="page-subtitle">Manage Subjects and Credits</p>
                </div>
                 <button 
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="btn btn-primary btn-icon-text"
                >
                    <Plus size={18} /> Add Subject
                </button>
            </div>

            <div className="table-card">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Subject Info</th>
                            <th>Credits</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan="3" className="text-center">Loading courses...</td></tr>
                        ) : subjects.length === 0 ? (
                             <tr><td colSpan="3" className="text-center">No subjects found.</td></tr>
                        ) : subjects.map(sub => (
                            <tr key={sub.subjectId}>
                                <td>
                                    <div className="flex-center-row" style={{ justifyContent: 'flex-start', gap: '12px' }}>
                                        <div className="icon-circle bg-blue-light">
                                            <BookOpen size={18} className="text-blue" />
                                        </div>
                                        <span className="font-medium">{sub.subjectName}</span>
                                    </div>
                                </td>
                                <td><span className="badge info">{sub.credit} Credits</span></td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => openEdit(sub)} className="icon-btn info" title="Edit">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(sub.subjectId)} className="icon-btn danger" title="Delete">
                                            <Trash2 size={18} />
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
                        <h3>{isEditing ? 'Edit Subject' : 'Add Subject'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Subject Name</label>
                                <input 
                                    type="text" 
                                    value={currentSubject.subjectName} 
                                    onChange={(e) => setCurrentSubject({...currentSubject, subjectName: e.target.value})}
                                    required 
                                    className="form-input"
                                    placeholder="e.g. Advanced Mathematics"
                                />
                            </div>
                            <div className="form-group">
                                <label>Credits</label>
                                <input 
                                    type="number" 
                                    value={currentSubject.credit} 
                                    onChange={(e) => setCurrentSubject({...currentSubject, credit: parseInt(e.target.value)})}
                                    required 
                                    min="1"
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

export default AdminSubjects;
