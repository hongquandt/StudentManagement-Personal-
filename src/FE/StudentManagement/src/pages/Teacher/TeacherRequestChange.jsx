import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileEdit, CheckCircle, XCircle, Clock } from 'lucide-react';
import './Teacher.css';

const TeacherRequestChange = () => {
    const { teacherId } = useOutletContext();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRequest, setCurrentRequest] = useState({ requestType: 'Leave', content: '' });
  
    useEffect(() => {
      if (teacherId) {
        fetch(`https://localhost:7115/api/Teacher/requests/${teacherId}`)
          .then(res => res.json())
          .then(data => {
              setRequests(data);
              setLoading(false);
          })
          .catch(err => {
              console.error(err);
              setLoading(false);
          });
      }
    }, [teacherId]);

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentRequest({ requestType: 'Leave', content: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (req) => {
        setIsEditing(true);
        setCurrentRequest(req);
        setIsModalOpen(true);
    };
  
    if (loading) return <div>Loading requests...</div>;

    const handleDelete = async (requestId) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            const res = await fetch(`https://localhost:7115/api/Teacher/requests/${requestId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setRequests(requests.filter(r => r.requestId !== requestId));
            } else {
                alert("Failed to delete request");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing 
            ? `https://localhost:7115/api/Teacher/requests/${currentRequest.requestId}`
            : `https://localhost:7115/api/Teacher/requests/${teacherId}`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentRequest)
            });

            if (res.ok) {
                setIsModalOpen(false);
                // Refresh list
                const resList = await fetch(`https://localhost:7115/api/Teacher/requests/${teacherId}`);
                const data = await resList.json();
                setRequests(data);
            } else {
                alert("Operation failed");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Pending': { bg: '#fff7ed', color: '#c2410c', icon: Clock },
            'Approved': { bg: '#dcfce7', color: '#15803d', icon: CheckCircle },
            'Rejected': { bg: '#fee2e2', color: '#b91c1c', icon: XCircle },
        };
        const style = styles[status] || styles['Pending'];
        const Icon = style.icon;

        return (
            <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                padding: '4px 10px', 
                borderRadius: '20px', 
                background: style.bg, 
                color: style.color,
                fontSize: '0.85rem',
                fontWeight: '500'
             }}>
               <Icon size={14} />
               {status}
             </span>
        );
    };
  
    return (
      <div className="teacher-page">
         <div className="dashboard-card mb-6 flex justify-between items-center">
          <h2 className="card-title flex items-center gap-2">
             <FileEdit size={24} color="#4f46e5"/>
             My Requests
          </h2>
          <button className="btn btn-primary" onClick={openCreateModal} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', borderRadius: '6px' }}>
              Create Request
          </button>
        </div>

        <div className="dashboard-card">
            <div className="table-responsive">
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Content</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Created At</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.requestId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{req.requestType}</td>
                                <td style={{ padding: '12px' }}>{req.content}</td>
                                <td style={{ padding: '12px', color: '#6b7280' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '12px' }}>{getStatusBadge(req.status)}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                    {req.status === 'Pending' && (
                                        <div style={{display:'flex', gap:'5px', justifyContent: 'flex-end'}}>
                                            <button onClick={() => openEditModal(req)} style={{background:'none', border:'none', color:'#2563eb', cursor:'pointer'}}>Edit</button>
                                            <button onClick={() => handleDelete(req.requestId)} style={{background:'none', border:'none', color:'#dc2626', cursor:'pointer'}}>Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {requests.length === 0 && <p style={{ padding: '20px', textAlign: 'center' }}>No requests history.</p>}
            </div>
        </div>

        {isModalOpen && (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}>
                <div style={{ background: 'white', padding: '25px', borderRadius: '12px', width: '450px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer', color: '#6b7280' }} onClick={() => setIsModalOpen(false)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>
                        {isEditing ? 'Edit Request' : 'Create Request'}
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Request Type</label>
                            <select 
                                value={currentRequest.requestType} 
                                onChange={e => setCurrentRequest({...currentRequest, requestType: e.target.value})}
                                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', backgroundColor: 'white' }}
                            >
                                <option value="Leave">Leave Application</option>
                                <option value="Equipment">Equipment Request</option>
                                <option value="Resignation">Resignation</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Content Details</label>
                            <textarea 
                                value={currentRequest.content} 
                                onChange={e => setCurrentRequest({...currentRequest, content: e.target.value})}
                                required
                                rows={5}
                                placeholder="Please describe your request in detail..."
                                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                            <button type="submit" style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>{isEditing ? 'Update Request' : 'Submit Request'}</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    );
  };
  export default TeacherRequestChange;
