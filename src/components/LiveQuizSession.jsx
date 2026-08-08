import { useState, useEffect } from 'react';
import { getCategoryIcon } from '../utils/quizUtils';
import ProgressBar from './ProgressBar';

/**
 * Live Quiz Session Component - Remediation
 * Synchronized active question view with real-time countdown timer,
 * locked answer selection, intermission correct answer reveal, and live leaderboard.
 */
export default function LiveQuizSession({
  roomData,
  localPlayerId,
  onSubmitAnswer,
  onLockQuestion,
  onNextQuestion
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);

  const hostUid = roomData?.hostUid || roomData?.hostId;
  const isHost = hostUid === localPlayerId;
  const currentQuestion = roomData?.currentQuestion;
  const currentIdx = roomData?.currentQuestionIndex || 0;
  const totalQuestions = roomData?.questionsCount || 1;
  const status = roomData?.status;
  const playersList = Object.values(roomData?.players || {}).sort((a, b) => (b.score || 0) - (a.score || 0));

  const myPlayerObj = roomData?.players?.[localPlayerId];
  const hasSubmitted = Boolean(myPlayerObj?.currentAnswer || selectedOption);

  // Real-time Timer countdown
  useEffect(() => {
    if (status !== 'QUESTION_ACTIVE' || !roomData?.questionEndTime) return;

    const interval = setInterval(() => {
      const remainingMs = roomData.questionEndTime - Date.now();
      const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
      setTimeLeft(seconds);

      if (seconds === 0 && isHost) {
        clearInterval(interval);
        onLockQuestion();
      }
    }, 250);

    return () => clearInterval(interval);
  }, [status, roomData?.questionEndTime, isHost, onLockQuestion]);

  const handleSelectOption = (option) => {
    if (hasSubmitted || status !== 'QUESTION_ACTIVE') return;
    setSelectedOption(option);
    onSubmitAnswer(option);
  };

  if (!currentQuestion) return null;

  return (
    <div className="live-session-container animate-fade-in" key={`live-q-${currentIdx}`}>
      {/* Session Progress Header */}
      <div className="session-progress-card">
        <div className="session-meta-flex">
          <span className="question-counter-label">
            Question <strong>{currentIdx + 1}</strong> of <strong>{totalQuestions}</strong>
          </span>
          <span className="room-code-badge-sm">Room: {roomData.roomCode}</span>
        </div>
        <ProgressBar value={currentIdx + 1} max={totalQuestions} />
      </div>

      {/* QUESTION ACTIVE VIEW */}
      {status === 'QUESTION_ACTIVE' && (
        <div className="quiz-question-card">
          <div className="question-card-header">
            <div className="card-category-tag">
              <span className="cat-emoji">{getCategoryIcon(currentQuestion.category)}</span>
              <span className="cat-text">{currentQuestion.category}</span>
            </div>
            <div className="timer-badge">
              ⏱️ <strong>{timeLeft}s</strong>
            </div>
          </div>

          <h3 className="quiz-question-text">{currentQuestion.question}</h3>

          <div className="quiz-options-group">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = (selectedOption === opt) || (myPlayerObj?.currentAnswer === opt);
              const optionLetter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={`${currentQuestion.quizQuestionId}-opt-${idx}`}
                  type="button"
                  className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(opt)}
                  disabled={hasSubmitted}
                >
                  <span className="option-letter">{optionLetter}</span>
                  <span className="option-text">{opt}</span>
                  {isSelected && <span className="option-check-icon">✓ Locked</span>}
                </button>
              );
            })}
          </div>

          {hasSubmitted && (
            <div className="answer-locked-banner">
              🔒 Answer submitted! Waiting for time to expire or host...
            </div>
          )}
        </div>
      )}

      {/* QUESTION LOCKED / INTERMISSION VIEW */}
      {status === 'QUESTION_LOCKED' && (
        <div className="intermission-card animate-fade-in">
          <div className="intermission-header">
            <span className="badge badge-purple">Question Intermission</span>
            <h3 className="intermission-title">Revealed Answer</h3>
          </div>

          <div className="correct-answer-reveal-box">
            <span className="box-lbl">CORRECT ANSWER:</span>
            <p className="box-ans">{roomData.lastRevealedAnswer}</p>
          </div>

          {/* Player Outcome */}
          <div className="my-outcome-box">
            {myPlayerObj?.currentAnswer === roomData.lastRevealedAnswer ? (
              <div className="outcome-banner success">✅ Great job! Your answer was correct!</div>
            ) : myPlayerObj?.currentAnswer ? (
              <div className="outcome-banner error">❌ Incorrect response for this question.</div>
            ) : (
              <div className="outcome-banner warning">⚪ Time expired before you submitted an answer.</div>
            )}
          </div>

          {/* Mini Live Standings */}
          <div className="mini-leaderboard">
            <h4>Live Standings</h4>
            <div className="mini-rank-list">
              {playersList.slice(0, 5).map((p, rank) => {
                const pUid = p.uid || p.playerId;
                return (
                  <div key={pUid} className="mini-rank-item">
                    <span className="rank-num">#{rank + 1}</span>
                    <span className="rank-name">{p.displayName}</span>
                    <strong className="rank-score">{p.score || 0} pts</strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Host Next Controls */}
          {isHost && (
            <div className="intermission-actions">
              <button
                type="button"
                className="btn btn-primary btn-next-q"
                onClick={onNextQuestion}
              >
                {currentIdx + 1 >= totalQuestions ? 'View Final Results 🏆' : 'Next Question →'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
