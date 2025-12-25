
import React from 'react';
import './Home.css';
import { 
  CheckCircle, 
  Users, 
  BarChart, 
  Shield, 
  ArrowRight,
  Menu,
  X,
  Play
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
    
    // Listen for storage events (e.g. login/logout in other tabs)
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="container navbar">
        <div className="nav-brand">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          School<span>Manager</span>
        </div>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">Features</a>
          <a href="#" className="nav-link">Pricing</a>
          <a href="#" className="nav-link">About</a>
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu" onClick={() => navigate('/profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container hero">
        <div className="hero-content">
          <span className="hero-tag">New V2.0 Released</span>
          <h1 className="hero-title">
            Manage your school <br />
            easily with Task Man
          </h1>
          <p className="hero-subtitle">
            School Manager is a complete solution for managing your school. 
            Track students, attendance, grades, and more in one place.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={16} fill="white" /> Watch Video
            </button>
          </div>
        </div>
        
        <div className="hero-image">
          {/* Conceptual Dashboard Image */}
          <div style={{
            background: '#1e293b',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Mock UI header */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
            </div>
            {/* Mock UI Body */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', width: '80%' }}></div>
                <div style={{ height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', width: '100%' }}></div>
                <div style={{ height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', width: '90%' }}></div>
              </div>
              <div style={{ background: '#0f172a', borderRadius: '12px', height: '200px', padding: '20px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ height: '20px', width: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                    <div style={{ height: '20px', width: '30px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '120px' }}>
                    <div style={{ flex: 1, background: '#4f46e5', height: '60%', borderRadius: '4px' }}></div>
                    <div style={{ flex: 1, background: '#ec4899', height: '80%', borderRadius: '4px' }}></div>
                    <div style={{ flex: 1, background: '#8b5cf6', height: '40%', borderRadius: '4px' }}></div>
                    <div style={{ flex: 1, background: '#06b6d4', height: '90%', borderRadius: '4px' }}></div>
                 </div>
              </div>
            </div>
          </div>

          <div className="floating-card card-1">
            <div style={{ background: '#22c55e', padding: '8px', borderRadius: '8px' }}>
              <CheckCircle color="white" size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Task Completed</p>
              <p style={{ fontWeight: 'bold' }}>100%</p>
            </div>
          </div>
        </div>
      </header>

      {/* Trusted By */}
      <section className="container companies">
        <p>Trusted by company like</p>
        <div className="logo-row">
            {/* SVG Placeholders for logos */}
            <svg viewBox="0 0 100 30" fill="currentColor"><path d="M10,15 L20,5 L30,15 L20,25 Z M40,10 H90 V20 H40 Z" /></svg>
            <svg viewBox="0 0 100 30" fill="currentColor"><circle cx="20" cy="15" r="10" /><rect x="40" y="10" width="50" height="10" /></svg>
            <svg viewBox="0 0 100 30" fill="currentColor"><rect x="10" y="5" width="20" height="20" /><rect x="40" y="10" width="50" height="10" /></svg>
            <svg viewBox="0 0 100 30" fill="currentColor"><path d="M10,25 L20,5 L30,25 Z" /><rect x="40" y="10" width="50" height="10" /></svg>
        </div>
      </section>

      {/* Features */}
      <section className="container features">
        <div className="section-header">
          <h2 className="section-title">Create your task</h2>
          <p className="section-desc">
            Organize your school's workflow with our intuitive tools.
            Manage students, teachers, and staff seamlessly.
          </p>
        </div>

        <div className="features-grid">
            <div className="feature-card">
              <div className="icon-box">
                <Users size={32} />
              </div>
              <h3 className="feature-title">Student Tracking</h3>
              <p className="feature-desc">Keep detailed records of all student activities, grades, and attendance in one secure place.</p>
            </div>
            <div className="feature-card">
              <div className="icon-box">
                <BarChart size={32} />
              </div>
              <h3 className="feature-title">Analytics</h3>
              <p className="feature-desc">Visualize school performance with advanced analytics and generate comprehensive reports.</p>
            </div>
            <div className="feature-card">
              <div className="icon-box">
                <Shield size={32} />
              </div>
              <h3 className="feature-title">Secure Data</h3>
              <p className="feature-desc">Your data is encrypted and secure. We prioritize privacy and compliance with regulations.</p>
            </div>
        </div>
      </section>

      {/* Interactive Feature Section (Mockup) */}
      <section className="container app-preview">
        <div className="preview-nav">
           <div className="nav-item active">
             <h3>Create your text</h3>
             <p>Easily create and manage content.</p>
           </div>
           <div className="nav-item">
             <h3>Choose your style</h3>
             <p>Customize the look and feel.</p>
           </div>
           <div className="nav-item">
             <h3>Manage the team</h3>
             <p>Assign tasks and track progress.</p>
           </div>
        </div>
        <div className="hero-image">
           <div style={{
             background: 'linear-gradient(135deg, #1e293b, #0f172a)',
             borderRadius: '30px',
             padding: '20px',
             border: '4px solid #334155',
             maxWidth: '300px',
             margin: '0 auto',
             boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
           }}>
             <div style={{ textAlign: 'center', padding: '20px 0' }}>
               <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', margin: '0 auto 20px' }}></div>
               <h4 style={{ marginBottom: '10px' }}>Create your task</h4>
               <button className="btn btn-primary" style={{ width: '100%', borderRadius: '12px' }}>Get Started</button>
             </div>
           </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container features" style={{ paddingTop: '0' }}>
          <div className="section-header">
            <h2 className="section-title">Pick up the best plan</h2>
            <p className="section-desc">Choose a plan that fits your school's needs.</p>
          </div>
          
          <div className="features-grid">
             <div className="feature-card" style={{ borderTop: '4px solid #4f46e5' }}>
               <h3 className="feature-title">Standard</h3>
               <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>$15<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></h2>
               <ul style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="#4f46e5"/> 10 Users</li>
                 <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="#4f46e5"/> Basic Support</li>
               </ul>
               <button className="btn btn-secondary" style={{ width: '100%', borderColor: '#4f46e5', color: '#4f46e5' }}>Choose</button>
             </div>
             <div className="feature-card" style={{ background: '#312e81', borderTop: '4px solid #ec4899', transform: 'scale(1.05)' }}>
               <h3 className="feature-title">Premium</h3>
               <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>$35<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></h2>
               <ul style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="#ec4899"/> Unlimited Users</li>
                 <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="#ec4899"/> Priority Support</li>
                 <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="#ec4899"/> Advanced Analytics</li>
               </ul>
               <button className="btn btn-primary" style={{ width: '100%' }}>Choose</button>
             </div>
             <div className="feature-card" style={{ borderTop: '4px solid #4f46e5' }}>
               <h3 className="feature-title">Enterprise</h3>
               <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>$99<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></h2>
               <ul style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="#4f46e5"/> Custom Solutions</li>
                 <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="#4f46e5"/> 24/7 Support</li>
               </ul>
               <button className="btn btn-secondary" style={{ width: '100%', borderColor: '#4f46e5', color: '#4f46e5' }}>Choose</button>
             </div>
          </div>
      </section>

      {/* Subscribe/Newsletter */}
      <div className="container subscribe">
        <div className="subscribe-content">
          <h2>Interesting option from customer</h2>
          <p>Join our newsletter to get the latest updates and offers.</p>
          <div className="input-group">
            <input type="email" placeholder="Enter your email address" />
            <button className="btn btn-primary">Subscribe</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>SchoolManager</h3>
            <p>Making school management efficient and easy.</p>
          </div>
          <div className="footer-links">
            <h4>Product</h4>
            <ul>
              <li>Features</li>
              <li>Pricing</li>
              <li>Case Studies</li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li>About</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Support</h4>
            <ul>
              <li>Help Center</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          © 2024 SchoolManager. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
