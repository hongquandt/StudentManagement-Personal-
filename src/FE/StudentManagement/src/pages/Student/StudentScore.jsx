import React from 'react';
import { Award, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Profile.css';

const StudentScore = () => {
    const navigate = useNavigate();
    const [scores, setScores] = React.useState([]);

    React.useEffect(() => {
        const fetchScores = async () => {
             const storedUser = localStorage.getItem('user');
             if (storedUser) {
                 const user = JSON.parse(storedUser);
                 if (!user.studentId) return;

                 try {
                     const response = await fetch(`https://localhost:7115/api/Student/scores/${user.studentId}`);
                     if (response.ok) {
                         const data = await response.json();
                         setScores(data.map(s => ({
                             id: s.scoreId,
                             subject: s.subjectName,
                             midTerm: s.midtermScore || '-',
                             final: s.finalScore || '-'
                         })));
                     }
                 } catch (error) {
                     console.error("Error fetching scores:", error);
                 }
             }
        };
        fetchScores();
    }, []);

    return (
        <div className="profile-container">
            <div className="profile-blur-bg"></div>
            <div className="profile-content">
                <button onClick={() => navigate('/profile')} className="back-btn" style={{background: 'none', border:'none', cursor:'pointer'}}>
                    <ArrowLeft size={20} /> Back to Profile
                </button>

                <div className="profile-card">
                    <h3>Academic Scores</h3>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', color: '#cbd5e1'}}>
                            <thead>
                                <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign:'left'}}>
                                    <th style={{padding: '1rem'}}>Subject</th>
                                    <th style={{padding: '1rem'}}>Mid-Term</th>
                                    <th style={{padding: '1rem'}}>Final</th>
                                    <th style={{padding: '1rem'}}>Average</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scores.map(score => (
                                    <tr key={score.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                        <td style={{padding: '1rem'}}>{score.subject}</td>
                                        <td style={{padding: '1rem'}}>{score.midTerm}</td>
                                        <td style={{padding: '1rem'}}>{score.final}</td>
                                        <td style={{padding: '1rem', fontWeight:'bold', color: '#fbbf24'}}>
                                            {((score.midTerm + score.final * 2) / 3).toFixed(1)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentScore;
