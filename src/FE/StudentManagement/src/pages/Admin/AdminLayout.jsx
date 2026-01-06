import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  BookOpen, 
  Layers, 
  UserPlus, 
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  School
} from 'lucide-react';
import './Admin.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  let user = {};
  try {
     const storedUser = localStorage.getItem('user');
     if (storedUser && storedUser !== "undefined") {
        user = JSON.parse(storedUser);
     }
  } catch (err) {
      console.error("Failed to parse user from localStorage", err);
  }

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/academic-years', icon: Calendar, label: 'Academic Structure' }, // Combined Year & Semester
    { path: '/admin/classes', icon: School, label: 'Classes Management' },
    { path: '/admin/assign-student', icon: UserPlus, label: 'Assign Students' },
    { path: '/admin/subjects', icon: BookOpen, label: 'Course Management' },
    // { path: '/admin/schedule', icon: Calendar, label: 'Schedule Management' }, // Coming soon
    { path: '/admin/teacher-requests', icon: FileText, label: 'Teacher Requests' },
  ];

  // Helper for icon fallback
  function LayerStackIcon(props) {
      return <Layers {...props} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event("storage"));
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
           <div className="logo-icon">
              <Settings size={22} color="white" />
           </div>
           {isSidebarOpen && <span className="brand-name">LMS Admin</span>}
           <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
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
          <div className="user-area" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <div className="notifications" style={{ position: 'relative', cursor: 'pointer' }}>
                <Bell size={20} color="#64748b" />
                <span className="badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', fontSize: '10px', width: '15px', height: '15px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>3</span>
             </div>
             <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {user.avatarUrl ? 
                  <img src={user.avatarUrl} alt="Avatar" className="user-avatar"/> : 
                  <div className="user-avatar-placeholder">{user.name ? user.name[0] : 'A'}</div>
                }
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="user-name" style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user.name || 'Admin'}</span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Administrator</span>
                </div>
             </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
