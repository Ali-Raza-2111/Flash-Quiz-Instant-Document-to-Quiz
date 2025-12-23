import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

const ResultPage = () => {
  return (
    <div className="result-page" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <Trophy size={48} style={{ color: 'var(--ocean-glow)', marginBottom: '1rem' }} />
        <h1>Results</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
          Results page coming soon...
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ResultPage;
