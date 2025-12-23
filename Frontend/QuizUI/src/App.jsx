import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landing/landingPage'
import LoginPage from './pages/Auth/login/loginPage'
import Dashboard from './pages/dashboard/dashboard'
import QuizPage from './pages/dashboard/quizPage'
import ResultPage from './pages/dashboard/resultPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/results" element={<ResultPage />} />
    </Routes>
  )
}

export default App
