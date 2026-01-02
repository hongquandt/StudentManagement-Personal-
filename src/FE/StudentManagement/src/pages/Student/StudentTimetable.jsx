import React from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Profile.css';

const StudentTimetable = () => {
    const navigate = useNavigate();
    const [timetable, setTimetable] = React.useState({});

    React.useEffect(() => {
        const fetchTimetable = async () => {
             const storedUser = localStorage.getItem('user');
             if (storedUser) {
                 const user = JSON.parse(storedUser);
                 if (!user.studentId) return;

                 try {
                     const response = await fetch(`https://localhost:7115/api/Student/timetable/${user.studentId}`);
                     if (response.ok) {
                         const data = await response.json();
                         // Group by day
                         const grouped = {};
                         data.forEach(item => {
                             if (!grouped[item.dayOfWeek]) grouped[item.dayOfWeek] = [];
                             // Assuming item.period is just a number, we might want to sort by it
                             grouped[item.dayOfWeek].push(`${item.period}: ${item.subjectName} (${item.roomNumber})`);
                         });
                         // Sort days if needed or just use as is
                         setTimetable(grouped);
                     }
                 } catch (error) {
                     console.error("Error fetching timetable:", error);
                 }
             }
        };
        fetchTimetable();
    }, []);

    return (
        <div className="profile-container">
            <div className="profile-blur-bg"></div>
            <div className="profile-content">
                <button onClick={() => navigate('/profile')} className="back-btn" style={{background: 'none', border:'none', cursor:'pointer'}}>
                    <ArrowLeft size={20} /> Back to Profile
                </button>

                <div className="profile-card">
                    <h3>Weekly Timetable</h3>
                    <div className="timetable-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem'}}>
                        {Object.entries(timetable).map(([day, subjects]) => (
                            <div key={day} style={{background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: '10px'}}>
                                <h4 style={{color: '#818cf8', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom:'0.5rem'}}>{day}</h4>
                                <ul style={{listStyle: 'none', padding: 0}}>
                                    {subjects.map((sub, index) => (
                                        <li key={index} style={{
                                            padding: '0.5rem 0', 
                                            color: sub === 'Break' ? '#94a3b8' : '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <div style={{width: '6px', height: '6px', borderRadius: '50%', background: sub === 'Break' ? '#475569' : '#38bdf8'}}></div>
                                            {sub}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentTimetable;
