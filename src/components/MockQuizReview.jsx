import { getDifficultyBadgeClass, getCategoryIcon } from '../utils/quizUtils';

/**
 * Mock Quiz Review Component
 * Displays detailed question-by-question breakdown showing user selections vs correct answers
 */
export default function MockQuizReview({ questions = [], userAnswers = {}, onBackToResults, onNewQuiz }) {
  return (
    <div className="quiz-review-container animate-fade-in">
      <div className="review-header-card">
        <div className="review-header-flex">
          <div>
            <h2 className="review-title">Answer Review 🔍</h2>
            <p className="review-subtitle">
              Review your responses alongside the correct answers.
            </p>
          </div>
          <div className="review-actions-top">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBackToResults}
            >
              ← Back to Results
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNewQuiz}
            >
              New Quiz ⚙️
            </button>
          </div>
        </div>
      </div>

      <div className="review-questions-list">
        {questions.map((q, idx) => {
          const userAnswer = userAnswers[q.quizQuestionId];
          const isAnswered = Boolean(userAnswer);
          const isCorrect = isAnswered && userAnswer === q.correctAnswer;

          return (
            <div
              key={q.quizQuestionId}
              className={`review-item-card ${
                !isAnswered ? 'review-unanswered' : isCorrect ? 'review-correct' : 'review-incorrect'
              }`}
            >
              <div className="review-item-header">
                <span className="review-question-num">Question {idx + 1}</span>
                <div className="review-meta-tags">
                  <span className="cat-badge">
                    {getCategoryIcon(q.category)} {q.category}
                  </span>
                  <span className={`badge ${getDifficultyBadgeClass(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                  {isCorrect ? (
                    <span className="badge badge-easy">✓ Correct</span>
                  ) : !isAnswered ? (
                    <span className="badge badge-disabled">⚪ Unanswered</span>
                  ) : (
                    <span className="badge badge-hard">✕ Incorrect</span>
                  )}
                </div>
              </div>

              <h4 className="review-question-text">{q.question}</h4>

              <div className="review-answers-grid">
                <div className={`answer-box user-box ${isCorrect ? 'box-correct' : isAnswered ? 'box-incorrect' : 'box-unanswered'}`}>
                  <span className="box-label">YOUR ANSWER:</span>
                  <p className="box-val">{isAnswered ? userAnswer : 'Not answered'}</p>
                </div>

                {(!isCorrect || !isAnswered) && (
                  <div className="answer-box correct-box">
                    <span className="box-label">CORRECT ANSWER:</span>
                    <p className="box-val">{q.correctAnswer}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
