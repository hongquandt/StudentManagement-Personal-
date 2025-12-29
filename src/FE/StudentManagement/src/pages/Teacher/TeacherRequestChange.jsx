import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileEdit, CheckCircle, XCircle, Clock } from 'lucide-react';
import './Teacher.css';

const TeacherRequestChange = () => {
    const { teacherId } = useOutletContext();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
  
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
  
    if (loading) return <div>Loading requests...</div>;

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
          <button className="btn btn-primary" style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', borderRadius: '6px' }}>
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
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.requestId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{req.requestType}</td>
                                <td style={{ padding: '12px' }}>{req.content}</td>
                                <td style={{ padding: '12px', color: '#6b7280' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '12px' }}>{getStatusBadge(req.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {requests.length === 0 && <p style={{ padding: '20px', textAlign: 'center' }}>No requests history.</p>}
            </div>
        </div>
      </div>
    );
  };
  export default TeacherRequestChange;
