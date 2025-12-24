import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../../Components/Layout/AppLayout';
import { generateFlashcardsWithAgent } from '../../services/api';
import { 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Lightbulb,
  Volume2,
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
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState([]);
  const [learningCards, setLearningCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flashcardsStarted, setFlashcardsStarted] = useState(false);
  const [flashcardCount, setFlashcardCount] = useState(5);

  // Get deck from location state or initialize as null
  const [deck, setDeck] = useState(() => {
    if (location.state?.flashcards && Array.isArray(location.state.flashcards) && location.state.flashcards.length > 0) {
      return {
        id: 'generated',
        title: 'Generated Flashcards',
        cards: location.state.flashcards
      };
    }
    return null;
  });

  // Auto-start if flashcards were passed from Upload page
  useEffect(() => {
    if (deck && deck.cards.length > 0) {
      setFlashcardsStarted(true);
    }
  }, []);

  // Generate flashcards handler
  const handleGenerateFlashcards = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateFlashcardsWithAgent(flashcardCount);
      
      if (result.error) {
        setError(result.error);
      } else if (result.flashcards && result.flashcards.length > 0) {
        setDeck({
          id: 'generated',
          title: 'Generated Flashcards',
          cards: result.flashcards
        });
        setFlashcardsStarted(true);
      } else {
        setError('No flashcards were generated. Please try again.');
      }
    } catch (err) {
      console.error('Error generating flashcards:', err);
      setError('Failed to generate flashcards. Make sure you have uploaded a document first.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start screen - show before flashcards are generated
  if (!flashcardsStarted && !deck) {
    return (
      <AppLayout>
        <div className="flashcards-page">
          <div className="flashcards-start-screen glass-card">
            <div className="start-icon">
              <Lightbulb size={64} />
            </div>
            <h1>Generate Flashcards</h1>
            <p>Create flashcards from your uploaded document to help you study and memorize key concepts.</p>
            
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
              onClick={handleGenerateFlashcards}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={24} className="spinner" />
                  Generating...
                </>
              ) : (
                <>
                  <Play size={24} />
                  Generate Flashcards
                </>
              )}
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
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flashcards-page">
          <div className="flashcards-loading glass-card">
            <Loader2 size={48} className="spinner" />
            <h2>Generating Flashcards...</h2>
            <p>AI is creating flashcards from your document</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error && !deck) {
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
              <button className="btn btn-primary" onClick={handleGenerateFlashcards}>
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

  // No deck available
  if (!deck || !deck.cards || deck.cards.length === 0) {
    return (
      <AppLayout>
        <div className="flashcards-page">
          <div className="flashcards-empty glass-card">
            <div className="empty-icon">
              <Lightbulb size={64} />
            </div>
            <h2>No Flashcards Available</h2>
            <p>Upload a document and generate flashcards to start studying.</p>
            <Link to="/upload" className="btn btn-primary btn-lg">
              <Upload size={20} />
              Go to Upload
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCard < deck.cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  const handleKnown = () => {
    const cardId = deck.cards[currentCard].id;
    if (!knownCards.includes(cardId)) {
      setKnownCards([...knownCards, cardId]);
      setLearningCards(learningCards.filter(id => id !== cardId));
    }
    if (currentCard < deck.cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handleLearning = () => {
    const cardId = deck.cards[currentCard].id;
    if (!learningCards.includes(cardId)) {
      setLearningCards([...learningCards, cardId]);
      setKnownCards(knownCards.filter(id => id !== cardId));
    }
    if (currentCard < deck.cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentCard(0);
    setIsFlipped(false);
    setKnownCards([]);
    setLearningCards([]);
  };

  const currentFlashcard = deck.cards[currentCard];
  const progress = ((currentCard + 1) / deck.cards.length) * 100;

  return (
    <AppLayout>
      <div className="flashcards-page">
        {/* Header */}
        <div className="flashcards-header">
          <div className="header-info">
            <h1>{deck.title}</h1>
            <p>Card {currentCard + 1} of {deck.cards.length}</p>
          </div>
          <button className="btn btn-secondary" onClick={handleReset}>
            <RotateCcw size={18} />
            Reset
          </button>
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
              {deck.cards.length - knownCards.length - learningCards.length} Remaining
            </span>
          </div>
        </div>

        {/* Flashcard */}
        <div className="flashcard-container">
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
        </div>

        {/* Actions */}
        <div className="flashcard-actions">
          <button 
            className="action-btn learning-btn"
            onClick={handleLearning}
          >
            Still Learning
          </button>
          <button 
            className="action-btn known-btn"
            onClick={handleKnown}
          >
            Got It!
          </button>
        </div>

        {/* Navigation */}
        <div className="flashcard-navigation">
          <button 
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={currentCard === 0}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="card-indicators">
            {deck.cards.map((card, index) => (
              <button
                key={card.id}
                className={`indicator 
                  ${index === currentCard ? 'active' : ''} 
                  ${knownCards.includes(card.id) ? 'known' : ''}
                  ${learningCards.includes(card.id) ? 'learning' : ''}
                `}
                onClick={() => {
                  setCurrentCard(index);
                  setIsFlipped(false);
                }}
              />
            ))}
          </div>

          <button 
            className="btn btn-secondary"
            onClick={handleNext}
            disabled={currentCard === deck.cards.length - 1}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Flashcards;
