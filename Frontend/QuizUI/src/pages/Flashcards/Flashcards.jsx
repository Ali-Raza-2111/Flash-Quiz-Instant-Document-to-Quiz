import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState([]);
  const [learningCards, setLearningCards] = useState([]);

  // Sample flashcard data
  const deck = {
    id: deckId,
    title: 'Biology - Cell Structure',
    cards: [
      {
        id: 1,
        front: 'What is the function of mitochondria?',
        back: 'Mitochondria are the powerhouses of the cell, responsible for producing ATP through cellular respiration.'
      },
      {
        id: 2,
        front: 'What is the cell membrane made of?',
        back: 'The cell membrane is made of a phospholipid bilayer with embedded proteins, forming a selectively permeable barrier.'
      },
      {
        id: 3,
        front: 'What is the nucleus?',
        back: 'The nucleus is the control center of the cell, containing DNA and coordinating cell activities including growth, metabolism, and reproduction.'
      },
      {
        id: 4,
        front: 'What are ribosomes?',
        back: 'Ribosomes are cellular structures responsible for protein synthesis. They can be found free in the cytoplasm or attached to the endoplasmic reticulum.'
      },
      {
        id: 5,
        front: 'What is the function of the Golgi apparatus?',
        back: 'The Golgi apparatus modifies, packages, and ships proteins and lipids to their destinations inside or outside the cell.'
      }
    ]
  };

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
