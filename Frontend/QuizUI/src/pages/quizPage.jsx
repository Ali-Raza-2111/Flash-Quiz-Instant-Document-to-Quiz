import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

const QuizPage = () => {
  return (
    <div className="quiz-page" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <Brain size={48} style={{ color: 'var(--ocean-glow)', marginBottom: '1rem' }} />
        <h1>Quiz Page</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
          Quiz interface coming soon...
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default QuizPage;
