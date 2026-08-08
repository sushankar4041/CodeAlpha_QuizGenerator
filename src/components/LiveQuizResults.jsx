/**
 * Live Quiz Results & Podium Component - Phase 7B QuizForge
 * Displays Gold/Silver/Bronze podium standings and final multiplayer score rankings.
 */
export default function LiveQuizResults({ roomData, localPlayerId, onReturnHome }) {
  if (!roomData) return null;

  const playersList = Object.values(roomData.players || {}).sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  const firstPlace = playersList[0];
  const secondPlace = playersList[1];
  const thirdPlace = playersList[2];

  return (
    <div className="live-results-container animate-fade-in" role="region" aria-label="Tournament Leaderboard Results">
      <div className="results-hero-card">
        <div className="concept-badge competition">Multiplayer Match Complete</div>
        <h2 className="results-title">Tournament Leaderboard</h2>
        <p className="results-desc">
          Congratulations to all participants in live room <strong>{roomData.roomCode}</strong>!
        </p>
      </div>

      {/* Podium Cards Grid */}
      <div className="podium-grid">
        {/* 2nd Place */}
        {secondPlace ? (
          <div className="podium-card silver">
            <div className="podium-badge">🥈 2nd Place</div>
            <div className="podium-avatar">{secondPlace.displayName.charAt(0).toUpperCase()}</div>
            <h4 className="podium-name">{secondPlace.displayName}</h4>
            <span className="podium-score">{secondPlace.score || 0} pts</span>
          </div>
        ) : (
          <div className="podium-card empty-podium" />
        )}

        {/* 1st Place */}
        {firstPlace && (
          <div className="podium-card gold">
            <div className="podium-badge">🥇 WINNER</div>
            <div className="podium-avatar">{firstPlace.displayName.charAt(0).toUpperCase()}</div>
            <h4 className="podium-name">{firstPlace.displayName}</h4>
            <span className="podium-score">{firstPlace.score || 0} pts</span>
          </div>
        )}

        {/* 3rd Place */}
        {thirdPlace ? (
          <div className="podium-card bronze">
            <div className="podium-badge">🥉 3rd Place</div>
            <div className="podium-avatar">{thirdPlace.displayName.charAt(0).toUpperCase()}</div>
            <h4 className="podium-name">{thirdPlace.displayName}</h4>
            <span className="podium-score">{thirdPlace.score || 0} pts</span>
          </div>
        ) : (
          <div className="podium-card empty-podium" />
        )}
      </div>

      {/* Full Leaderboard Table */}
      <div className="stats-section-card">
        <h3 className="stats-section-title">Final Rankings</h3>
        <div className="table-wrapper">
          <table className="quiz-history-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Participant</th>
                <th>Final Score</th>
              </tr>
            </thead>
            <tbody>
              {playersList.map((p, idx) => {
                const pUid = p.uid || p.playerId;
                const isMe = pUid === localPlayerId;
                const hostUid = roomData.hostUid || roomData.hostId;
                const isHost = p.isHost || pUid === hostUid;

                return (
                  <tr key={pUid} className={isMe ? 'is-me-row' : ''}>
                    <td className="score-cell">#{idx + 1}</td>
                    <td>
                      <strong>{p.displayName}</strong> {isMe && '(You)'} {isHost && '👑'}
                    </td>
                    <td className="score-cell">{p.score || 0} pts</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Button */}
      <div className="results-actions-card">
        <button
          type="button"
          className="btn btn-primary btn-action"
          onClick={onReturnHome}
        >
          <span>Return to Dashboard 🏠</span>
        </button>
      </div>
    </div>
  );
}
