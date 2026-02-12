import React, { useState, useEffect } from 'react';
import { Check, X, FileText, User } from 'lucide-react';

const AdminTeacherRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await fetch('https://localhost:7115/api/Admin/teacher-requests');
            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        if (!confirm(`Confirm ${action}?`)) return;
        try {
            const res = await fetch(`https://localhost:7115/api/Admin/teacher-requests/${id}/${action}`, { method: 'POST' });
            if (res.ok) {
                setRequests(requests.filter(r => r.requestId !== id)); // Remove from pending list
            } else {
                alert("Action failed");
            }
        } catch(err) { console.error(err); }
    };

    return (
        <div className="admin-page fade-in">
             <div className="page-header">
                <div>
                   <h2 className="page-title">Teacher Requests</h2>
                   <p className="page-subtitle">Approve or Reject Schedule Changes</p>
                </div>
            </div>

            <div className="grid-cards">
                {loading ? <p>Loading...</p> : requests.length === 0 ? <p className="text-gray-500">No pending requests.</p> : requests.map(req => (
                    <div key={req.requestId} className="request-card">
                        <div className="request-header">
                            <div className="user-info-sm">
                                <User size={16} />
                                <span className="font-semibold">{req.teacher?.fullName || 'Unknown Teacher'}</span>
                            </div>
                            <span className="badge warning">Pending</span>
                        </div>
                        <div className="request-body">
                            <h4 className="flex items-center gap-2 font-medium mb-2">
                                <FileText size={16} className="text-blue" />
                                {req.requestType || 'Request'}
                            </h4>
                            <p className="text-gray-600 text-sm">{req.content}</p>
                            <p className="text-xs text-gray-400 mt-2">Submitted: {new Date(req.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="request-actions">
                            <button 
                                className="btn btn-primary full-width flex-center"
                                style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                                onClick={() => handleAction(req.requestId, 'approve')}
                            >
                                <Check size={16} style={{marginRight: '6px'}} /> Approve
                            </button>
                            <button 
                                className="btn btn-secondary full-width flex-center"
                                style={{ color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fee2e2' }}
                                onClick={() => handleAction(req.requestId, 'reject')}
                            >
                                <X size={16} style={{marginRight: '6px'}} /> Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .grid-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
                .request-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    border: 1px solid #e5e7eb;
                }
                .request-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #f3f4f6;
                }
                .user-info-sm {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #374151;
                }
                .request-body {
                    margin-bottom: 20px;
                }
                .request-actions {
                    display: flex;
                    gap: 12px;
                }
            `}</style>
        </div>
    );
};

export default AdminTeacherRequests;
