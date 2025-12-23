import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  AlertTriangle
} from 'lucide-react';
import './Results.css';

const Results = () => {
  const { attemptId } = useParams();
  const [expandedQuestions, setExpandedQuestions] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Try to get result from localStorage
    const storedResult = localStorage.getItem(`quiz_result_${attemptId}`);
    
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      // Demo data if no stored result
      setResult({
        quizId: attemptId,
        score: 8,
        total: 10,
        timeTaken: '8:32',
        answers: { 1: 1, 2: 2, 3: 0, 4: 1, 5: 2, 6: 0, 7: 1, 8: 2, 9: 0, 10: 2 },
        questions: [
          { id: 1, question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Body'], correctAnswer: 1 },
          { id: 2, question: 'Which organelle is responsible for protein synthesis?', options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Lysosome'], correctAnswer: 2 },
          { id: 3, question: 'The cell membrane is selectively permeable.', options: ['True', 'False'], correctAnswer: 0 },
          { id: 4, question: 'What is the function of the Golgi apparatus?', options: ['Energy production', 'Protein modification and packaging', 'DNA replication', 'Cell division'], correctAnswer: 1 },
          { id: 5, question: 'Which structure contains the genetic material?', options: ['Cytoplasm', 'Cell membrane', 'Nucleus', 'Vacuole'], correctAnswer: 2 },
          { id: 6, question: 'Plant cells have cell walls while animal cells do not.', options: ['True', 'False'], correctAnswer: 0 },
          { id: 7, question: 'What is the function of lysosomes?', options: ['Photosynthesis', 'Cellular digestion', 'Protein synthesis', 'Energy storage'], correctAnswer: 1 },
          { id: 8, question: 'The endoplasmic reticulum is involved in:', options: ['Only protein synthesis', 'Only lipid synthesis', 'Both protein and lipid synthesis', 'Cell division only'], correctAnswer: 2 },
          { id: 9, question: 'Chloroplasts are found in animal cells.', options: ['True', 'False'], correctAnswer: 1 },
          { id: 10, question: 'What maintains the shape of a plant cell?', options: ['Cell membrane', 'Cytoplasm', 'Cell wall', 'Nucleus'], correctAnswer: 2 }
        ]
      });
    }
  }, [attemptId]);

  if (!result) {
    return (
      <AppLayout>
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading results...</p>
        </div>
      </AppLayout>
    );
  }

  const percentage = Math.round((result.score / result.total) * 100);
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
  const wrongAnswers = result.questions.filter(q => result.answers[q.id] !== q.correctAnswer);

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
            <div className="detail-item">
              <Clock size={20} />
              <span>{result.timeTaken || '8:32'}</span>
            </div>
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
              {wrongAnswers.slice(0, 3).map((q, index) => (
                <div key={q.id} className="weak-topic">
                  <Brain size={18} />
                  <span>Question {q.id}: {q.question.substring(0, 50)}...</span>
                </div>
              ))}
            </div>
            <Link to={`/flashcards/${result.quizId}`} className="btn btn-outline btn-full">
              <TrendingUp size={18} />
              Practice with Flashcards
            </Link>
          </div>
        )}

        {/* Questions Review */}
        <div className="questions-review">
          <h2>Question Review</h2>
          <div className="questions-list">
            {result.questions.map((question) => {
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Results;
