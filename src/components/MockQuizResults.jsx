/**
 * Mock Quiz Results Component
 * Displays score summary, metrics breakdown, performance feedback, and action triggers
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
      return { title: 'Excellent Mastery! 🌟', desc: 'Great job! You have a strong grasp of these concepts.' };
    }
    if (percentage >= 50) {
      return { title: 'Good Practice! 👍', desc: 'Solid effort! Review your missed answers to sharpen your knowledge.' };
    }
    return { title: 'Keep Practicing! 💪', desc: 'Don\'t worry! Review your flashcards and try taking the quiz again.' };
  };

  const feedback = getFeedback();

  return (
    <div className="quiz-results-container animate-fade-in">
      <div className="results-hero-card">
        <div className="concept-badge">Quiz Complete</div>
        <h2 className="results-title">{feedback.title}</h2>
        <p className="results-desc">{feedback.desc}</p>

        {/* Score Radial Box */}
        <div className="results-score-box">
          <div className="score-percentage">{percentage}%</div>
          <div className="score-fraction">{correctAnswers} / {totalQuestions} Correct</div>
        </div>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="results-metrics-grid">
        <div className="metric-card metric-correct">
          <span className="metric-icon">✅</span>
          <span className="metric-val">{correctAnswers}</span>
          <span className="metric-lbl">Correct Answers</span>
        </div>

        <div className="metric-card metric-incorrect">
          <span className="metric-icon">❌</span>
          <span className="metric-val">{incorrectAnswers}</span>
          <span className="metric-lbl">Incorrect Answers</span>
        </div>

        <div className="metric-card metric-unanswered">
          <span className="metric-icon">⚪</span>
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
