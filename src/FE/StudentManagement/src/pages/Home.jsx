import React from 'react';
import './Home.css';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  ArrowRight,
  Shield,
  Clock,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="container navbar">
        <div className="nav-brand">
          <div className="logo-icon">
            <GraduationCap size={32} color="#4f46e5" />
          </div>
          Edu<span>Smart</span>
        </div>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="#" className="nav-link">Home</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#academics" className="nav-link">Academics</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu" onClick={() => navigate(user.roleId === 2 ? '/teacher/dashboard' : '/profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="user-name" style={{ fontWeight: '500' }}>{user.fullName || user.username}</span>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: '#4f46e5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                fontWeight: 'bold',
                overflow: 'hidden'
              }}>
                 {user.avatarUrl ? <img src={user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar"/> : (user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')}
              </div>
            </div>
          ) : (
            <>
              <button className="btn btn-secondary" style={{ marginRight: '1rem' }} onClick={() => navigate('/login')}>Login</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container hero">
        <div className="hero-content">
          <span className="hero-tag">Academic Year 2025-2026</span>
          <h1 className="hero-title">
            Empowering the <br />
            Future of Education
          </h1>
          <p className="hero-subtitle">
            Welcome to EduSmart High School. A comprehensive platform connecting students, teachers, and parents for a seamless learning experience.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/login')}>Access Portal</button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
        
        <div className="hero-image">
           <img src="/school_landing.png" alt="School Building" style={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
      </header>

      {/* Role-Based Features */}
      <section className="container features" id="academics">
        <div className="section-header">
           <h2 className="section-title">One Platform, Endless Possibilities</h2>
           <p className="section-desc">Tools tailored for every role in our educational ecosystem.</p>
        </div>

        <div className="features-grid">
            <div className="feature-card">
              <div className="icon-box">
                <BookOpen size={32} />
              </div>
              <h3 className="feature-title">For Students</h3>
              <p className="feature-desc">Access your personalized schedule, track your grades in real-time, and view attendance records anytime, anywhere.</p>
              <div style={{ marginTop: '1rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                 Student Portal <ArrowRight size={16}/>
              </div>
            </div>

            <div className="feature-card">
              <div className="icon-box">
                <Users size={32} />
              </div>
              <h3 className="feature-title">For Teachers</h3>
              <p className="feature-desc">Efficiently manage classes, input grades, take attendance, and monitor student progress with intuitive tools.</p>
              <div style={{ marginTop: '1rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                 Teacher Portal <ArrowRight size={16}/>
              </div>
            </div>

            <div className="feature-card">
              <div className="icon-box">
                <Shield size={32} />
              </div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-desc">Your data security is our top priority. We ensure confidential academic records and personal information are protected.</p>
            </div>
        </div>
      </section>

      {/* Stats / Achievements */}
      <section className="container" style={{ padding: '4rem 0' }}>
         <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '20px', padding: '3rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                <div>
                   <h2 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#818cf8', marginBottom: '0.5rem' }}>1,500+</h2>
                   <p style={{ color: '#94a3b8' }}>Students Enrolled</p>
                </div>
                <div>
                   <h2 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#34d399', marginBottom: '0.5rem' }}>100+</h2>
                   <p style={{ color: '#94a3b8' }}>Certified Teachers</p>
                </div>
                <div>
                   <h2 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f472b6', marginBottom: '0.5rem' }}>100%</h2>
                   <p style={{ color: '#94a3b8' }}>Pass Rate</p>
                </div>
                <div>
                   <h2 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: '0.5rem' }}>50+</h2>
                   <p style={{ color: '#94a3b8' }}>Years of Excellence</p>
                </div>
            </div>
         </div>
      </section>

      {/* News / Announcements */}
      <section className="container features" style={{ padding: '4rem 0' }}>
         <div className="section-header" style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <h2 className="section-title">Latest & Announcements</h2>
         </div>
         
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
             {[1, 2, 3].map(i => (
                 <div key={i} className="feature-card" style={{ padding: '0', overflow: 'hidden' }}>
                     <div style={{ height: '150px', background: `linear-gradient(45deg, #3730a3, #4f46e5)`, opacity: 0.8 }}></div>
                     <div style={{ padding: '1.5rem' }}>
                         <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.5rem' }}>
                            <Calendar size={14}/> Dec {24 + i}, 2025
                         </span>
                         <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: 'white' }}>Final Semester Exams Schedule Released</h3>
                         <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                             The schedule for the upcoming final exams has been published. Please check your student portal.
                         </p>
                         <a href="#" style={{ color: '#818cf8', fontSize: '0.9rem', fontWeight: '500' }}>Read more</a>
                     </div>
                 </div>
             ))}
         </div>
      </section>

      {/* Footer */}
      <footer className="container footer" id="contact">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GraduationCap size={24}/> EduSmart
            </h3>
            <p>Developing leaders for tomorrow.</p>
            <div style={{ marginTop: '1.5rem', color: '#94a3b8' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}><Users size={16}/> 123 Education Lane, Hanoi</p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}><Clock size={16}/> Mon - Fri: 7:00 AM - 5:00 PM</p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Shield size={16}/> +84 123 456 789</p>
            </div>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li>Admissions</li>
              <li>Academic Calendar</li>
              <li>Student Life</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li>Library</li>
              <li>Transport</li>
              <li>Cafeteria</li>
              <li>Sports</li>
            </ul>
          </div>
          <div className="footer-links" style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Portal Login</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#94a3b8' }}>Quick access for staff and students.</p>
            <button className="btn btn-primary" style={{ width: '100%', borderRadius: '8px' }} onClick={() => navigate('/login')}>Login Now</button>
          </div>
        </div>
        <div className="copyright">
          © 2025 EduSmart High School. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
