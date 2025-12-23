import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/authContext';
import '../login/loginPage.css'; // Reusing login styles

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      navigate('/login'); // Redirect to login after successful signup
    } catch (err) {
      console.error("Signup failed", err);
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
            <h1>Create Account</h1>
            <p>Join us and start your learning journey</p>
          </div>
          
          {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                placeholder="Enter your full name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                placeholder="Create a password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
