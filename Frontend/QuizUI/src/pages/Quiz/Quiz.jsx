import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../../Components/Layout/AppLayout';
import { generateOneQuestion, checkAnswersSimilarity, generateOneQuestionWithAgent } from '../../services/api';
import { formatOption } from '../../utils/formatters';
import { 
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Play,
  Brain
} from 'lucide-react';
import './Quiz.css';

const Quiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [allAnswers, setAllAnswers] = useState([]); // Store all answered questions
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);  // Track if quiz has started
  
  // Settings from Upload page
  const settings = location.state?.settings || {
    difficulty: 'medium',
    questionType: 'mcq',
    questionCount: 5,
    useAgent: true  // Default to using agent-based generation
  };
  
  const totalQuestions = settings.questionCount || 5;
  const useAgentMode = settings.useAgent !== false;  // Use agent by default

  // Fetch a new question
  const fetchQuestion = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedAnswer(null);
    
    try {
      let question;
      
      if (useAgentMode) {
        // Use agent-based generation (your custom agent)
        question = await generateOneQuestionWithAgent(previousQuestions);
      } else {
        // Use original RAG-based generation
        question = await generateOneQuestion(
          'general',
          settings.difficulty,
          settings.questionType,
          previousQuestions
        );
      }
      
      if (question.error) {
        setError(question.error);
      } else {
        // Assign proper ID based on question number
        question.id = questionNumber;
        setCurrentQuestion(question);
        
        // Track asked questions to avoid duplicates
        if (question.question) {
          setPreviousQuestions(prev => [...prev, question.question.substring(0, 50)]);
        }
      }
    } catch (err) {
      console.error('Error fetching question:', err);
      setError('Failed to generate question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start quiz handler
  const handleStartQuiz = () => {
    setQuizStarted(true);
    fetchQuestion();
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) {
      alert('Please select an answer before continuing.');
      return;
    }

    // Store the answer with question data
    const answerData = {
      question_id: currentQuestion.id,
      question: currentQuestion.question,
      user_answer: currentQuestion.options[selectedAnswer],
      correct_answer: currentQuestion.correctAnswerText,
      user_answer_index: selectedAnswer,
      correct_answer_index: currentQuestion.correctAnswer,
      options: currentQuestion.options,
      explanation: currentQuestion.explanation
    };
    
    setAllAnswers(prev => [...prev, answerData]);

    // Check if this was the last question
    if (questionNumber >= totalQuestions) {
      // Submit all answers for similarity checking
      await submitAllAnswers([...allAnswers, answerData]);
    } else {
      // Move to next question
      setQuestionNumber(prev => prev + 1);
      fetchQuestion();
    }
  };

  const submitAllAnswers = async (answers) => {
    setIsSubmitting(true);
    
    try {
      // Prepare answers for similarity check
      const answersForCheck = answers.map(a => ({
        question_id: a.question_id,
        user_answer: a.user_answer,
        correct_answer: a.correct_answer
      }));
      
      // Check answers using cosine similarity
      const results = await checkAnswersSimilarity(answersForCheck);
      
      // Combine results with question data for results page
      const detailedResults = answers.map((answer, index) => ({
        ...answer,
        similarity: results.results[index]?.similarity || 0,
        is_correct: results.results[index]?.is_correct || false
      }));
      
      // Navigate to results
      const attemptId = Date.now();
      localStorage.setItem(`quiz_result_${attemptId}`, JSON.stringify({
        quizId: 'generated',
        score: results.score,
        total: results.total,
        percentage: results.percentage,
        answers: detailedResults,
        usedSimilarity: true
      }));
      
      navigate(`/results/${attemptId}`);
      
    } catch (err) {
      console.error('Error submitting answers:', err);
      
      // Fallback: Calculate score locally using index matching
      const score = answers.reduce((acc, a) => {
        return a.user_answer_index === a.correct_answer_index ? acc + 1 : acc;
      }, 0);
      
      const attemptId = Date.now();
      localStorage.setItem(`quiz_result_${attemptId}`, JSON.stringify({
        quizId: 'generated',
        score: score,
        total: answers.length,
        percentage: (score / answers.length) * 100,
        answers: answers.map(a => ({
          ...a,
          is_correct: a.user_answer_index === a.correct_answer_index
        })),
        usedSimilarity: false,
        fallbackReason: 'Similarity check failed'
      }));
      
      navigate(`/results/${attemptId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (questionNumber / totalQuestions) * 100;

  // Start screen - show before quiz begins
  if (!quizStarted) {
    return (
      <AppLayout>
        <div className="quiz-page">
          <div className="quiz-start-screen glass-card">
            <div className="start-icon">
              <Brain size={64} />
            </div>
            <h1>Ready to Start Your Quiz?</h1>
            <p>You will answer {totalQuestions} questions generated from your uploaded document.</p>
            <div className="quiz-settings-summary">
              <div className="setting-item">
                <span className="label">Difficulty:</span>
                <span className="value">{settings.difficulty}</span>
              </div>
              <div className="setting-item">
                <span className="label">Questions:</span>
                <span className="value">{totalQuestions}</span>
              </div>
              <div className="setting-item">
                <span className="label">Mode:</span>
                <span className="value">{useAgentMode ? 'Agent AI' : 'RAG'}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-lg start-quiz-btn" onClick={handleStartQuiz}>
              <Play size={24} />
              Start Quiz
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="quiz-page">
          <div className="quiz-loading glass-card">
            <Loader2 size={48} className="spinner" />
            <h2>Generating Question {questionNumber}...</h2>
            <p>AI is creating a unique question for you</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="quiz-page">
          <div className="quiz-error glass-card">
            <AlertCircle size={48} />
            <h2>Error</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn btn-primary" onClick={fetchQuestion}>
                Try Again
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/upload')}>
                Upload New Document
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Submitting state
  if (isSubmitting) {
    return (
      <AppLayout>
        <div className="quiz-page">
          <div className="quiz-loading glass-card">
            <Loader2 size={48} className="spinner" />
            <h2>Checking Your Answers...</h2>
            <p>Using AI similarity matching to evaluate your responses</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // No question loaded
  if (!currentQuestion) {
    return (
      <AppLayout>
        <div className="quiz-page">
          <div className="quiz-error glass-card">
            <AlertCircle size={48} />
            <h2>No Question Available</h2>
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>
              Upload a Document
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="quiz-page">
        {/* Quiz Header */}
        <div className="quiz-header glass-card">
          <div className="quiz-info">
            <h1>Quiz</h1>
            <p>Question {questionNumber} of {totalQuestions}</p>
          </div>
          <div className="quiz-stats">
            <span className="difficulty-badge">{settings.difficulty}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{questionNumber}/{totalQuestions}</span>
        </div>

        {/* Question Card */}
        <div className="question-card glass-card">
          <div className="question-header">
            <span className="question-type">
              {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'True/False'}
            </span>
            <span className="question-number">#{questionNumber}</span>
          </div>

          <h2 className="question-text">{currentQuestion.question}</h2>

          <div className="options-list">
            {currentQuestion.options?.map((option, index) => {
              const displayText = formatOption(option, 100);
              const isTruncated = option.length > 100;
              
              return (
                <button
                  key={index}
                  className={`option-btn ${selectedAnswer === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                  title={isTruncated ? option : undefined}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">{displayText}</span>
                  {selectedAnswer === index && (
                    <CheckCircle2 size={20} className="option-check" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="quiz-navigation">
          <div className="answered-count">
            <span>{allAnswers.length} answered</span>
          </div>

          <button 
            className="btn btn-primary btn-lg"
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
          >
            {questionNumber >= totalQuestions ? (
              <>Submit Quiz</>
            ) : (
              <>
                Next Question
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Quiz;
