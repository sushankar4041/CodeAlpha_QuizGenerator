/**
 * Live Quiz Placeholder Component
 * Communicates the Live Quiz (Real-Time Multiplayer Competition) product concept
 */
export default function LiveQuizPlaceholder({ onNavigateToFlashcards }) {
  return (
    <div className="concept-placeholder-container">
      <div className="concept-banner live-quiz-banner">
        <div className="concept-badge competition">Real-Time Multiplayer</div>
        <h2 className="concept-title">Live Quiz Challenge</h2>
        <p className="concept-description">
          Host a quiz session or join with a room code to compete live against classmates and peers in real-time.
        </p>
        <span className="phase-tag">Phase 4 Feature • Realtime Infrastructure Planned</span>
      </div>

      <div className="live-modes-grid">
        <div className="live-mode-card">
          <div className="mode-icon">👑</div>
          <h3 className="mode-title">Host a Live Session</h3>
          <p className="mode-desc">
            Create a custom multiplayer room, configure the question set, and get a 6-digit join code for your participants.
          </p>
          <div className="room-code-preview">
            <span>Sample Room Code:</span>
            <strong>QZ-8492</strong>
          </div>
          <button type="button" className="btn btn-secondary disabled" disabled>
            Host Room (Phase 4)
          </button>
        </div>

        <div className="live-mode-card">
          <div className="mode-icon">🎮</div>
          <h3 className="mode-title">Join a Room</h3>
          <p className="mode-desc">
            Enter a host&apos;s 6-digit room code to join the lobby, answer synchronized questions, and compete on the live leaderboard.
          </p>
          <div className="room-input-preview">
            <input type="text" placeholder="Enter Room Code (e.g. QZ-1234)" disabled />
          </div>
          <button type="button" className="btn btn-secondary disabled" disabled>
            Join Lobby (Phase 4)
          </button>
        </div>
      </div>

      <div className="concept-action-box">
        <div className="concept-status-info">
          <span className="status-icon">🚀</span>
          <div>
            <h4>Real-time Multiplayer Architecture</h4>
            <p>Live synchronized questions and leaderboard scoring will be established in Phase 4.</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNavigateToFlashcards}
        >
          <span>Return to Flashcards</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
