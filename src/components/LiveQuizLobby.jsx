import { useState } from 'react';

/**
 * Live Quiz Lobby Component - Phase 7 Quizelle
 * Displays 6-digit room code with Quizelle Q vinyl-inspired dial icon,
 * connected player grid, host controls, and start button.
 */
export default function LiveQuizLobby({ roomData, localPlayerId, onStartQuiz, onLeaveRoom, onShowToast }) {
  const [copied, setCopied] = useState(false);

  if (!roomData) return null;

  const playersList = Object.values(roomData.players || {});
  const hostUid = roomData.hostUid || roomData.hostId;
  const isHost = hostUid === localPlayerId;
  const roomCode = roomData.roomCode;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    if (onShowToast) {
      onShowToast(`Room code ${roomCode} copied to clipboard!`, 'info');
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="live-lobby-container animate-fade-in">
      <div className="lobby-header-card">
        {/* Subtle Quizelle Q Dial Brand Treatment */}
        <div className="q-vinyl-dial-wrapper" aria-hidden="true">
          <div className="q-vinyl-dial">
            <span className="q-dial-letter">Q</span>
            <div className="q-dial-ring"></div>
          </div>
        </div>

        <div className="concept-badge competition">Multiplayer Competition Lobby</div>
        <h2 className="lobby-title">Waiting for Players...</h2>
        <p className="lobby-subtitle">
          Share the 6-digit room code with classmates to join this live competition room.
        </p>

        {/* High-Energy Room Code Display Box */}
        <div className="room-code-display-box">
          <div className="code-label">ROOM JOIN CODE:</div>
          <div className="code-value">{roomCode}</div>
          <button
            type="button"
            className="btn btn-secondary btn-copy"
            onClick={handleCopyCode}
          >
            {copied ? '✓ Copied!' : '📋 Copy Code'}
          </button>
        </div>
      </div>

      {/* Players List Grid */}
      <div className="lobby-players-card">
        <div className="players-card-header">
          <h3 className="players-title">
            Connected Participants ({playersList.length})
          </h3>
          <span className="live-status-pill">● Synchronized</span>
        </div>

        <div className="players-avatars-grid">
          {playersList.map((p) => {
            const pUid = p.uid || p.playerId;
            const isMe = pUid === localPlayerId;
            const playerIsHost = p.isHost || pUid === hostUid;

            return (
              <div key={pUid} className={`player-avatar-card ${isMe ? 'is-me' : ''}`}>
                <div className="avatar-circle">
                  {p.displayName ? p.displayName.charAt(0).toUpperCase() : '👤'}
                </div>
                <div className="player-meta">
                  <span className="player-name">
                    {p.displayName} {isMe && '(You)'}
                  </span>
                  {playerIsHost && <span className="host-tag">👑 Host</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lobby Controls Footer */}
      <div className="lobby-controls-bar">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onLeaveRoom}
        >
          ← Leave Room
        </button>

        {isHost ? (
          <button
            type="button"
            className="btn btn-primary btn-start-live"
            onClick={onStartQuiz}
            disabled={playersList.length === 0}
          >
            <span>Start Live Quiz 🚀</span>
          </button>
        ) : (
          <div className="waiting-host-notice">
            ⏳ Waiting for host to start the quiz...
          </div>
        )}
      </div>
    </div>
  );
}
