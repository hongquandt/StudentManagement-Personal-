import React from 'react';
import { Award, ArrowLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Profile.css';

const StudentConduct = () => {
    const navigate = useNavigate();
    const [conducts, setConducts] = React.useState([]);

    React.useEffect(() => {
        const fetchConducts = async () => {
             const storedUser = localStorage.getItem('user');
             if (storedUser) {
                 const user = JSON.parse(storedUser);
                 if (!user.studentId) return;

                 try {
                     const response = await fetch(`https://localhost:7115/api/Student/conduct/${user.studentId}`);
                     if (response.ok) {
                         const data = await response.json();
                         setConducts(data.map(c => ({
                             id: c.conductId,
                             semester: c.semesterName,
                             level: c.conductLevel,
                             comment: c.comment
                         })));
                     }
                 } catch (error) {
                     console.error("Error fetching conduct:", error);
                 }
             }
        };
        fetchConducts();
    }, []);

    return (
        <div className="profile-container">
            <div className="profile-blur-bg"></div>
            <div className="profile-content">
                <button onClick={() => navigate('/profile')} className="back-btn" style={{background: 'none', border:'none', cursor:'pointer'}}>
                    <ArrowLeft size={20} /> Back to Profile
                </button>

                <div className="profile-card">
                    <h3>Student Conduct</h3>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', color: '#cbd5e1'}}>
                            <thead>
                                <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign:'left'}}>
                                    <th style={{padding: '1rem'}}>Semester</th>
                                    <th style={{padding: '1rem'}}>Conduct Level</th>
                                    <th style={{padding: '1rem'}}>Comment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conducts.length > 0 ? (
                                    conducts.map(conduct => (
                                        <tr key={conduct.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                            <td style={{padding: '1rem'}}>{conduct.semester}</td>
                                            <td style={{padding: '1rem'}}>
                                                <span className={`px-2 py-1 rounded text-sm ${
                                                    conduct.level === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                                                    conduct.level === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                    {conduct.level}
                                                </span>
                                            </td>
                                            <td style={{padding: '1rem'}}>{conduct.comment || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{padding: '2rem', textAlign: 'center', color: '#64748b'}}>
                                            No conduct records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentConduct;
