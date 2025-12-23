import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="dashboard-page" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <BookOpen size={48} style={{ color: 'var(--ocean-glow)', marginBottom: '1rem' }} />
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
          Dashboard page coming soon...
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
