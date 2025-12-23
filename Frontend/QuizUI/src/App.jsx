import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landingPage'
import LoginPage from './pages/loginPage'
import Dashboard from './pages/dashboard'
import QuizPage from './pages/quizPage'
import ResultPage from './pages/resultPage'

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
