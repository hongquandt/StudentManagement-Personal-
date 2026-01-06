import React, { useEffect, useState } from 'react';
import { 
  Users, 
  School, 
  FileText, 
  AlertCircle 
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingRequests: 0,
        totalClasses: 0,
        activeSemesters: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('https://localhost:7115/api/Admin/dashboard-stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                } else {
                    console.error("Failed to fetch dashboard stats");
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        }}>
            <div style={{
                backgroundColor: color,
                padding: '12px',
                borderRadius: '50%',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={24} />
            </div>
            <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '4px' }}>{title}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                    {loading ? '...' : value}
                </h3>
            </div>
        </div>
    );

    return (
        <div>
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: 'bold' }}>Dashboard Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <StatCard 
                    title="Total Users" 
                    value={stats.totalUsers} 
                    icon={Users} 
                    color="#3b82f6" 
                />
                <StatCard 
                    title="Total Classes" 
                    value={stats.totalClasses} 
                    icon={School} 
                    color="#10b981" 
                />
                <StatCard 
                    title="Pending Requests" 
                    value={stats.pendingRequests} 
                    icon={AlertCircle} 
                    color="#f59e0b" 
                />
                <StatCard 
                    title="Active Years" 
                    value={stats.activeSemesters} 
                    icon={FileText} 
                    color="#8b5cf6" 
                />
            </div>

            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>Welcome Admin</h3>
                <p style={{ color: '#4b5563' }}>
                    Use the sidebar to manage academic years, classes, subjects, and users.
                </p>
            </div>
        </div>
    );
};

export default AdminDashboard;
