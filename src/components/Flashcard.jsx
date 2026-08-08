import { useState, useEffect } from 'react';
import { getDifficultyBadgeClass, getCategoryIcon } from '../utils/quizUtils';

/**
 * Flashcard Component - Phase 6E
 * Displays an individual flashcard with interactive answer reveal, study tracking,
 * keyboard accessibility, and inline edit/delete action triggers.
 */
export default function Flashcard({ card, onEdit, onDelete, onStudy }) {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Escape key handler to cancel inline deletion mode
  useEffect(() => {
    if (!isDeleting) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDeleting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeleting]);

  const toggleReveal = () => {
    setIsAnswerRevealed((prev) => {
      const nextState = !prev;
      if (nextState && onStudy) {
        onStudy(card.id);
      }
      return nextState;
    });
  };

  const handleConfirmDelete = () => {
    onDelete(card.id);
    setIsDeleting(false);
  };

  return (
    <div className={`flashcard ${isAnswerRevealed ? 'is-revealed' : ''}`}>
      {/* Top Meta Bar */}
      <div className="flashcard-header">
        <div className="flashcard-category">
          <span className="category-emoji" aria-hidden="true">{getCategoryIcon(card.category)}</span>
          <span className="category-name">{card.category}</span>
        </div>
        <div className="flashcard-meta-right">
          <span className={`badge ${getDifficultyBadgeClass(card.difficulty)}`}>
            {card.difficulty}
          </span>
        </div>
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

      {/* Delete Confirmation Overlay */}
      {isDeleting ? (
        <div className="delete-confirm-box animate-fade-in" role="region" aria-label="Confirm flashcard deletion">
          <span className="delete-confirm-msg">Delete this card?</span>
          <div className="delete-confirm-actions">
            <button
              type="button"
              className="btn btn-danger-sm"
              onClick={handleConfirmDelete}
            >
              Yes, Delete
            </button>
            <button
              type="button"
              className="btn btn-secondary-sm"
              onClick={() => setIsDeleting(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Footer Action Area */
        <div className="flashcard-footer">
          <div className="card-manage-actions">
            {onEdit && (
              <button
                type="button"
                className="btn-card-action edit-action"
                onClick={() => onEdit(card)}
                title="Edit flashcard"
                aria-label={`Edit flashcard: ${card.question}`}
              >
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="btn-card-action delete-action"
                onClick={() => setIsDeleting(true)}
                title="Delete flashcard"
                aria-label={`Delete flashcard: ${card.question}`}
              >
                🗑️ Delete
              </button>
            )}
          </div>

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
      )}
    </div>
  );
}
