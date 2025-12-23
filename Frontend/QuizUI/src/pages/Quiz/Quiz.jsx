import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../Components/Layout/AppLayout';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flag
} from 'lucide-react';
import './Quiz.css';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Sample quiz data
  const quiz = {
    id: quizId,
    title: 'Biology Chapter 5: Cell Structure',
    totalQuestions: 10,
    timeLimit: 600,
    questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Body'],
        correctAnswer: 1
      },
      {
        id: 2,
        type: 'mcq',
        question: 'Which organelle is responsible for protein synthesis?',
        options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Lysosome'],
        correctAnswer: 2
      },
      {
        id: 3,
        type: 'truefalse',
        question: 'The cell membrane is selectively permeable.',
        options: ['True', 'False'],
        correctAnswer: 0
      },
      {
        id: 4,
        type: 'mcq',
        question: 'What is the function of the Golgi apparatus?',
        options: [
          'Energy production',
          'Protein modification and packaging',
          'DNA replication',
          'Cell division'
        ],
        correctAnswer: 1
      },
      {
        id: 5,
        type: 'mcq',
        question: 'Which structure contains the genetic material of a cell?',
        options: ['Cytoplasm', 'Cell membrane', 'Nucleus', 'Vacuole'],
        correctAnswer: 2
      },
      {
        id: 6,
        type: 'truefalse',
        question: 'Plant cells have cell walls while animal cells do not.',
        options: ['True', 'False'],
        correctAnswer: 0
      },
      {
        id: 7,
        type: 'mcq',
        question: 'What is the function of lysosomes?',
        options: [
          'Photosynthesis',
          'Cellular digestion',
          'Protein synthesis',
          'Energy storage'
        ],
        correctAnswer: 1
      },
      {
        id: 8,
        type: 'mcq',
        question: 'The endoplasmic reticulum is involved in:',
        options: [
          'Only protein synthesis',
          'Only lipid synthesis',
          'Both protein and lipid synthesis',
          'Cell division only'
        ],
        correctAnswer: 2
      },
      {
        id: 9,
        type: 'truefalse',
        question: 'Chloroplasts are found in animal cells.',
        options: ['True', 'False'],
        correctAnswer: 1
      },
      {
        id: 10,
        type: 'mcq',
        question: 'What maintains the shape of a plant cell?',
        options: ['Cell membrane', 'Cytoplasm', 'Cell wall', 'Nucleus'],
        correctAnswer: 2
      }
    ]
  };

  // Timer effect
  useEffect(() => {
    if (quizCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizCompleted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    });
  };

  const handleFlagQuestion = (questionId) => {
    if (flaggedQuestions.includes(questionId)) {
      setFlaggedQuestions(flaggedQuestions.filter(id => id !== questionId));
    } else {
      setFlaggedQuestions([...flaggedQuestions, questionId]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setQuizCompleted(true);
    // Calculate score and navigate to results
    const score = quiz.questions.reduce((acc, q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        return acc + 1;
      }
      return acc;
    }, 0);

    // Store results and navigate
    const attemptId = Date.now();
    localStorage.setItem(`quiz_result_${attemptId}`, JSON.stringify({
      quizId,
      score,
      total: quiz.questions.length,
      answers: selectedAnswers,
      questions: quiz.questions
    }));

    navigate(`/results/${attemptId}`);
  };

  const currentQ = quiz.questions[currentQuestion];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = (answeredCount / quiz.questions.length) * 100;

  return (
    <AppLayout>
      <div className="quiz-page">
        {/* Quiz Header */}
        <div className="quiz-header glass-card">
          <div className="quiz-info">
            <h1>{quiz.title}</h1>
            <p>Question {currentQuestion + 1} of {quiz.questions.length}</p>
          </div>
          <div className="quiz-timer">
            <Clock size={20} />
            <span className={timeRemaining < 60 ? 'time-warning' : ''}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{answeredCount}/{quiz.questions.length} answered</span>
        </div>

        {/* Question Card */}
        <div className="question-card glass-card">
          <div className="question-header">
            <span className="question-type">
              {currentQ.type === 'mcq' ? 'Multiple Choice' : 'True/False'}
            </span>
            <button 
              className={`flag-btn ${flaggedQuestions.includes(currentQ.id) ? 'flagged' : ''}`}
              onClick={() => handleFlagQuestion(currentQ.id)}
            >
              <Flag size={18} />
              {flaggedQuestions.includes(currentQ.id) ? 'Flagged' : 'Flag'}
            </button>
          </div>

          <h2 className="question-text">{currentQ.question}</h2>

          <div className="options-list">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${selectedAnswers[currentQ.id] === index ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(currentQ.id, index)}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">{option}</span>
                {selectedAnswers[currentQ.id] === index && (
                  <CheckCircle2 size={20} className="option-check" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="quiz-navigation">
          <button 
            className="btn btn-secondary"
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="question-dots">
            {quiz.questions.map((q, index) => (
              <button
                key={q.id}
                className={`dot 
                  ${index === currentQuestion ? 'active' : ''} 
                  ${selectedAnswers[q.id] !== undefined ? 'answered' : ''}
                  ${flaggedQuestions.includes(q.id) ? 'flagged' : ''}
                `}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button 
              className="btn btn-primary"
              onClick={handleSubmitQuiz}
            >
              Submit Quiz
            </button>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={handleNextQuestion}
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Quiz;
