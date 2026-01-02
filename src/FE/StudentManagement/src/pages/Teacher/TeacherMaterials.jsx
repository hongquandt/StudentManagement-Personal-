import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Plus, Trash2, Edit2, Link as LinKIcon, X, UploadCloud, Download, File, ExternalLink, Search } from 'lucide-react';
import './TeacherMaterials.css'; // Assume creating a CSS file for cleaner styles

const TeacherMaterials = () => {
    const { teacherId } = useOutletContext();
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [materials, setMaterials] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMaterial, setCurrentMaterial] = useState({ title: '', description: '', filePath: '' });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (teacherId) {
            fetch(`https://localhost:7115/api/Teacher/classes/${teacherId}`)
                .then(res => res.json())
                .then(data => {
                    setClasses(data);
                    if (data.length > 0) {
                        setSelectedClassId(data[0].classId);
                    }
                })
                .catch(err => console.error(err));
        }
    }, [teacherId]);

    useEffect(() => {
        if (selectedClassId) {
            fetchMaterials(selectedClassId);
        }
    }, [selectedClassId]);

    const fetchMaterials = (classId) => {
        setLoading(true);
        fetch(`https://localhost:7115/api/Teacher/materials/${classId}`)
            .then(res => res.json())
            .then(data => {
                setMaterials(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const url = isEditing 
            ? `https://localhost:7115/api/Teacher/materials/${currentMaterial.materialId}`
            : `https://localhost:7115/api/Teacher/materials`;
        const method = isEditing ? 'PUT' : 'POST';
        
        const formData = new FormData();
        formData.append('ClassId', selectedClassId);
        formData.append('Title', currentMaterial.title);
        formData.append('Description', currentMaterial.description || '');
        if (currentMaterial.filePath) {
            formData.append('Url', currentMaterial.filePath);
        }
        if (currentMaterial.file) {
            formData.append('File', currentMaterial.file);
        }

        try {
            const res = await fetch(url, {
                method: method,
                body: formData
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchMaterials(selectedClassId);
                // alert(isEditing ? "Material updated!" : "Material added!");
            } else {
                alert("Operation failed. Please check your input.");
            }
        } catch (error) {
            console.error(error);
            alert("Error saving material.");
        }
    };

    const handleDelete = async (materialId) => {
        if (!window.confirm("Are you sure you want to delete this material?")) return;
        try {
            const res = await fetch(`https://localhost:7115/api/Teacher/materials/${materialId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setMaterials(materials.filter(m => m.materialId !== materialId));
            } else {
                alert("Failed to delete.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentMaterial({ title: '', description: '', filePath: '', classId: selectedClassId });
        setIsModalOpen(true);
    };

    const openEditModal = (material) => {
        setIsEditing(true);
        setCurrentMaterial(material);
        setIsModalOpen(true);
    };

    const filteredMaterials = materials.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="teacher-materials-container fade-in">
            <div className="materials-header-card">
                <div className="header-content">
                    <div className="title-section">
                        <div className="icon-wrapper">
                            <FileText size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="page-title">Class Materials</h1>
                            <p className="page-subtitle">Manage resources for your students</p>
                        </div>
                    </div>
                    
                    <div className="controls-section">
                        <div className="search-box">
                            <Search size={18} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search materials..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="class-selector">
                            <select 
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                            >
                                {classes.map(c => (
                                    <option key={c.classId} value={c.classId}>{c.className}</option>
                                ))}
                            </select>
                        </div>

                        <button 
                            onClick={openCreateModal}
                            disabled={!selectedClassId}
                            className="btn-add-material"
                        >
                            <Plus size={18} />
                            <span>Add Material</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="materials-grid">
                {filteredMaterials.map(mat => (
                    <div key={mat.materialId} className="material-card slide-up">
                        <div className="card-top">
                            <div className="file-type-icon">
                                {mat.filePath ? <File size={28} /> : <LinKIcon size={28} />}
                            </div>
                            <div className="card-actions">
                                <button onClick={() => openEditModal(mat)} className="action-btn edit" title="Edit">
                                    <Edit2 size={16}/>
                                </button>
                                <button onClick={() => handleDelete(mat.materialId)} className="action-btn delete" title="Delete">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                        
                        <div className="card-body">
                            <h3 className="material-title" title={mat.title}>{mat.title}</h3>
                            <p className="material-desc">{mat.description || "No description provided."}</p>
                            <span className="upload-date">
                                Uploaded on {new Date(mat.uploadDate).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="card-footer">
                           {mat.filePath ? (
                                <a 
                                    href={mat.filePath.startsWith('/uploads') ? `https://localhost:7115${mat.filePath}` : mat.filePath} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="download-link"
                                >
                                    {mat.filePath.startsWith('/uploads') ? (
                                        <> <Download size={16} /> Download File </>
                                    ) : (
                                        <> <ExternalLink size={16} /> Open Link </>
                                    )}
                                </a>
                           ) : (
                               <span className="no-file">No file attached</span>
                           )}
                        </div>
                    </div>
                ))}
                
                {filteredMaterials.length === 0 && !loading && (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <FileText size={48} />
                        </div>
                        <h3>No Materials Found</h3>
                        <p>Get started by adding new learning resources for this class.</p>
                        <button onClick={openCreateModal} className="btn-secondary">
                            Create First Material
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content scale-in">
                        <div className="modal-header">
                            <h3>{isEditing ? 'Edit Material' : 'Add New Material'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="close-btn">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="modal-form">
                            <div className="form-group">
                                <label>Title <span className="required">*</span></label>
                                <input 
                                    value={currentMaterial.title || ''}
                                    onChange={e => setCurrentMaterial({...currentMaterial, title: e.target.value})}
                                    required
                                    placeholder="Enter material title..."
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    rows={3}
                                    value={currentMaterial.description || ''}
                                    onChange={e => setCurrentMaterial({...currentMaterial, description: e.target.value})}
                                    placeholder="Brief description of the content..."
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Upload File</label>
                                <div className="file-upload-wrapper">
                                    <input 
                                        type="file"
                                        id="file-upload"
                                        onChange={e => setCurrentMaterial({...currentMaterial, file: e.target.files[0]})} 
                                    />
                                    <label htmlFor="file-upload" className="file-upload-label">
                                        <UploadCloud size={20} />
                                        <span>{currentMaterial.file ? currentMaterial.file.name : "Choose a file..."}</span>
                                    </label>
                                </div>
                            </div>

                            <div className="divider-text">OR</div>

                            <div className="form-group">
                                <label>External Link (URL)</label>
                                <div className="input-with-icon">
                                    <LinKIcon size={16} />
                                    <input 
                                        value={currentMaterial.filePath || ''}
                                        onChange={e => setCurrentMaterial({...currentMaterial, filePath: e.target.value})}
                                        placeholder="https://example.com/resource"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    {isEditing ? 'Save Changes' : 'Upload Material'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherMaterials;

