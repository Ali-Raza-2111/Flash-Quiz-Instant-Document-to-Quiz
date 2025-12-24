import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../../Components/Layout/AppLayout';
import { generateOneFlashcardWithAgent } from '../../services/api';
import { 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Lightbulb,
  Play,
  Loader2,
  AlertCircle,
  Upload
} from 'lucide-react';
import './Flashcards.css';

const Flashcards = () => {
  const { deckId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState([]);
  const [learningCards, setLearningCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flashcardsStarted, setFlashcardsStarted] = useState(false);
  const [flashcardCount, setFlashcardCount] = useState(5);
  const [previousFlashcards, setPreviousFlashcards] = useState([]);
  
  // Store all generated flashcards
  const [cards, setCards] = useState([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(null);

  // Check if flashcards were passed from Upload page
  useEffect(() => {
    if (location.state?.flashcards && Array.isArray(location.state.flashcards) && location.state.flashcards.length > 0) {
      setCards(location.state.flashcards);
      setCurrentFlashcard(location.state.flashcards[0]);
      setFlashcardsStarted(true);
    }
  }, []);

  // Fetch a new flashcard
  const fetchFlashcard = async () => {
    setIsLoading(true);
    setError(null);
    setIsFlipped(false);
    
    try {
      const flashcard = await generateOneFlashcardWithAgent(previousFlashcards);
      
      if (flashcard.error) {
        setError(flashcard.error);
      } else {
        // Assign ID based on current count
        flashcard.id = cards.length + 1;
        setCurrentFlashcard(flashcard);
        setCards(prev => [...prev, flashcard]);
        
        // Track generated flashcards to avoid duplicates
        if (flashcard.front) {
          setPreviousFlashcards(prev => [...prev, flashcard.front]);
        }
      }
    } catch (err) {
      console.error('Error fetching flashcard:', err);
      setError('Failed to generate flashcard. Make sure you have uploaded a document first.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start flashcards handler
  const handleStartFlashcards = () => {
    setFlashcardsStarted(true);
    fetchFlashcard();
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    // If we have more cards already generated, show them
    if (currentCardIndex < cards.length - 1) {
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);
      setCurrentFlashcard(cards[nextIndex]);
      setIsFlipped(false);
    } 
    // If we haven't reached the limit, generate a new one
    else if (cards.length < flashcardCount) {
      setCurrentCardIndex(cards.length);
      fetchFlashcard();
    }
  };

  const handlePrev = () => {
    if (currentCardIndex > 0) {
      const prevIndex = currentCardIndex - 1;
      setCurrentCardIndex(prevIndex);
      setCurrentFlashcard(cards[prevIndex]);
      setIsFlipped(false);
    }
  };

  const handleKnown = () => {
    if (currentFlashcard) {
      const cardId = currentFlashcard.id;
      if (!knownCards.includes(cardId)) {
        setKnownCards([...knownCards, cardId]);
        setLearningCards(learningCards.filter(id => id !== cardId));
      }
    }
    // Move to next card
    handleNext();
  };

  const handleLearning = () => {
    if (currentFlashcard) {
      const cardId = currentFlashcard.id;
      if (!learningCards.includes(cardId)) {
        setLearningCards([...learningCards, cardId]);
        setKnownCards(knownCards.filter(id => id !== cardId));
      }
    }
    // Move to next card
    handleNext();
  };

  const handleReset = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setKnownCards([]);
    setLearningCards([]);
    if (cards.length > 0) {
      setCurrentFlashcard(cards[0]);
    }
  };

  const handleStartOver = () => {
    setFlashcardsStarted(false);
    setCards([]);
    setCurrentFlashcard(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setKnownCards([]);
    setLearningCards([]);
    setPreviousFlashcards([]);
    setError(null);
  };

  // Calculate progress
  const progress = flashcardCount > 0 ? ((currentCardIndex + 1) / flashcardCount) * 100 : 0;
  const isLastCard = currentCardIndex >= flashcardCount - 1;
  const canGoNext = currentCardIndex < cards.length - 1 || cards.length < flashcardCount;

  // Start screen - show before flashcards are generated
  if (!flashcardsStarted) {
    return (
      <AppLayout>
        <div className="flashcards-page">
          <div className="flashcards-start-screen glass-card">
            <div className="start-icon">
              <Lightbulb size={64} />
            </div>
            <h1>Generate Flashcards</h1>
            <p>Create flashcards one at a time from your uploaded document to help you study and memorize key concepts.</p>
            
            <div className="flashcard-settings">
              <div className="setting-item">
                <label>Number of Flashcards:</label>
                <div className="count-selector">
                  <button 
                    className="count-btn"
                    onClick={() => setFlashcardCount(Math.max(3, flashcardCount - 1))}
                    disabled={flashcardCount <= 3}
                  >-</button>
                  <span className="count-value">{flashcardCount}</span>
                  <button 
                    className="count-btn"
                    onClick={() => setFlashcardCount(Math.min(15, flashcardCount + 1))}
                    disabled={flashcardCount >= 15}
                  >+</button>
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button 
              className="btn btn-primary btn-lg start-btn" 
              onClick={handleStartFlashcards}
              disabled={isLoading}
            >
              <Play size={24} />
              Start Flashcards
            </button>

            <p className="upload-hint">
              Don't have a document uploaded? <Link to="/upload">Upload one first</Link>
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Loading state while generating
  if (isLoading && !currentFlashcard) {
    return (
      <AppLayout>
        <div className="flashcards-page">
          <div className="flashcards-loading glass-card">
            <Loader2 size={48} className="spinner" />
            <h2>Generating Flashcard {currentCardIndex + 1}...</h2>
            <p>AI is creating a flashcard from your document</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state with no cards
  if (error && cards.length === 0) {
    return (
      <AppLayout>
        <div className="flashcards-page">
          <div className="flashcards-empty glass-card">
            <div className="empty-icon error">
              <AlertCircle size={64} />
            </div>
            <h2>Error</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn btn-primary" onClick={fetchFlashcard}>
                Try Again
              </button>
              <Link to="/upload" className="btn btn-secondary">
                Upload Document
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // No flashcard loaded yet
  if (!currentFlashcard) {
    return (
      <AppLayout>
        <div className="flashcards-page">
          <div className="flashcards-empty glass-card">
            <div className="empty-icon">
              <Lightbulb size={64} />
            </div>
            <h2>No Flashcard Available</h2>
            <p>Something went wrong. Please try again.</p>
            <button className="btn btn-primary btn-lg" onClick={handleStartOver}>
              Start Over
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flashcards-page">
        {/* Header */}
        <div className="flashcards-header">
          <div className="header-info">
            <h1>Flashcards</h1>
            <p>Card {currentCardIndex + 1} of {flashcardCount}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handleReset}>
              <RotateCcw size={18} />
              Reset
            </button>
            <button className="btn btn-secondary" onClick={handleStartOver}>
              New Set
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="flashcards-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-stats">
            <span className="stat known">{knownCards.length} Known</span>
            <span className="stat learning">{learningCards.length} Learning</span>
            <span className="stat remaining">
              {Math.max(0, flashcardCount - knownCards.length - learningCards.length)} Remaining
            </span>
          </div>
        </div>

        {/* Flashcard */}
        <div className="flashcard-container">
          {isLoading ? (
            <div className="flashcard-loading">
              <Loader2 size={32} className="spinner" />
              <p>Generating next flashcard...</p>
            </div>
          ) : (
            <div 
              className={`flashcard ${isFlipped ? 'flipped' : ''}`}
              onClick={handleFlip}
            >
              <div className="flashcard-inner">
                <div className="flashcard-front glass-card">
                  <span className="card-label">Question</span>
                  <p>{currentFlashcard.front}</p>
                  <span className="flip-hint">Click to reveal answer</span>
                </div>
                <div className="flashcard-back glass-card">
                  <span className="card-label">Answer</span>
                  <p>{currentFlashcard.back}</p>
                  <span className="flip-hint">Click to see question</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flashcard-actions">
          <button 
            className="action-btn learning-btn"
            onClick={handleLearning}
            disabled={isLoading}
          >
            Still Learning
          </button>
          <button 
            className="action-btn known-btn"
            onClick={handleKnown}
            disabled={isLoading}
          >
            Got It!
          </button>
        </div>

        {/* Navigation */}
        <div className="flashcard-navigation">
          <button 
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={currentCardIndex === 0 || isLoading}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="card-indicators">
            {Array.from({ length: flashcardCount }, (_, index) => (
              <button
                key={index}
                className={`indicator 
                  ${index === currentCardIndex ? 'active' : ''} 
                  ${index < cards.length && knownCards.includes(cards[index]?.id) ? 'known' : ''}
                  ${index < cards.length && learningCards.includes(cards[index]?.id) ? 'learning' : ''}
                  ${index >= cards.length ? 'pending' : ''}
                `}
                onClick={() => {
                  if (index < cards.length) {
                    setCurrentCardIndex(index);
                    setCurrentFlashcard(cards[index]);
                    setIsFlipped(false);
                  }
                }}
                disabled={index >= cards.length}
              />
            ))}
          </div>

          <button 
            className="btn btn-secondary"
            onClick={handleNext}
            disabled={!canGoNext || isLoading || (isLastCard && cards.length >= flashcardCount)}
          >
            {currentCardIndex < cards.length - 1 ? 'Next' : 'Generate Next'}
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Completion message */}
        {cards.length >= flashcardCount && currentCardIndex === flashcardCount - 1 && (
          <div className="completion-message glass-card">
            <h3>🎉 All flashcards completed!</h3>
            <p>You've gone through all {flashcardCount} flashcards. Review them again or start a new set.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Flashcards;
