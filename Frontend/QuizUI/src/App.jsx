import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/authContext'
import ProtectedRoute from './Components/ProtectedRoute'
import ErrorBoundary from './Components/ErrorBoundary/ErrorBoundary'

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
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } />
          <Route path="/quiz/:quizId" element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          } />
          <Route path="/flashcards/:deckId" element={
            <ProtectedRoute>
              <Flashcards />
            </ProtectedRoute>
          } />
          <Route path="/results/:attemptId" element={
            <ProtectedRoute>
              <Results />
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
