import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, BookOpen } from 'lucide-react';
import './Teacher.css';

const TeacherHomeroom = () => {
  const { teacherId } = useOutletContext();
  const [homeroomData, setHomeroomData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacherId) {
       fetch(`https://localhost:7115/api/Teacher/homeroom/${teacherId}`)
         .then(res => res.json())
         .then(data => {
            setHomeroomData(data);
            setLoading(false);
         })
         .catch(err => {
            console.error(err);
            setLoading(false);
         });
    }
  }, [teacherId]);

  if (loading) return <div>Loading homeroom data...</div>;
  if (!homeroomData || !homeroomData.classInfo) return <div>No homeroom class assigned.</div>;

  const { classInfo, students } = homeroomData;

  return (
    <div className="teacher-page">
      <div className="dashboard-card mb-6">
        <div className="card-header">
           <h2 className="card-title flex items-center gap-2">
             <BookOpen size={24} color="#4f46e5"/>
             Class: {classInfo.className} (Grade {classInfo.grade})
           </h2>
        </div>
        <div className="card-body">
           <p><strong>Academic Year ID:</strong> {classInfo.academicYearId}</p>
           <p><strong>Total Students:</strong> {students.length}</p>
        </div>
      </div>

      <div className="dashboard-card">
         <div className="card-header">
           <h3 className="card-title flex items-center gap-2">
             <Users size={20} />
             Student List
           </h3>
         </div>
         <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
               <thead>
                 <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                   <th style={{ padding: '12px', textAlign: 'left' }}>Student ID</th>
                   <th style={{ padding: '12px', textAlign: 'left' }}>Full Name</th>
                   <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                   <th style={{ padding: '12px', textAlign: 'left' }}>Enrollment Year</th>
                   <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                  {students.map(student => (
                    <tr key={student.studentId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px' }}>{student.studentId}</td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{student.fullName}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                           padding: '4px 10px', 
                           borderRadius: '15px', 
                           background: student.status === 'Đang học' ? '#d1fae5' : '#fee2e2', 
                           color: student.status === 'Đang học' ? '#065f46' : '#991b1b',
                           fontSize: '0.85rem'
                        }}>
                          {student.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{student.enrollmentYear}</td>
                      <td style={{ padding: '12px' }}>
                         <button style={{ 
                            padding: '6px 12px', 
                            border: '1px solid #d1d5db', 
                            borderRadius: '4px', 
                            background: 'white', 
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                         }}>View Details</button>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
            {students.length === 0 && <p style={{ textAlign: 'center', padding: '20px' }}>No students in this class.</p>}
         </div>
      </div>
    </div>
  );
};
export default TeacherHomeroom;
