import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import AppLayout from '../../Components/Layout/AppLayout';
import { 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Lightbulb,
  Volume2
} from 'lucide-react';
import './Flashcards.css';

const Flashcards = () => {
  const { deckId } = useParams();
  const location = useLocation();
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState([]);
  const [learningCards, setLearningCards] = useState([]);

  // Get deck from location state or use sample/loading
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

  /*
  // Sample flashcard data
  const deck = {
    id: deckId,
    title: 'Biology - Cell Structure',
    cards: [
      // ...
    ]
  };
  */

  if (!deck) {
      return (
          <AppLayout>
              <div className="flashcards-page">
                  <div className="flashcards-empty glass-card">
                      <div className="empty-icon">
                        <Lightbulb size={64} />
                      </div>
                      <h2>No Flashcards Found</h2>
                      <p>Upload a document and enable flashcard generation to create flashcards.</p>
                      <Link to="/upload" className="btn btn-primary btn-lg">
                        Go to Upload
                      </Link>
                  </div>
              </div>
          </AppLayout>
      )
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
