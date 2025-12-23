import React from 'react';
import './ErrorBoundary.css';

// Pre-generate particle styles outside component to avoid calling Math.random during render
const PARTICLE_STYLES = [...Array(15)].map(() => ({
  '--delay': `${Math.random() * 5}s`,
  '--duration': `${5 + Math.random() * 10}s`,
  '--x-start': `${Math.random() * 100}%`,
  '--x-end': `${Math.random() * 100}%`,
  '--size': `${2 + Math.random() * 4}px`,
}));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError() {
    // Generate a unique error ID for reference
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
    return { hasError: true, errorId };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-page">
          {/* Background Effects */}
          <div className="eb-background">
            <div className="eb-orb eb-orb-1"></div>
            <div className="eb-orb eb-orb-2"></div>
            <div className="eb-orb eb-orb-3"></div>
            <div className="eb-grid-overlay"></div>
          </div>

          <div className="eb-container">
            {/* Error Icon */}
            <div className="eb-icon-container">
              <div className="eb-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.3 1.55 18.64 1.55 19C1.55 19.36 1.64 19.7 1.82 20C2 20.3 2.26 20.56 2.57 20.74C2.88 20.92 3.23 21.01 3.59 21H20.41C20.77 21.01 21.12 20.92 21.43 20.74C21.74 20.56 22 20.3 22.18 20C22.36 19.7 22.45 19.36 22.45 19C22.45 18.64 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.27 3.32 12.96 3.15C12.65 2.98 12.3 2.89 11.95 2.89C11.6 2.89 11.25 2.98 10.94 3.15C10.63 3.32 10.37 3.56 10.19 3.86H10.29Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="eb-pulse-ring"></div>
              <div className="eb-pulse-ring eb-pulse-ring-delay"></div>
            </div>

            {/* Error Content */}
            <div className="eb-content">
              <h1 className="eb-title">Something Went Wrong</h1>
              <p className="eb-message">
                We're sorry, but something unexpected happened. Our team has been notified and is working to fix the issue.
              </p>

              {/* Error Reference */}
              <div className="eb-reference">
                <span className="eb-reference-label">Error Reference:</span>
                <code className="eb-reference-code">{this.state.errorId}</code>
              </div>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="eb-details">
                  <button 
                    className="eb-details-toggle"
                    onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                  </button>
                  
                  {this.state.showDetails && (
                    <div className="eb-details-content">
                      <div className="eb-details-section">
                        <h4>Error Message:</h4>
                        <pre>{this.state.error.toString()}</pre>
                      </div>
                      {this.state.errorInfo && (
                        <div className="eb-details-section">
                          <h4>Component Stack:</h4>
                          <pre>{this.state.errorInfo.componentStack}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="eb-actions">
              <button className="eb-btn eb-btn-primary" onClick={this.handleRetry}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9C19.9828 7.56678 19.1209 6.28538 17.9845 5.27542C16.8482 4.26546 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7345 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Try Again
              </button>
              <button className="eb-btn eb-btn-secondary" onClick={this.handleReload}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 4V10H17M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.51 9C4.01717 7.56678 4.87913 6.28538 6.01547 5.27542C7.1518 4.26546 8.52547 3.55976 10.0083 3.22426C11.4911 2.88875 13.0348 2.93434 14.4952 3.35677C15.9556 3.77921 17.2853 4.56471 18.36 5.64L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1112 13.9917 20.7757C15.4745 20.4402 16.8482 19.7345 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Reload Page
              </button>
              <button className="eb-btn eb-btn-tertiary" onClick={this.handleGoHome}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Go Home
              </button>
            </div>

            {/* Support Info */}
            <div className="eb-support">
              <p className="eb-support-text">
                If the problem persists, please contact support with the error reference above.
              </p>
            </div>
          </div>

          {/* Floating Particles */}
          <div className="eb-particles">
            {PARTICLE_STYLES.map((style, i) => (
              <div
                key={i}
                className="eb-particle"
                style={style}
              ></div>
            ))}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
