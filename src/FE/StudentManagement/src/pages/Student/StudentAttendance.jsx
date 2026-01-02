import React from 'react';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Profile.css';

const StudentAttendance = () => {
    const navigate = useNavigate();
    const [attendanceRecords, setAttendanceRecords] = React.useState([]);

    React.useEffect(() => {
        const fetchAttendance = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (!user.studentId) return;

                try {
                    const response = await fetch(`https://localhost:7115/api/Student/attendance/${user.studentId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setAttendanceRecords(data.map(d => ({
                            id: d.attendanceId,
                            date: new Date(d.date).toLocaleDateString(),
                            subject: d.className, // Using ClassName as subject/context
                            status: d.status
                        })));
                    }
                } catch (error) {
                    console.error("Error fetching attendance:", error);
                }
            }
        };
        fetchAttendance();
    }, []);

    return (
        <div className="profile-container">
            <div className="profile-blur-bg"></div>
            <div className="profile-content">
                <button onClick={() => navigate('/profile')} className="back-btn" style={{background: 'none', border:'none', cursor:'pointer'}}>
                    <ArrowLeft size={20} /> Back to Profile
                </button>

                <div className="profile-card">
                    <h3>Attendance Record</h3>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', color: '#cbd5e1'}}>
                            <thead>
                                <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign:'left'}}>
                                    <th style={{padding: '1rem'}}>Date</th>
                                    <th style={{padding: '1rem'}}>Subject</th>
                                    <th style={{padding: '1rem'}}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceRecords.map(record => (
                                    <tr key={record.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                        <td style={{padding: '1rem'}}>{record.date}</td>
                                        <td style={{padding: '1rem'}}>{record.subject}</td>
                                        <td style={{padding: '1rem'}}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem', 
                                                borderRadius: '50px', 
                                                background: record.status === 'Present' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                color: record.status === 'Present' ? '#4ade80' : '#f87171'
                                            }}>
                                                {record.status}
                                            </span>
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

export default StudentAttendance;
