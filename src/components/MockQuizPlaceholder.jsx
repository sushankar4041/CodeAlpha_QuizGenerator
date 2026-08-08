/**
 * Mock Quiz Placeholder Component
 * Communicates the Mock Quiz (Self-Assessment) product concept & future flow
 */
export default function MockQuizPlaceholder({ onNavigateToFlashcards }) {
  return (
    <div className="concept-placeholder-container">
      <div className="concept-banner mock-quiz-banner">
        <div className="concept-badge">Self-Assessment Mode</div>
        <h2 className="concept-title">Mock Quiz Generator</h2>
        <p className="concept-description">
          Test yourself with an interactive, timed solo quiz generated automatically by the application. Select your preferred parameters below to preview how Mock Quiz will work.
        </p>
        <span className="phase-tag">Phase 3 Feature • Under Architecture</span>
      </div>

      <div className="concept-preview-grid">
        <div className="preview-card">
          <h3 className="preview-card-title">1. Select Category / Topic</h3>
          <div className="preview-options-row">
            <span className="preview-chip active">All Categories</span>
            <span className="preview-chip">JavaScript</span>
            <span className="preview-chip">React</span>
            <span className="preview-chip">DBMS</span>
          </div>
        </div>

        <div className="preview-card">
          <h3 className="preview-card-title">2. Choose Difficulty</h3>
          <div className="preview-options-row">
            <span className="preview-chip">Easy</span>
            <span className="preview-chip active">Medium</span>
            <span className="preview-chip">Hard</span>
          </div>
        </div>

        <div className="preview-card">
          <h3 className="preview-card-title">3. Question Count</h3>
          <div className="preview-options-row">
            <span className="preview-chip">5 Questions</span>
            <span className="preview-chip active">10 Questions</span>
            <span className="preview-chip">20 Questions</span>
          </div>
        </div>
      </div>

      <div className="concept-action-box">
        <div className="concept-status-info">
          <span className="status-icon">⚙️</span>
          <div>
            <h4>Mock Quiz Engine Coming Soon</h4>
            <p>In Phase 3, the application will compile questions from your flashcard deck into auto-graded quizzes with instant feedback.</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNavigateToFlashcards}
        >
          <span>Study Flashcards Deck Instead</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
