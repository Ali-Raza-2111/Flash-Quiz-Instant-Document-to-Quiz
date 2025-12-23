import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { 
  BookOpen, 
  LayoutDashboard, 
  Upload, 
  Brain, 
  Layers, 
  BarChart3,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react';
import './AppLayout.css';

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/upload', icon: <Upload size={20} />, label: 'Upload' },
    { path: '/quiz/demo', icon: <Brain size={20} />, label: 'Quizzes' },
    { path: '/flashcards/demo', icon: <Layers size={20} />, label: 'Flashcards' },
    { path: '/results/demo', icon: <BarChart3 size={20} />, label: 'Results' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path.split('/')[1] ? '/' + path.split('/')[1] : path);
  };

  return (
    <div className="app-layout">
      {/* Background Effects */}
      <div className="app-background">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="logo">
            <BookOpen className="logo-icon" />
            <span className="logo-text">QuizMaster</span>
          </Link>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <div className="header-right">
            <div className="user-menu">
              <button 
                className="user-menu-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar">{user?.avatar || 'U'}</div>
                <span className="user-name">{user?.name || 'User'}</span>
                <ChevronDown size={16} />
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-avatar large">{user?.avatar || 'U'}</div>
                    <div className="user-info">
                      <span className="user-name">{user?.name || 'User'}</span>
                      <span className="user-email">{user?.email || 'user@example.com'}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <User size={18} />
                    Profile
                  </Link>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
