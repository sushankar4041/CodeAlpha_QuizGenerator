import { useState } from 'react';
import { getDifficultyBadgeClass, getCategoryIcon } from '../utils/quizUtils';

/**
 * Flashcard Component
 * Renders an individual flashcard with question, category, difficulty, and interactive answer toggle
 */
export default function Flashcard({ card }) {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const toggleReveal = () => {
    setIsAnswerRevealed((prev) => !prev);
  };

  return (
    <div className={`flashcard ${isAnswerRevealed ? 'is-revealed' : ''}`}>
      {/* Top Meta Bar */}
      <div className="flashcard-header">
        <div className="flashcard-category">
          <span className="category-emoji">{getCategoryIcon(card.category)}</span>
          <span className="category-name">{card.category}</span>
        </div>
        <span className={`badge ${getDifficultyBadgeClass(card.difficulty)}`}>
          {card.difficulty}
        </span>
      </div>

      {/* Main Flashcard Content Body */}
      <div className="flashcard-body">
        <div className="card-side question-side">
          <span className="side-label">QUESTION</span>
          <h3 className="card-question">{card.question}</h3>
        </div>

        {isAnswerRevealed && (
          <div className="card-side answer-side animate-fade-in">
            <span className="side-label answer-label">ANSWER</span>
            <p className="card-answer">{card.answer}</p>
          </div>
        )}
      </div>

      {/* Footer Action Area */}
      <div className="flashcard-footer">
        <button
          type="button"
          className={`btn-toggle-answer ${isAnswerRevealed ? 'revealed' : ''}`}
          onClick={toggleReveal}
          aria-expanded={isAnswerRevealed}
          aria-label={isAnswerRevealed ? 'Hide Answer' : 'Show Answer'}
        >
          <span>{isAnswerRevealed ? 'Hide Answer 👁️‍🗨️' : 'Show Answer 👁️'}</span>
        </button>
      </div>
    </div>
  );
}
