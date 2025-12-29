import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Award, Trash2 } from 'lucide-react';
import './Teacher.css';

const TeacherCertificates = () => {
  const { teacherId } = useOutletContext();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacherId) {
      fetch(`https://localhost:7115/api/Teacher/certificates/${teacherId}`)
        .then(res => res.json())
        .then(data => {
            setCertificates(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }
  }, [teacherId]);

  const handleDelete = (id) => {
      if(!window.confirm("Are you sure?")) return;
      
      fetch(`https://localhost:7115/api/Teacher/certificates/${teacherId}/${id}`, {
          method: 'DELETE'
      })
      .then(res => {
          if(res.ok) {
              setCertificates(certificates.filter(c => c.certificateId !== id));
          } else {
              alert("Failed to delete");
          }
      });
  };

  if (loading) return <div>Loading certificates...</div>;

  return (
    <div className="teacher-page">
      <div className="dashboard-card mb-6 flex justify-between items-center">
        <h2 className="card-title flex items-center gap-2">
           <Award size={24} color="#4f46e5"/>
           My Certificates
        </h2>
        <button className="btn btn-primary" style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', borderRadius: '6px' }}>
            + Add New
        </button>
      </div>

      <div className="certificates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
         {certificates.map(cert => (
             <div key={cert.certificateId} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                 <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{cert.certificateName}</h3>
                        <button onClick={() => handleDelete(cert.certificateId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '4px' }}><strong>Issued by:</strong> {cert.issuedBy}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '12px' }}><strong>Date:</strong> {cert.issueDate}</p>
                    <p style={{ color: '#374151', fontSize: '0.95rem' }}>{cert.description}</p>
                 </div>
             </div>
         ))}
         {certificates.length === 0 && <p>No certificates found.</p>}
      </div>
    </div>
  );
};
export default TeacherCertificates;
