import React, { useState, useEffect } from 'react';
import { Ban, CheckCircle, Search, Eye, Mail, Phone, Calendar, User, Shield, Edit, Download, GraduationCap, School, MapPin, Flag, Image as ImageIcon } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Student');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modals
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://localhost:7115/api/Admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleBan = async (user) => {
        const action = user.isActive ? 'ban' : 'unban';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            const response = await fetch(`https://localhost:7115/api/Admin/users/${user.userId}/${action}`, { method: 'POST' });
            if (response.ok) {
                setUsers(users.map(u => u.userId === user.userId ? { ...u, isActive: !user.isActive } : u));
            } else { alert("Action failed."); }
        } catch (error) { console.error(error); }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({
            userId: user.userId,
            email: user.email,
            isActive: user.isActive,
            ethnicity: user.ethnicity,
            citizenIdImage: user.citizenIdImage,
            avatarUrl: user.avatarUrl,
            roleId: user.roleId,
            student: user.student ? { ...user.student, dateOfBirth: user.student.dateOfBirth ? user.student.dateOfBirth.split('T')[0] : '' } : null,
            teacher: user.teacher ? { ...user.teacher } : null
        });
    };

    const handleFormChange = (e, section = null) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        if (section) {
            setFormData({ ...formData, [section]: { ...formData[section], [name]: val } });
        } else {
            setFormData({ ...formData, [name]: val });
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        
        // Sanitize Payload for Backend
        const payload = JSON.parse(JSON.stringify(formData)); 
        
        if (payload.student) {
             // If date is empty string, make it null to match C# DateOnly?
             if (!payload.student.dateOfBirth) payload.student.dateOfBirth = null;
        }

        try {
            const response = await fetch('https://localhost:7115/api/Admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                fetchUsers();
                setEditingUser(null);
                alert("User info updated successfully!");
            } else { 
                const text = await response.text();
                alert(`Update failed: ${text}`);
                console.error("Backend error:", text);
            }
        } catch (error) { console.error(error); }
    };

    const getRoleName = (user) => user.role?.roleName || 'Unknown';
    const getFullName = (user) => {
        if (user.student) return user.student.fullName;
        if (user.teacher) return user.teacher.fullName;
        if (user.parent) return user.parent.fullName;
        return user.username; 
    };

    const students = users.filter(u => getRoleName(u).toLowerCase() === 'student');
    const teachers = users.filter(u => getRoleName(u).toLowerCase() === 'teacher');
    const admins = users.filter(u => getRoleName(u).toLowerCase() === 'admin');

    const getCurrentList = () => {
        switch(activeTab) {
            case 'Student': return students;
            case 'Teacher': return teachers;
            case 'Admin': return admins;
            default: return users;
        }
    };

    const filteredList = getCurrentList().filter(user => {
         const term = searchTerm.toLowerCase();
         return user.username.toLowerCase().includes(term) || 
                (user.email && user.email.toLowerCase().includes(term)) ||
                getFullName(user).toLowerCase().includes(term);
    });

    const renderActions = (u) => (
        <div className="action-buttons">
            <button onClick={() => handleEditClick(u)} className="icon-btn primary" title="Edit Full Details"><Edit size={18} /></button>
            <button onClick={() => toggleBan(u)} className={`icon-btn ${u.isActive ? 'danger' : 'success'}`} title="Ban/Unban">{u.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}</button>
        </div>
    );

    return (
        <div className="admin-page fade-in">
             <div className="page-header">
                <div>
                    <h2 className="page-title">User Management</h2>
                    <p className="page-subtitle">Manage all user details (Students, Teachers, Admins)</p>
                </div>
                 <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="role-tabs">
                <button className={`role-tab ${activeTab === 'Student' ? 'active' : ''}`} onClick={() => setActiveTab('Student')}>
                    <GraduationCap size={20} /> <span>Students</span> <span className="count-badge">{students.length}</span>
                </button>
                <button className={`role-tab ${activeTab === 'Teacher' ? 'active' : ''}`} onClick={() => setActiveTab('Teacher')}>
                    <School size={20} /> <span>Teachers</span> <span className="count-badge">{teachers.length}</span>
                </button>
                <button className={`role-tab ${activeTab === 'Admin' ? 'active' : ''}`} onClick={() => setActiveTab('Admin')}>
                    <Shield size={20} /> <span>Admins</span> <span className="count-badge">{admins.length}</span>
                </button>
            </div>

            <div className="table-card">
                {loading ? <div className="p-8 text-center">Loading...</div> : (
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>User Info</th>
                                {activeTab === 'Student' && <th>Student Details</th>}
                                {activeTab === 'Teacher' && <th>Teacher Details</th>}
                                <th>Contact / ID</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.map(u => (
                                <tr key={u.userId}>
                                    <td>
                                        <div className="user-cell">
                                            {u.avatarUrl ? <img src={u.avatarUrl} className="user-avatar" /> : <div className="user-avatar-placeholder">{u.username[0]}</div>}
                                            <div className="user-info">
                                                <span className="user-fullname">{getFullName(u)}</span>
                                                <span className="user-username">@{u.username}</span>
                                            </div>
                                        </div>
                                    </td>
                                    {activeTab === 'Student' && (
                                        <td>
                                            <div className="text-sm">
                                                <div><span className="font-semibold">DOB:</span> {u.student?.dateOfBirth || '-'}</div>
                                                <div><span className="font-semibold">Gender:</span> {u.student?.gender || '-'}</div>
                                                <div><span className="font-semibold">Year:</span> {u.student?.enrollmentYear}</div>
                                            </div>
                                        </td>
                                    )}
                                    {activeTab === 'Teacher' && (
                                        <td>
                                            <div className="text-sm">
                                                 <div><span className="font-semibold">Spec:</span> {u.teacher?.specialization || '-'}</div>
                                                 <div><span className="font-semibold">Phone:</span> {u.teacher?.phone || '-'}</div>
                                            </div>
                                        </td>
                                    )}
                                    <td>
                                        <div className="text-sm">
                                            <div><Mail size={12} className="inline mr-1"/>{u.email}</div>
                                            {u.ethnicity && <div><Flag size={12} className="inline mr-1"/>{u.ethnicity}</div>}
                                        </div>
                                    </td>
                                    <td>
                                         {u.isActive ? <span className="status-indicator active"><span className="dot"/> Active</span> : <span className="status-indicator inactive"><span className="dot"/> Banned</span>}
                                    </td>
                                    <td>{renderActions(u)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Comprehensive Edit Modal */}
            {editingUser && (
                <div className="modal-overlay">
                    <div className="modal-content large">
                        <div className="modal-header">
                            <h3>Edit {getRoleName(editingUser)} Details</h3>
                            <button className="close-btn" onClick={() => setEditingUser(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form id="editForm" onSubmit={handleUpdateUser}>
                                {/* 1. Base User Account Info */}
                                <h4 className="form-section-head">
                                    <User size={16}/> User Account
                                </h4>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input className="form-input" name="email" value={formData.email || ''} onChange={handleFormChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Ethnicity</label>
                                        <input className="form-input" name="ethnicity" value={formData.ethnicity || ''} onChange={handleFormChange} placeholder="e.g. Kinh, Tay..." />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Avatar URL</label>
                                    <div className="flex gap-2">
                                         <input className="form-input" name="avatarUrl" value={formData.avatarUrl || ''} onChange={handleFormChange} />
                                         {formData.avatarUrl && <img src={formData.avatarUrl} className="w-10 h-10 rounded border" alt="Preview"/>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Citizen ID Image URL</label>
                                      <div className="flex gap-2">
                                         <input className="form-input" name="citizenIdImage" value={formData.citizenIdImage || ''} onChange={handleFormChange} />
                                         {formData.citizenIdImage && <Eye size={20} className="text-blue-500 cursor-pointer" title="Preview" />}
                                    </div>
                                </div>
                                <div className="checkbox-wrap mb-4">
                                    <input type="checkbox" id="act" name="isActive" checked={formData.isActive || false} onChange={handleFormChange} />
                                    <label htmlFor="act">Account Active</label>
                                </div>

                                {/* 2. Student Specifics */}
                                {activeTab === 'Student' && formData.student && (
                                    <>
                                        <h4 className="form-section-head"><GraduationCap size={16}/> Student Profile</h4>
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input className="form-input" name="fullName" value={formData.student.fullName || ''} onChange={(e) => handleFormChange(e, 'student')} required />
                                        </div>
                                         <div className="grid-2">
                                            <div className="form-group">
                                                <label>Date of Birth</label>
                                                <input type="date" className="form-input" name="dateOfBirth" value={formData.student.dateOfBirth || ''} onChange={(e) => handleFormChange(e, 'student')} />
                                            </div>
                                             <div className="form-group">
                                                <label>Gender</label>
                                                <select className="form-input" name="gender" value={formData.student.gender || ''} onChange={(e) => handleFormChange(e, 'student')}>
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid-2">
                                             <div className="form-group">
                                                <label>Enrollment Year</label>
                                                <input type="number" className="form-input" name="enrollmentYear" value={formData.student.enrollmentYear || ''} onChange={(e) => handleFormChange(e, 'student')} />
                                            </div>
                                            <div className="form-group">
                                                <label>Student Status</label>
                                                <input className="form-input" name="status" value={formData.student.status || ''} onChange={(e) => handleFormChange(e, 'student')} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Address</label>
                                            <input className="form-input" name="address" value={formData.student.address || ''} onChange={(e) => handleFormChange(e, 'student')} />
                                        </div>
                                    </>
                                )}

                                {/* 3. Teacher Specifics */}
                                {activeTab === 'Teacher' && formData.teacher && (
                                    <>
                                        <h4 className="form-section-head"><School size={16}/> Teacher Profile</h4>
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input className="form-input" name="fullName" value={formData.teacher.fullName || ''} onChange={(e) => handleFormChange(e, 'teacher')} required />
                                        </div>
                                        <div className="grid-2">
                                            <div className="form-group">
                                                <label>Specialization</label>
                                                <input className="form-input" name="specialization" value={formData.teacher.specialization || ''} onChange={(e) => handleFormChange(e, 'teacher')} />
                                            </div>
                                            <div className="form-group">
                                                <label>Phone Number</label>
                                                <input className="form-input" name="phone" value={formData.teacher.phone || ''} onChange={(e) => handleFormChange(e, 'teacher')} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save All Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .role-tabs { display: flex; gap: 16px; margin-bottom: 24px; }
                .role-tab {
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px;
                    padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;
                    background: white; cursor: pointer; transition: all 0.2s;
                    font-weight: 600; color: #6b7280; font-size: 1rem;
                }
                .role-tab:hover { border-color: #2563eb; color: #2563eb; }
                .role-tab.active { background: #eff6ff; border-color: #2563eb; color: #2563eb; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1); }
                .count-badge { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; }
                
                .form-section-head { 
                    display: flex; align-items: center; gap: 8px;
                    font-size: 0.95rem; font-weight: 600; color: #111827; 
                    background: #f3f4f6; padding: 8px 12px; border-radius: 6px; 
                    margin: 20px 0 12px 0; 
                }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            `}</style>
        </div>
    );
};

export default AdminUsers;
