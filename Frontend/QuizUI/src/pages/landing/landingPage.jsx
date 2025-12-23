import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Users, 
  ChevronRight, 
  Sparkles,
  Target,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Play,
  Star
} from 'lucide-react';
import './landingPage.css';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Brain className="feature-icon" />,
      title: "AI-Powered Quizzes",
      description: "Generate intelligent quizzes from any document or topic using advanced AI technology."
    },
    {
      icon: <Target className="feature-icon" />,
      title: "Adaptive Learning",
      description: "Personalized quiz difficulty that adapts to your knowledge level for optimal learning."
    },
    {
      icon: <BarChart3 className="feature-icon" />,
      title: "Track Progress",
      description: "Comprehensive analytics to monitor your learning journey and identify areas to improve."
    },
    {
      icon: <Zap className="feature-icon" />,
      title: "Instant Feedback",
      description: "Get immediate explanations and learn from your mistakes in real-time."
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Learners" },
    { value: "50K+", label: "Quizzes Created" },
    { value: "95%", label: "Success Rate" },
    { value: "4.9", label: "User Rating", icon: <Star className="stat-star" /> }
  ];

  const testimonials = [
    {
      quote: "QuizMaster transformed how I prepare for exams. The AI-generated quizzes are incredibly accurate!",
      author: "Sarah Johnson",
      role: "Medical Student",
      avatar: "SJ"
    },
    {
      quote: "The adaptive learning feature helped me identify my weak points. Highly recommended!",
      author: "Michael Chen",
      role: "Software Engineer",
      avatar: "MC"
    },
    {
      quote: "Best study companion I've ever used. The progress tracking keeps me motivated.",
      author: "Emily Davis",
      role: "Law Student",
      avatar: "ED"
    }
  ];

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="background-effects">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container navbar-content">
          <Link to="/" className="logo">
            <BookOpen className="logo-icon" />
            <span className="logo-text">QuizMaster</span>
          </Link>
          
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#testimonials">Testimonials</a>
          </div>

          <div className="nav-actions">
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
            <Link to="/login" className="btn btn-primary">
              Get Started
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-badge animate-fade-in">
            <Sparkles size={16} />
            <span>AI-Powered Learning Platform</span>
          </div>
          
          <h1 className="hero-title animate-fade-in-up">
            Master Any Subject with
            <span className="text-gradient"> Smart Quizzes</span>
          </h1>
          
          <p className="hero-description animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Transform your study materials into interactive quizzes. Learn faster, 
            retain longer, and track your progress with our AI-powered platform.
          </p>

          <div className="hero-actions animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/login" className="btn btn-primary btn-lg">
              Start Learning Free
              <ArrowRight size={20} />
            </Link>
            <button className="btn btn-outline btn-lg">
              <Play size={20} />
              Watch Demo
            </button>
          </div>

          <div className="hero-stats animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-value">
                  {stat.value}
                  {stat.icon}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual animate-float">
          <div className="hero-card glass-card">
            <div className="quiz-preview">
              <div className="quiz-header">
                <Brain className="quiz-icon" />
                <span>Science Quiz</span>
                <span className="quiz-progress">3/10</span>
              </div>
              <div className="quiz-question">
                What is the powerhouse of the cell?
              </div>
              <div className="quiz-options">
                <div className="quiz-option">Nucleus</div>
                <div className="quiz-option correct">Mitochondria</div>
                <div className="quiz-option">Ribosome</div>
                <div className="quiz-option">Golgi Body</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <Sparkles size={14} />
              Features
            </span>
            <h2 className="section-title">
              Everything you need to
              <span className="text-gradient"> excel in learning</span>
            </h2>
            <p className="section-description">
              Powerful tools designed to make studying more effective and engaging
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card glass-card glass-card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <Target size={14} />
              How it Works
            </span>
            <h2 className="section-title">
              Start learning in
              <span className="text-gradient"> 3 simple steps</span>
            </h2>
          </div>

          <div className="steps-container">
            <div className="step-card glass-card">
              <div className="step-number">01</div>
              <div className="step-icon">
                <BookOpen size={32} />
              </div>
              <h3>Upload Content</h3>
              <p>Upload your study materials, documents, or paste text directly</p>
            </div>

            <div className="step-connector">
              <ChevronRight size={24} />
            </div>

            <div className="step-card glass-card">
              <div className="step-number">02</div>
              <div className="step-icon">
                <Brain size={32} />
              </div>
              <h3>Generate Quiz</h3>
              <p>Our AI analyzes your content and creates personalized quizzes</p>
            </div>

            <div className="step-connector">
              <ChevronRight size={24} />
            </div>

            <div className="step-card glass-card">
              <div className="step-number">03</div>
              <div className="step-icon">
                <Trophy size={32} />
              </div>
              <h3>Learn & Master</h3>
              <p>Take quizzes, track progress, and master your subjects</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <Users size={14} />
              Testimonials
            </span>
            <h2 className="section-title">
              Loved by
              <span className="text-gradient"> thousands of learners</span>
            </h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card glass-card glass-card-hover">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="star-icon" />
                  ))}
                </div>
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.author}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card glass-card">
            <div className="cta-content">
              <h2>Ready to supercharge your learning?</h2>
              <p>Join thousands of students who are already learning smarter, not harder.</p>
              <div className="cta-actions">
                <Link to="/login" className="btn btn-primary btn-lg">
                  Get Started for Free
                  <ArrowRight size={20} />
                </Link>
              </div>
              <div className="cta-features">
                <span><CheckCircle2 size={16} /> No credit card required</span>
                <span><CheckCircle2 size={16} /> Free forever plan</span>
                <span><CheckCircle2 size={16} /> Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <BookOpen className="logo-icon" />
              <span className="logo-text">QuizMaster</span>
            </Link>
            <p>Making learning smarter, one quiz at a time.</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it Works</a>
              <a href="#">Pricing</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact</a>
              <a href="#">Privacy</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container">
            <p>&copy; 2025 QuizMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
