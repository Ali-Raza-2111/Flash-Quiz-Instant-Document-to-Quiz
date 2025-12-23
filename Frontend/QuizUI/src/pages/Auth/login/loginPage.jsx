import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/authContext';
import './loginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="login-page">
      <div className="background-effects">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>
      
      <div className="login-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
        
        <div className="login-card glass-card">
          <div className="login-header">
            <Link to="/" className="logo">
              <BookOpen className="logo-icon" />
              <span className="logo-text">QuizMaster</span>
            </Link>
            <h1>Welcome Back</h1>
            <p>Sign in to continue your learning journey</p>
          </div>
          
          {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Enter your email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Enter your password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
            
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
