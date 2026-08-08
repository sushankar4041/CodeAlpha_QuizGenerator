/**
 * Mock Quiz Results Component - Phase 16 Quizelle Academic Polish
 * Premium "Academic Assessment + Achievement Card" completion screen.
 * Displays score centerpiece, dynamic performance metrics, quiz context metadata,
 * and prominent action controls using strictly real result data.
 */
export default function MockQuizResults({
  result,
  onReviewAnswers,
  onRetakeQuiz,
  onNewQuiz
}) {
  const {
    percentage = 0,
    totalQuestions = 0,
    correctAnswers = 0,
    incorrectAnswers = 0,
    unanswered = 0,
    category,
    difficulty,
    mode = 'standard',
    modeNotice,
    source,
    selectedCardIds
  } = result || {};

  // Neutral, academic achievement feedback based on actual percentage
  const getAcademicFeedback = () => {
    if (percentage >= 80) {
      return {
        title: 'Academic Excellence!',
        desc: 'Outstanding performance. You have demonstrated strong conceptual command across these technical topics.'
      };
    }
    if (percentage >= 50) {
      return {
        title: 'Good Technical Progress!',
        desc: 'Solid effort. Review your missed questions below to solidify your understanding and sharpen recall.'
      };
    }
    return {
      title: 'Assessment Complete',
      desc: 'Practice session completed. Focus review on weak areas and retake the quiz to strengthen topic mastery.'
    };
  };

  const feedback = getAcademicFeedback();

  // Mode label formatting
  const getModeLabel = () => {
    if (mode === 'weak_areas') return 'Weak Areas Practice';
    if (mode === 'adaptive') return 'Quizelle Adaptive Engine';
    return 'Standard Assessment';
  };

  // Source label formatting
  const getSourceLabel = () => {
    if (source === 'selected' || (Array.isArray(selectedCardIds) && selectedCardIds.length > 0)) {
      const count = Array.isArray(selectedCardIds) ? selectedCardIds.length : totalQuestions;
      return `Selected Flashcards (${count})`;
    }
    if (source === 'flashcards') return 'Personal Flashcard Collection';
    return 'Quizelle System Question Bank';
  };

  return (
    <div className="quiz-results-container animate-fade-in" role="region" aria-label="Academic Assessment Results">
      {/* 1. Score Hero & Achievement Centerpiece */}
      <div className="academic-results-hero">
        <div className="academic-hero-header">
          <div className="concept-badge stats">🎓 Academic Assessment Report</div>
          <h2 className="results-title">{feedback.title}</h2>
          <p className="results-desc">{feedback.desc}</p>
        </div>

        {/* Large Score Achievement Box */}
        <div className="academic-score-card">
          <div className="score-laurel-badge" aria-hidden="true">🏆 VERIFIED ASSESSMENT</div>
          <div className="score-percentage-main">{percentage}%</div>
          <div className="score-fraction-sub">
            <strong>{correctAnswers}</strong> of <strong>{totalQuestions}</strong> Correct
          </div>

          <div className="hero-mode-pill">
            <span className="pill-icon" aria-hidden="true">
              {mode === 'weak_areas' ? '⚠️' : mode === 'adaptive' ? '⚡' : '🎯'}
            </span>
            <span>{getModeLabel()}</span>
          </div>

          {modeNotice && (
            <div className="hero-mode-notice">
              <span className="notice-icon" aria-hidden="true">✨</span> {modeNotice}
            </div>
          )}
        </div>
      </div>

      {/* 2. Performance Metrics Breakdown Grid */}
      <div className="results-metrics-grid">
        <div className="metric-card metric-correct">
          <span className="metric-icon" aria-hidden="true">✓</span>
          <div className="metric-info">
            <span className="metric-val">{correctAnswers}</span>
            <span className="metric-lbl">Correct Answer{correctAnswers === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className="metric-card metric-incorrect">
          <span className="metric-icon" aria-hidden="true">✕</span>
          <div className="metric-info">
            <span className="metric-val">{incorrectAnswers}</span>
            <span className="metric-lbl">Incorrect Answer{incorrectAnswers === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className="metric-card metric-unanswered">
          <span className="metric-icon" aria-hidden="true">○</span>
          <div className="metric-info">
            <span className="metric-val">{unanswered}</span>
            <span className="metric-lbl">Unanswered</span>
          </div>
        </div>

        <div className="metric-card metric-total">
          <span className="metric-icon" aria-hidden="true">🎯</span>
          <div className="metric-info">
            <span className="metric-val">{totalQuestions}</span>
            <span className="metric-lbl">Total Question{totalQuestions === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      {/* 3. Quiz Context & Parameters Card */}
      <div className="results-context-card">
        <h3 className="context-card-title">Assessment Context & Parameters</h3>
        <div className="context-fields-grid">
          {category && (
            <div className="context-field">
              <span className="context-lbl">Subject / Category</span>
              <span className="context-val">{category}</span>
            </div>
          )}

          <div className="context-field">
            <span className="context-lbl">Assessment Mode</span>
            <span className="context-val">{getModeLabel()}</span>
          </div>

          <div className="context-field">
            <span className="context-lbl">Question Source</span>
            <span className="context-val">{getSourceLabel()}</span>
          </div>

          {mode === 'standard' && difficulty && difficulty !== 'All Difficulties' && (
            <div className="context-field">
              <span className="context-lbl">Target Difficulty</span>
              <span className="context-val">{difficulty}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Action Controls Bar */}
      <div className="results-actions-card">
        <button
          type="button"
          className="btn btn-primary btn-action btn-review-primary"
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
