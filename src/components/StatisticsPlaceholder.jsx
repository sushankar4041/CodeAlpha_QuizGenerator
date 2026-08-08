/**
 * Statistics Placeholder Component
 * Demonstrates the planned Analytics & Progress Tracking interface
 */
export default function StatisticsPlaceholder({ onNavigateToFlashcards, flashcardsCount }) {
  return (
    <div className="concept-placeholder-container">
      <div className="concept-banner statistics-banner">
        <div className="concept-badge stats">Performance & Insights</div>
        <h2 className="concept-title">Statistics Overview</h2>
        <p className="concept-description">
          Monitor your flashcard mastery, mock quiz scores, accuracy percentages, and study streaks in one central dashboard.
        </p>
        <span className="phase-tag">Phase 5 Feature • Analytics Engine Planned</span>
      </div>

      <div className="stats-preview-grid">
        <div className="stat-preview-card">
          <div className="stat-preview-icon">📚</div>
          <div className="stat-preview-val">{flashcardsCount}</div>
          <div className="stat-preview-lbl">Total Flashcards in Deck</div>
        </div>

        <div className="stat-preview-card">
          <div className="stat-preview-icon">🎯</div>
          <div className="stat-preview-val">0</div>
          <div className="stat-preview-lbl">Quizzes Completed</div>
        </div>

        <div className="stat-preview-card">
          <div className="stat-preview-icon">📖</div>
          <div className="stat-preview-val">0</div>
          <div className="stat-preview-lbl">Cards Studied</div>
        </div>

        <div className="stat-preview-card">
          <div className="stat-preview-icon">🏆</div>
          <div className="stat-preview-val">0%</div>
          <div className="stat-preview-lbl">Overall Accuracy Rate</div>
        </div>
      </div>

      <div className="concept-action-box">
        <div className="concept-status-info">
          <span className="status-icon">📊</span>
          <div>
            <h4>Truthful Initial State</h4>
            <p>Real-time analytics, charts, and performance breakdown will record your progress as you study and take quizzes in upcoming phases.</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNavigateToFlashcards}
        >
          <span>Open Flashcard Deck</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
