import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/authContext'
import ProtectedRoute from './Components/ProtectedRoute'
import ErrorBoundary from './Components/ErrorBoundary/ErrorBoundary'
import FloatingChat from './Components/FloatingChat/FloatingChat'

// Public Pages
import LandingPage from './pages/landingPage'
import LoginPage from './pages/Auth/loginPage'
import SignupPage from './pages/Auth/signupPage'

// Protected Pages
import Dashboard from './pages/Dashboard/Dashboard'
import Upload from './pages/Upload/Upload'
import Quiz from './pages/Quiz/Quiz'
import Flashcards from './pages/Flashcards/Flashcards'
import Results from './pages/Results/Results'

// Error Pages
import NotFound from './pages/Error/NotFound'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
              <FloatingChat />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <Upload />
              <FloatingChat />
            </ProtectedRoute>
          } />
          <Route path="/quiz/:quizId" element={
            <ProtectedRoute>
              <Quiz />
              <FloatingChat />
            </ProtectedRoute>
          } />
          <Route path="/flashcards/:deckId" element={
            <ProtectedRoute>
              <Flashcards />
              <FloatingChat />
            </ProtectedRoute>
          } />
          <Route path="/results/:attemptId" element={
            <ProtectedRoute>
              <Results />
              <FloatingChat />
            </ProtectedRoute>
          } />

          {/* 404 Catch-All Route - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
