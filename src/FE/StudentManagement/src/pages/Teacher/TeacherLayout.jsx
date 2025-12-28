import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileEdit, 
  ClipboardCheck, 
  GraduationCap, 
  UserCircle, 
  Award, 
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';
import './Teacher.css';

const TeacherLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { path: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/teacher/homeroom', icon: Users, label: 'Homeroom Class' },
    { path: '/teacher/timetable', icon: Calendar, label: 'Timetable' },
    { path: '/teacher/requests', icon: FileEdit, label: 'Requests' },
    { path: '/teacher/attendance', icon: ClipboardCheck, label: 'Attendance' },
    { path: '/teacher/grades', icon: GraduationCap, label: 'Grade Entry' },
    { path: '/teacher/conduct', icon: UserCircle, label: 'Conduct' },
    { path: '/teacher/profile', icon: UserCircle, label: 'Profile' },
    { path: '/teacher/certificates', icon: Award, label: 'Certificates' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event("storage"));
    navigate('/login');
  };

  return (
    <div className="teacher-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-area">
             <div className="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </div>
             {isSidebarOpen && <span className="brand-name">LMS Teacher</span>}
          </div>
          <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <div 
                key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={20} />
                {isSidebarOpen && <span>{item.label}</span>}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h2 className="page-title">
             {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="user-area">
             <div className="notifications">
                <Bell size={20} />
                <span className="badge">3</span>
             </div>
             <div className="user-profile">
                {user.avatarUrl ? 
                  <img src={user.avatarUrl} alt="Avatar" className="avatar"/> : 
                  <div className="avatar-placeholder">{user.fullName?.[0] || 'T'}</div>
                }
                <span className="user-name">{user.fullName || 'Teacher'}</span>
             </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;
