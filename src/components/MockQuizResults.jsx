/**
 * Mock Quiz Results Component - Phase 7B Quizelle
 * Premium academic completion screen with large score percentage, supporting metrics breakdown,
 * and primary actions (Review Answers, Retake Quiz, New Quiz Setup).
 */
export default function MockQuizResults({
  result,
  onReviewAnswers,
  onRetakeQuiz,
  onNewQuiz
}) {
  const { percentage, totalQuestions, correctAnswers, incorrectAnswers, unanswered } = result;

  const getFeedback = () => {
    if (percentage >= 80) {
      return { title: 'Excellent Mastery! 🌟', desc: 'Great job! You have demonstrated a strong command of these technical concepts.' };
    }
    if (percentage >= 50) {
      return { title: 'Good Practice! 👍', desc: 'Solid effort! Review your missed answers below to sharpen your knowledge.' };
    }
    return { title: 'Keep Practicing! 💪', desc: 'Don\'t worry! Review your flashcard deck and take the practice quiz again.' };
  };

  const feedback = getFeedback();

  return (
    <div className="quiz-results-container animate-fade-in" role="region" aria-label="Mock Quiz Results">
      <div className="results-hero-card">
        <div className="concept-badge stats">QUIZ COMPLETE</div>
        <h2 className="results-title">{feedback.title}</h2>
        <p className="results-desc">{feedback.desc}</p>

        {/* Score Amber Circle Box */}
        <div className="results-score-box">
          <div className="score-percentage">{percentage}%</div>
          <div className="score-fraction">{correctAnswers} / {totalQuestions} Correct</div>
        </div>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="results-metrics-grid">
        <div className="metric-card metric-correct">
          <span className="metric-icon" aria-hidden="true">✅</span>
          <span className="metric-val">{correctAnswers}</span>
          <span className="metric-lbl">Correct Answers</span>
        </div>

        <div className="metric-card metric-incorrect">
          <span className="metric-icon" aria-hidden="true">❌</span>
          <span className="metric-val">{incorrectAnswers}</span>
          <span className="metric-lbl">Incorrect Answers</span>
        </div>

        <div className="metric-card metric-unanswered">
          <span className="metric-icon" aria-hidden="true">⚪</span>
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
