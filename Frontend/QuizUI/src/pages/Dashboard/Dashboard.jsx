import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import AppLayout from '../../Components/Layout/AppLayout';
import { 
  Upload, 
  Brain, 
  Layers, 
  BarChart3, 
  Clock, 
  Trophy,
  TrendingUp,
  FileText,
  ArrowRight,
  Plus
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  const recentQuizzes = [
    { id: 1, title: 'Biology Chapter 5', questions: 20, score: 85, date: '2 hours ago' },
    { id: 2, title: 'World History', questions: 15, score: 92, date: '1 day ago' },
    { id: 3, title: 'Mathematics', questions: 25, score: 78, date: '2 days ago' },
  ];

  const stats = [
    { icon: <Brain size={24} />, label: 'Quizzes Taken', value: '24', trend: '+3 this week' },
    { icon: <Trophy size={24} />, label: 'Avg. Score', value: '85%', trend: '+5% improvement' },
    { icon: <Clock size={24} />, label: 'Study Time', value: '12h', trend: 'This week' },
    { icon: <TrendingUp size={24} />, label: 'Streak', value: '7 days', trend: 'Keep it up!' },
  ];

  const quickActions = [
    { icon: <Upload size={24} />, label: 'Upload Document', path: '/upload', color: 'blue' },
    { icon: <Brain size={24} />, label: 'Start Quiz', path: '/quiz/new', color: 'purple' },
    { icon: <Layers size={24} />, label: 'Flashcards', path: '/flashcards/new', color: 'cyan' },
    { icon: <BarChart3 size={24} />, label: 'View Results', path: '/results/all', color: 'green' },
  ];

  return (
    <AppLayout>
      <div className="dashboard-page">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <div className="welcome-text">
            <h1>Welcome back, {user?.name || 'Learner'}! 👋</h1>
            <p>Ready to continue your learning journey?</p>
          </div>
          <Link to="/upload" className="btn btn-primary">
            <Plus size={20} />
            New Quiz
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card glass-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
                <span className="stat-trend">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <Link 
                key={index} 
                to={action.path} 
                className={`quick-action-card glass-card glass-card-hover color-${action.color}`}
              >
                <div className="action-icon">{action.icon}</div>
                <span className="action-label">{action.label}</span>
                <ArrowRight size={18} className="action-arrow" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Quizzes */}
        <section className="recent-section">
          <div className="section-header">
            <h2>Recent Quizzes</h2>
            <Link to="/results/all" className="view-all">View All</Link>
          </div>
          <div className="recent-list">
            {recentQuizzes.map((quiz) => (
              <div key={quiz.id} className="recent-item glass-card glass-card-hover">
                <div className="quiz-info">
                  <FileText size={20} className="quiz-icon" />
                  <div className="quiz-details">
                    <h3>{quiz.title}</h3>
                    <p>{quiz.questions} questions • {quiz.date}</p>
                  </div>
                </div>
                <div className="quiz-score">
                  <span className={`score ${quiz.score >= 80 ? 'high' : quiz.score >= 60 ? 'medium' : 'low'}`}>
                    {quiz.score}%
                  </span>
                </div>
                <Link to={`/results/${quiz.id}`} className="btn btn-secondary btn-sm">
                  Review
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
