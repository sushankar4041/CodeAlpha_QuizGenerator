import { useState } from 'react';
import ProgressBar from './ProgressBar';
import { getDifficultyBadgeClass, getCategoryIcon } from '../utils/quizUtils';

/**
 * Mock Quiz Session Component
 * Active quiz-taking interface with multiple-choice options, answer state tracking,
 * Prev/Next navigation, and unanswered submission warning modal.
 */
export default function MockQuizSession({
  questions = [],
  userAnswers = {},
  onSelectAnswer,
  onSubmitQuiz
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUnansweredModal, setShowUnansweredModal] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = userAnswers[currentQuestion?.quizQuestionId];

  // Calculate unanswered count
  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleAttemptSubmit = () => {
    if (unansweredCount > 0) {
      setShowUnansweredModal(true);
    } else {
      onSubmitQuiz();
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="quiz-session-container animate-fade-in">
      {/* Session Progress Header */}
      <div className="session-progress-card">
        <div className="session-meta-flex">
          <span className="question-counter-label">
            Question <strong>{currentIndex + 1}</strong> of <strong>{totalQuestions}</strong>
          </span>
          <span className="session-answered-status">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>
        <ProgressBar value={currentIndex + 1} max={totalQuestions} />
      </div>

      {/* Main Question Card */}
      <div className="quiz-question-card">
        <div className="question-card-header">
          <div className="card-category-tag">
            <span className="cat-emoji">{getCategoryIcon(currentQuestion.category)}</span>
            <span className="cat-text">{currentQuestion.category}</span>
          </div>
          <span className={`badge ${getDifficultyBadgeClass(currentQuestion.difficulty)}`}>
            {currentQuestion.difficulty}
          </span>
        </div>

        <h3 className="quiz-question-text">{currentQuestion.question}</h3>

        {/* Multiple-Choice Option Buttons */}
        <div className="quiz-options-group" role="radiogroup" aria-label="Answer options">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D

            return (
              <button
                key={`${currentQuestion.quizQuestionId}-opt-${idx}`}
                type="button"
                className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectAnswer(currentQuestion.quizQuestionId, option)}
                aria-checked={isSelected}
                role="radio"
              >
                <span className="option-letter">{optionLetter}</span>
                <span className="option-text">{option}</span>
                {isSelected && <span className="option-check-icon">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Session Navigation Footer */}
      <div className="session-nav-bar">
        <button
          type="button"
          className="btn btn-secondary nav-btn"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>

        {currentIndex === totalQuestions - 1 ? (
          <button
            type="button"
            className="btn btn-primary nav-btn submit-btn"
            onClick={handleAttemptSubmit}
          >
            Submit Quiz 🏁
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary nav-btn"
            onClick={handleNext}
          >
            Next →
          </button>
        )}
      </div>

      {/* Unanswered Questions Confirmation Modal */}
      {showUnansweredModal && (
        <div className="modal-backdrop" onClick={() => setShowUnansweredModal(false)}>
          <div
            className="modal-container animate-fade-in warning-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="warning-modal-title"
          >
            <div className="modal-header">
              <h3 id="warning-modal-title" className="modal-title">
                Unanswered Questions Warning ⚠️
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowUnansweredModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="warning-modal-body">
              <p className="warning-text">
                You have <strong>{unansweredCount}</strong> unanswered question{unansweredCount === 1 ? '' : 's'}. Are you sure you want to submit your quiz now?
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowUnansweredModal(false)}
              >
                Return to Quiz
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowUnansweredModal(false);
                  onSubmitQuiz();
                }}
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
