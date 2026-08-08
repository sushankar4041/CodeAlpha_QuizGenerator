import { useState, useEffect } from 'react';
import { getDifficultyBadgeClass, getCategoryIcon } from '../utils/quizUtils';

/**
 * Flashcard Component - Phase 7 Quizelle Golden Premium
 * Features tactile 3D Y-axis card flip interaction, study tracking,
 * and post-reveal review feedback actions ("NEEDS REVIEW" & "GOT IT").
 */
export default function Flashcard({ card, isSelected, onToggleSelect, isSelectionMode, onEdit, onDelete, onStudy }) {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [studyStatus, setStudyStatus] = useState(null); // 'needs_review' | 'got_it'

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

  const handleStudyFeedback = (status) => {
    setStudyStatus(status);
    if (onStudy) {
      onStudy(card.id);
    }
  };

  const handleConfirmDelete = () => {
    onDelete(card.id);
    setIsDeleting(false);
  };

  return (
    <div className={`flashcard-3d-wrapper ${isAnswerRevealed ? 'is-flipped' : ''} ${isSelected ? 'is-selected' : ''}`}>
      <div className={`flashcard ${isAnswerRevealed ? 'is-revealed' : ''}`}>
        {/* Top Meta Bar */}
        <div className="flashcard-header">
          <div className="flashcard-category">
            {isSelectionMode && (
              <input
                type="checkbox"
                className="card-select-checkbox"
                checked={!!isSelected}
                onChange={() => onToggleSelect && onToggleSelect(card.id)}
                aria-label={`Select flashcard ${card.question}`}
              />
            )}
            <span className="category-emoji" aria-hidden="true">{getCategoryIcon(card.category)}</span>
            <span className="category-name">{card.category}</span>
          </div>
          <div className="flashcard-meta-right">
            {studyStatus === 'got_it' && <span className="badge badge-easy">✓ Got It</span>}
            {studyStatus === 'needs_review' && <span className="badge badge-medium">⚠️ Review</span>}
            {card.personalizedDifficulty && card.difficultyStats?.attempts >= 1 && (
              <span
                className={`badge badge-subtle ${getDifficultyBadgeClass(card.personalizedDifficulty)}`}
                title={`Your Personalized Difficulty: ${card.personalizedDifficulty} (${card.difficultyStats.correct}/${card.difficultyStats.attempts} correct)`}
              >
                Your: {card.personalizedDifficulty}
              </span>
            )}
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

              {/* Quizelle Post-Reveal Review Actions */}
              <div className="review-feedback-actions">
                <button
                  type="button"
                  className={`btn btn-needs-review ${studyStatus === 'needs_review' ? 'active' : ''}`}
                  onClick={() => handleStudyFeedback('needs_review')}
                  aria-label="Mark flashcard as Needs Review"
                >
                  ⚠️ Needs Review
                </button>
                <button
                  type="button"
                  className={`btn btn-got-it ${studyStatus === 'got_it' ? 'active' : ''}`}
                  onClick={() => handleStudyFeedback('got_it')}
                  aria-label="Mark flashcard as Got It"
                >
                  ✓ Got It
                </button>
              </div>
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
              <span>{isAnswerRevealed ? 'Hide Answer 👁️‍🗨️' : 'Flip to Reveal Answer 👁️'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
