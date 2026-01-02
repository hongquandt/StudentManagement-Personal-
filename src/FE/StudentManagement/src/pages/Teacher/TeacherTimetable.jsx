import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Clock, MapPin } from 'lucide-react';
import './Teacher.css';

const TeacherTimetable = () => {
  const { teacherId } = useOutletContext();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacherId) {
      fetch(`https://localhost:7115/api/Teacher/timetable/${teacherId}`)
        .then(res => res.json())
        .then(data => {
            setTimetable(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }
  }, [teacherId]);

  if (loading) return <div>Loading timetable...</div>;

  // Group by day of week
  const daysOrder = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
  const grouped = daysOrder.reduce((acc, day) => {
    acc[day] = timetable.filter(t => t.dayOfWeek === day);
    return acc;
  }, {});

  return (
    <div className="teacher-page">
      <div className="dashboard-card mb-6">
        <h2 className="card-title flex items-center gap-2">
            <Calendar size={24} color="#4f46e5"/>
            Weekly Timetable
        </h2>
      </div>

      <div className="timetable-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {daysOrder.map(day => {
            const classes = grouped[day];
            if (!classes || classes.length === 0) return null;

            return (
                <div key={day} className="dashboard-card" style={{ marginBottom: 0 }}>
                    <div className="card-header" style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.2rem', color: '#111827', fontWeight: '600' }}>{day}</h3>
                    </div>
                    <div className="classes-list">
                        {classes.map((cls, idx) => (
                            <div key={idx} style={{ 
                                background: '#f9fafb', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '15px',
                                marginBottom: '10px'
                            }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#4f46e5', fontSize: '1.1rem' }}>{cls.subjectName}</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: '#4b5563' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Clock size={16} />
                                        <span>Period: {cls.period}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <UsersIcon size={16} />
                                        <span>Class: {cls.className}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={16} />
                                        <span>Room: {cls.roomNumber}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
        {timetable.length === 0 && <p>No classes found.</p>}
      </div>
    </div>
  );
};

const UsersIcon = ({size}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

export default TeacherTimetable;
