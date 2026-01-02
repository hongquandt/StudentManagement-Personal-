import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import './Teacher.css';

const TeacherDashboard = () => {
  const { teacherId } = useOutletContext();
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [stats, setStats] = useState({
     totalStudents: 0,
     hoursTaught: 0,
     avgAttendance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacherId) {
       // 1. Fetch Timetable for today
      fetch(`https://localhost:7115/api/Teacher/timetable/${teacherId}`)
        .then(res => res.json())
        .then(data => {
          // Filter for today
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const today = days[new Date().getDay()];
          
          const dayMapping = {
            'Monday': 'Thứ 2',
            'Tuesday': 'Thứ 3',
            'Wednesday': 'Thứ 4',
            'Thursday': 'Thứ 5',
            'Friday': 'Thứ 6',
            'Saturday': 'Thứ 7',
            'Sunday': 'Chủ Nhật'
          };
          
          const todayStr = dayMapping[today];
          const todaysClasses = data.filter(c => c.dayOfWeek === todayStr);
          
          const formatted = todaysClasses.map((c, i) => ({
             id: i,
             subject: c.subjectName,
             time: `Period ${c.period}`,
             room: `Room ${c.roomNumber}`,
             status: 'Upcoming'
          }));
          setUpcomingClasses(formatted);
        })
        .catch(err => console.error(err));
        
      // 2. Fetch Stats
      fetch(`https://localhost:7115/api/Teacher/stats/${teacherId}`)
          .then(res => res.json())
          .then(data => {
              setStats(data);
              setLoading(false);
          })
          .catch(err => {
              console.error(err);
              setLoading(false);
          });
    }
  }, [teacherId]);

  const dashboardStats = [
    { title: 'Total Students', value: stats.totalStudents.toString(), icon: Users, color: '#4f46e5', bg: '#eef2ff' },
    { title: 'Classes Today', value: upcomingClasses.length.toString(), icon: Calendar, color: '#0ea5e9', bg: '#e0f2fe' },
    { title: 'Hours Taught', value: stats.hoursTaught.toString(), icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
    { title: 'Avg Attendance', value: `${stats.avgAttendance}%`, icon: TrendingUp, color: '#10b981', bg: '#d1fae5' },
  ];

  return (
    <div className="dashboard-home">
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '30px' }}>
        {dashboardStats.map((stat, index) => {
           const Icon = stat.icon;
           return (
             <div key={index} className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '0' }}>
               <div style={{ padding: '15px', borderRadius: '12px', background: stat.bg, color: stat.color }}>
                 <Icon size={28} />
               </div>
               <div>
                 <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>{stat.title}</p>
                 <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111827' }}>{stat.value}</h3>
               </div>
             </div>
           );
        })}
      </div>

      <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="left-column">
           <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title">Today's Schedule</h3>
                <span className="card-action">View Full Timetable</span>
              </div>
              <div className="schedule-list">
                 {loading ? <p>Loading schedule...</p> : (
                    upcomingClasses.length > 0 ? upcomingClasses.map((cls) => (
                   <div key={cls.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '16px', 
                      borderBottom: '1px solid #f3f4f6',
                      marginBottom: '8px'
                   }}>
                     <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', background: '#f8fafc', borderRadius: '8px', minWidth: '80px' }}>
                           <span style={{ fontWeight: 'bold', color: '#111827' }}>{cls.time}</span>
                           <span style={{ fontSize: '0.8rem', color: '#6b7280' }}></span>
                        </div>
                        <div>
                           <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{cls.subject}</h4>
                           <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{cls.room}</p>
                        </div>
                     </div>
                     <span style={{ 
                       padding: '6px 12px', 
                       borderRadius: '20px', 
                       fontSize: '0.85rem', 
                       fontWeight: '500',
                       background: cls.status === 'In Progress' ? '#dbeafe' : '#f3f4f6', 
                       color: cls.status === 'In Progress' ? '#1d4ed8' : '#4b5563'
                     }}>
                       {cls.status}
                     </span>
                   </div>
                 )) : <p>No classes scheduled for today.</p>)}
              </div>
           </div>

           <div className="dashboard-card">
              <div className="card-header">
                 <h3 className="card-title">Recent Activity</h3>
              </div>
              <div>
                <p>No recent activity.</p>
              </div>
           </div>
        </div>

        <div className="right-column">
           <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title">Pending Requests</h3>
                <span className="card-action">See All</span>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                 <p>You have no pending requests.</p>
                 <button style={{ marginTop: '15px', padding: '8px 16px', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>Create Request</button>
              </div>
           </div>

           <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: 'white' }}>
              <h3>Quick Actions</h3>
              <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 <button style={{ padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer' }}>+ Record Attendance</button>
                 <button style={{ padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer' }}>+ Add Grades</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
