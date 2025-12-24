import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../Components/Layout/AppLayout';
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Share2,
  Download,
  Brain,
  TrendingUp,
  AlertTriangle,
  Percent,
  FileQuestion,
  Upload
} from 'lucide-react';
import './Results.css';

const Results = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [expandedQuestions, setExpandedQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get result from localStorage
    const storedResult = localStorage.getItem(`quiz_result_${attemptId}`);
    
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      setResult(null);
    }
    setLoading(false);
  }, [attemptId]);

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="results-page">
          <div className="results-loading glass-card">
            <div className="loading-spinner"></div>
            <p>Loading results...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // No result found - user hasn't attempted quiz
  if (!result) {
    return (
      <AppLayout>
        <div className="results-page">
          <div className="results-empty glass-card">
            <div className="empty-icon">
              <FileQuestion size={64} />
            </div>
            <h1>No Quiz Results Found</h1>
            <p>It looks like you haven't attempted any quiz yet, or the results have expired.</p>
            <div className="empty-actions">
              <Link to="/upload" className="btn btn-primary btn-lg">
                <Upload size={20} />
                Upload Document & Start Quiz
              </Link>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Handle new format with answers array containing detailed info
  const hasNewFormat = result.answers && Array.isArray(result.answers);
  const percentage = result.percentage || Math.round((result.score / result.total) * 100);
  const isPassing = percentage >= 70;
  
  const toggleQuestion = (questionId) => {
    if (expandedQuestions.includes(questionId)) {
      setExpandedQuestions(expandedQuestions.filter(id => id !== questionId));
    } else {
      setExpandedQuestions([...expandedQuestions, questionId]);
    }
  };

  const getGrade = (percent) => {
    if (percent >= 90) return { grade: 'A', label: 'Excellent!' };
    if (percent >= 80) return { grade: 'B', label: 'Great Job!' };
    if (percent >= 70) return { grade: 'C', label: 'Good Work!' };
    if (percent >= 60) return { grade: 'D', label: 'Keep Practicing' };
    return { grade: 'F', label: 'Needs Improvement' };
  };

  const gradeInfo = getGrade(percentage);
  
  // Get wrong answers based on format
  const wrongAnswers = hasNewFormat 
    ? result.answers.filter(a => !a.is_correct)
    : result.questions?.filter(q => result.answers[q.id] !== q.correctAnswer) || [];

  return (
    <AppLayout>
      <div className="results-page">
        {/* Score Card */}
        <div className="score-card glass-card">
          <div className="score-header">
            <Trophy size={48} className={isPassing ? 'trophy-gold' : 'trophy-silver'} />
            <h1>{gradeInfo.label}</h1>
          </div>

          <div className="score-circle">
            <svg viewBox="0 0 100 100">
              <circle
                className="score-bg"
                cx="50"
                cy="50"
                r="45"
              />
              <circle
                className={`score-fill ${isPassing ? 'passing' : 'failing'}`}
                cx="50"
                cy="50"
                r="45"
                strokeDasharray={`${percentage * 2.83} 283`}
              />
            </svg>
            <div className="score-text">
              <span className="score-percent">{percentage}%</span>
              <span className="score-grade">{gradeInfo.grade}</span>
            </div>
          </div>

          <div className="score-details">
            <div className="detail-item">
              <CheckCircle2 size={20} className="correct" />
              <span>{result.score} Correct</span>
            </div>
            <div className="detail-item">
              <XCircle size={20} className="incorrect" />
              <span>{result.total - result.score} Incorrect</span>
            </div>
            {result.usedSimilarity && (
              <div className="detail-item similarity-badge">
                <Percent size={20} />
                <span>AI Similarity</span>
              </div>
            )}
          </div>

          <div className="score-actions">
            <Link to="/upload" className="btn btn-primary">
              <RotateCcw size={18} />
              Try Another Quiz
            </Link>
            <button className="btn btn-secondary">
              <Share2 size={18} />
              Share Results
            </button>
          </div>
        </div>

        {/* Weak Areas */}
        {wrongAnswers.length > 0 && (
          <div className="weak-areas glass-card">
            <div className="section-header">
              <AlertTriangle size={24} className="warning-icon" />
              <h2>Areas to Improve</h2>
            </div>
            <p className="section-desc">
              Review these topics to strengthen your understanding
            </p>
            <div className="weak-topics">
              {wrongAnswers.slice(0, 3).map((item, index) => (
                <div key={index} className="weak-topic">
                  <Brain size={18} />
                  <span>
                    {hasNewFormat 
                      ? `Q${item.question_id}: ${item.question?.substring(0, 50)}...`
                      : `Question ${item.id}: ${item.question.substring(0, 50)}...`
                    }
                  </span>
                </div>
              ))}
            </div>
            <Link to="/upload" className="btn btn-outline btn-full">
              <TrendingUp size={18} />
              Try Another Quiz
            </Link>
          </div>
        )}

        {/* Questions Review */}
        <div className="questions-review">
          <h2>Question Review</h2>
          {result.usedSimilarity && (
            <p className="similarity-note">
              ✨ Answers were evaluated using AI cosine similarity matching
            </p>
          )}
          <div className="questions-list">
            {hasNewFormat ? (
              // New format with detailed answers array
              result.answers.map((answer, index) => {
                const isCorrect = answer.is_correct;
                const isExpanded = expandedQuestions.includes(answer.question_id);

                return (
                  <div 
                    key={answer.question_id} 
                    className={`question-item glass-card ${isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    <div 
                      className="question-header"
                      onClick={() => toggleQuestion(answer.question_id)}
                    >
                      <div className="question-status">
                        {isCorrect ? (
                          <CheckCircle2 size={20} className="status-icon correct" />
                        ) : (
                          <XCircle size={20} className="status-icon incorrect" />
                        )}
                        <span className="question-number">Q{answer.question_id}</span>
                        {answer.similarity !== undefined && (
                          <span className="similarity-score">
                            {Math.round(answer.similarity * 100)}% match
                          </span>
                        )}
                      </div>
                      <p className="question-text">{answer.question}</p>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>

                    {isExpanded && (
                      <div className="question-details">
                        <div className="answer-comparison">
                          <div className={`answer-box ${isCorrect ? 'correct' : 'user-wrong'}`}>
                            <span className="answer-label">Your Answer:</span>
                            <span className="answer-value">{answer.user_answer}</span>
                          </div>
                          <div className="answer-box correct-answer">
                            <span className="answer-label">Correct Answer:</span>
                            <span className="answer-value">{answer.correct_answer}</span>
                          </div>
                        </div>
                        
                        {answer.options && (
                          <div className="answers-grid">
                            {answer.options.map((option, idx) => (
                              <div 
                                key={idx}
                                className={`answer-item 
                                  ${idx === answer.correct_answer_index ? 'correct-answer' : ''}
                                  ${idx === answer.user_answer_index && !isCorrect ? 'user-wrong' : ''}
                                  ${idx === answer.user_answer_index && isCorrect ? 'user-correct' : ''}
                                `}
                              >
                                <span className="answer-letter">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="answer-text">{option}</span>
                                {idx === answer.correct_answer_index && (
                                  <CheckCircle2 size={16} className="answer-icon" />
                                )}
                                {idx === answer.user_answer_index && !isCorrect && (
                                  <XCircle size={16} className="answer-icon wrong" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {answer.explanation && (
                          <div className="explanation-section">
                            <div className="explanation-header">
                              <Brain size={16} />
                              <span>Explanation</span>
                            </div>
                            <p className="explanation-text">{answer.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Legacy format with questions array
              result.questions?.map((question) => {
                const userAnswer = result.answers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                const isExpanded = expandedQuestions.includes(question.id);

                return (
                  <div 
                    key={question.id} 
                    className={`question-item glass-card ${isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    <div 
                      className="question-header"
                      onClick={() => toggleQuestion(question.id)}
                    >
                      <div className="question-status">
                        {isCorrect ? (
                          <CheckCircle2 size={20} className="status-icon correct" />
                        ) : (
                          <XCircle size={20} className="status-icon incorrect" />
                        )}
                        <span className="question-number">Q{question.id}</span>
                      </div>
                      <p className="question-text">{question.question}</p>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>

                    {isExpanded && (
                      <div className="question-details">
                        <div className="answers-grid">
                          {question.options.map((option, index) => (
                            <div 
                              key={index}
                              className={`answer-item 
                                ${index === question.correctAnswer ? 'correct-answer' : ''}
                                ${index === userAnswer && !isCorrect ? 'user-wrong' : ''}
                                ${index === userAnswer && isCorrect ? 'user-correct' : ''}
                              `}
                            >
                              <span className="answer-letter">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="answer-text">{option}</span>
                              {index === question.correctAnswer && (
                                <CheckCircle2 size={16} className="answer-icon" />
                              )}
                              {index === userAnswer && !isCorrect && (
                                <XCircle size={16} className="answer-icon wrong" />
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {question.explanation && (
                          <div className="explanation-section">
                            <div className="explanation-header">
                              <Brain size={16} />
                              <span>Explanation</span>
                            </div>
                            <p className="explanation-text">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Results;
