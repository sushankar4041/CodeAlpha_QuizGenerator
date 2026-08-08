/**
 * Mock Quiz Results Component - Phase 14 Quizelle Premium
 * Academic completion screen with large score percentage, supporting metrics breakdown,
 * mode-specific context tags, and clear primary actions.
 */
export default function MockQuizResults({
  result,
  onReviewAnswers,
  onRetakeQuiz,
  onNewQuiz
}) {
  const { percentage, totalQuestions, correctAnswers, incorrectAnswers, unanswered, mode, modeNotice } = result;

  const getFeedback = () => {
    if (percentage >= 80) {
      return { title: 'Excellent Mastery!', desc: 'Great job! You have demonstrated a strong command of these technical concepts.' };
    }
    if (percentage >= 50) {
      return { title: 'Good Progress!', desc: 'Solid effort! Review your missed answers below to sharpen your knowledge.' };
    }
    return { title: 'Keep Practicing!', desc: 'Review your flashcard deck and retake the quiz to strengthen your recall.' };
  };

  const feedback = getFeedback();

  return (
    <div className="quiz-results-container animate-fade-in" role="region" aria-label="Mock Quiz Results">
      <div className="results-hero-card">
        <div className="concept-badge stats">
          {mode === 'weak_areas' ? 'WEAK AREAS QUIZ' : mode === 'adaptive' ? 'ADAPTIVE QUIZ' : 'QUIZ COMPLETE'}
        </div>

        <h2 className="results-title">{feedback.title}</h2>
        <p className="results-desc">{feedback.desc}</p>

        {modeNotice && (
          <div className="results-mode-notice">
            <span className="notice-icon">✨</span> {modeNotice}
          </div>
        )}

        {/* Score Circle Box */}
        <div className="results-score-box">
          <div className="score-percentage">{percentage}%</div>
          <div className="score-fraction">{correctAnswers} / {totalQuestions} Correct</div>
        </div>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="results-metrics-grid">
        <div className="metric-card metric-correct">
          <span className="metric-icon" aria-hidden="true">✓</span>
          <span className="metric-val">{correctAnswers}</span>
          <span className="metric-lbl">Correct Answers</span>
        </div>

        <div className="metric-card metric-incorrect">
          <span className="metric-icon" aria-hidden="true">✕</span>
          <span className="metric-val">{incorrectAnswers}</span>
          <span className="metric-lbl">Incorrect Answers</span>
        </div>

        <div className="metric-card metric-unanswered">
          <span className="metric-icon" aria-hidden="true">○</span>
          <span className="metric-val">{unanswered}</span>
          <span className="metric-lbl">Unanswered</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="results-actions-card">
        <button
          type="button"
          className="btn btn-primary btn-action"
          onClick={onReviewAnswers}
        >
          <span>Review Answers 🔍</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-action"
          onClick={onRetakeQuiz}
        >
          <span>Retake Quiz 🔄</span>
        </button>

        <button
          type="button"
          className="btn btn-outline btn-action"
          onClick={onNewQuiz}
        >
          <span>New Quiz Setup ⚙️</span>
        </button>
      </div>
    </div>
  );
}
