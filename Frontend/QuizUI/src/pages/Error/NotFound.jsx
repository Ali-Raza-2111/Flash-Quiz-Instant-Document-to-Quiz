import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './NotFound.css';

// Pre-generate particle styles outside component to avoid calling Math.random during render
const PARTICLE_STYLES = [...Array(20)].map(() => ({
  '--delay': `${Math.random() * 5}s`,
  '--duration': `${5 + Math.random() * 10}s`,
  '--x-start': `${Math.random() * 100}%`,
  '--x-end': `${Math.random() * 100}%`,
  '--size': `${2 + Math.random() * 4}px`,
}));

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const handleGoHome = () => {
    navigate(isAuthenticated ? '/dashboard' : '/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="error-page">
      {/* Background Effects */}
      <div className="error-background">
        <div className="error-orb error-orb-1"></div>
        <div className="error-orb error-orb-2"></div>
        <div className="error-orb error-orb-3"></div>
        <div className="error-grid-overlay"></div>
      </div>

      <div className="error-container">
        {/* Glitch Effect Title */}
        <div className="error-code-wrapper">
          <h1 className="error-code" data-text="404">404</h1>
          <div className="error-code-glow"></div>
        </div>

        {/* Animated Icon */}
        <div className="error-icon-container">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 15C8.5 13.5 10 12.5 12 12.5C14 12.5 15.5 13.5 16 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="9" cy="9" r="1.5" fill="currentColor" />
              <circle cx="15" cy="9" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div className="error-pulse-ring"></div>
          <div className="error-pulse-ring error-pulse-ring-delay"></div>
        </div>

        {/* Error Message */}
        <div className="error-content">
          <h2 className="error-title">Page Not Found</h2>
          <p className="error-message">
            Oops! The page you're looking for seems to have drifted into the digital abyss.
          </p>
          <p className="error-path">
            <span className="error-path-label">Attempted path:</span>
            <code className="error-path-value">{location.pathname}</code>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="error-actions">
          <button className="error-btn error-btn-primary" onClick={handleGoHome}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
          </button>
          <button className="error-btn error-btn-secondary" onClick={handleGoBack}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="error-help">
          <p className="error-help-title">Looking for something?</p>
          <div className="error-links">
            {isAuthenticated ? (
              <>
                <button onClick={() => navigate('/dashboard')} className="error-link">
                  <span className="error-link-icon">📊</span>
                  Dashboard
                </button>
                <button onClick={() => navigate('/upload')} className="error-link">
                  <span className="error-link-icon">📤</span>
                  Upload
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="error-link">
                  <span className="error-link-icon">🔐</span>
                  Login
                </button>
                <button onClick={() => navigate('/signup')} className="error-link">
                  <span className="error-link-icon">✨</span>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="error-particles">
        {PARTICLE_STYLES.map((style, i) => (
          <div
            key={i}
            className="error-particle"
            style={style}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default NotFound;
