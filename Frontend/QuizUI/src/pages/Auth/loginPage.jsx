import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import './loginPage.css';

const LoginPage = () => {
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
          
          <form className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Enter your email"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Enter your password"
                className="form-input"
              />
            </div>
            
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
            
            <button type="submit" className="btn btn-primary btn-full">
              Sign In
            </button>
          </form>
          
          <div className="login-footer">
            <p>Don't have an account? <Link to="/login">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
