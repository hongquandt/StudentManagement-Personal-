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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCert, setCurrentCert] = useState({});

  const openCreateModal = () => {
      setIsEditing(false);
      setCurrentCert({ certificateName: '', issuedBy: '', issueDate: '', description: '', certificateImage: '' });
      setIsModalOpen(true);
  };

  const openEditModal = (cert) => {
      setIsEditing(true);
      setCurrentCert({
          ...cert,
          issueDate: cert.issueDate ? cert.issueDate : '' // Handle date string
      });
      setIsModalOpen(true);
  };

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

  const handleSubmit = async (e) => {
      e.preventDefault();
      const url = isEditing 
          ? `https://localhost:7115/api/Teacher/certificates/${currentCert.certificateId}`
          : `https://localhost:7115/api/Teacher/certificates/${teacherId}`;
      const method = isEditing ? 'PUT' : 'POST';

      try {
           const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentCert)
           });

           if (res.ok) {
               setIsModalOpen(false);
               // Refresh list
               const resList = await fetch(`https://localhost:7115/api/Teacher/certificates/${teacherId}`);
               const data = await resList.json();
               setCertificates(data);
           } else {
               alert("Operation failed");
           }
      } catch (error) {
          console.error(error);
      }
  };

  if (loading) return <div>Loading certificates...</div>;

  return (
    <div className="teacher-page">
      <div className="dashboard-card mb-6 flex justify-between items-center">
        <h2 className="card-title flex items-center gap-2">
           <Award size={24} color="#4f46e5"/>
           My Certificates
        </h2>
        <button className="btn btn-primary" onClick={openCreateModal} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', borderRadius: '6px' }}>
            + Add New
        </button>
      </div>

      <div className="certificates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
         {certificates.map(cert => (
             <div key={cert.certificateId} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                 <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{cert.certificateName}</h3>
                        <div style={{display:'flex', gap:'5px'}}>
                             <button onClick={() => openEditModal(cert)} style={{background:'none', border:'none', color:'#2563eb', cursor:'pointer'}}>Edit</button>
                             <button onClick={() => handleDelete(cert.certificateId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '4px' }}><strong>Issued by:</strong> {cert.issuedBy}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '12px' }}><strong>Date:</strong> {cert.issueDate}</p>
                    <p style={{ color: '#374151', fontSize: '0.95rem' }}>{cert.description}</p>
                 </div>
             </div>
         ))}
         {certificates.length === 0 && <p>No certificates found.</p>}
      </div>

      {isModalOpen && (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}>
                <div style={{ background: 'white', padding: '25px', borderRadius: '12px', width: '450px', position: 'relative' }}>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                    >
                        <Trash2 size={20} style={{ transform: 'rotate(45deg)' }}/> 
                        {/* Using trash icon rotated as X for quick fix if X icon not imported, but wait, I can import X */}
                    </button> 
                    {/* Actually, let's use a proper SVG for X or import X from lucide-react if added. 
                       I will stick to simple text 'X' or SVG to be safe without changing imports too much 
                       Wait, I'll add X to import at top first? I can't easily change top imports in this chunk.
                       I'll use an SVG inline for 'X'.
                    */}
                    <div style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>
                        {isEditing ? 'Edit Certificate' : 'Add New Certificate'}
                    </h3>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Certificate Name</label>
                            <input 
                                value={currentCert.certificateName} 
                                onChange={e => setCurrentCert({...currentCert, certificateName: e.target.value})}
                                required
                                placeholder="e.g. TOEFL iBT, Teaching Excellence"
                                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Issued By</label>
                            <input 
                                value={currentCert.issuedBy} 
                                onChange={e => setCurrentCert({...currentCert, issuedBy: e.target.value})}
                                placeholder="e.g. ETS, Ministry of Education"
                                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Date of Issue</label>
                            <input 
                                type="date"
                                value={currentCert.issueDate} 
                                onChange={e => setCurrentCert({...currentCert, issueDate: e.target.value})}
                                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Description</label>
                            <textarea 
                                value={currentCert.description} 
                                onChange={e => setCurrentCert({...currentCert, description: e.target.value})}
                                rows={3}
                                placeholder="Brief details about the certificate..."
                                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                            <button type="submit" style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Save Certificate</button>
                        </div>
                    </form>
                </div>
            </div>
      )}
    </div>
  );
};
export default TeacherCertificates;
