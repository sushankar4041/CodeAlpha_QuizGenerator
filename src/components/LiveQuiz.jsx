import { useState, useEffect, useMemo } from 'react';
import LiveQuizLobby from './LiveQuizLobby';
import LiveQuizSession from './LiveQuizSession';
import LiveQuizResults from './LiveQuizResults';
import {
  createLiveRoom,
  joinLiveRoom,
  subscribeToRoom,
  startLiveQuiz,
  submitPlayerAnswer,
  lockCurrentQuestion,
  advanceNextQuestion,
  closeLiveRoom,
  getLocalDisplayName
} from '../services/liveQuizService';
import { ensureAnonymousAuth } from '../services/firebase';
import { getCategoryIcon } from '../utils/quizUtils';

/**
 * Live Quiz Master Coordinator Component - Remediation
 * Manages Host Setup, Join Room form, Real-Time Lobby, Active Session, and Podium Results.
 */
export default function LiveQuiz({ flashcards = [], onNavigateView }) {
  const [mode, setMode] = useState('select'); // 'select' | 'host_setup' | 'join_setup' | 'room_active'
  const [roomCode, setRoomCode] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [authUid, setAuthUid] = useState(null);

  const initialName = getLocalDisplayName();

  // Host Setup Form state
  const [hostName, setHostName] = useState(initialName || 'Learner');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Difficulties');
  const [questionCount, setQuestionCount] = useState(5);
  const [timePerQuestion, setTimePerQuestion] = useState(15);

  // Join Setup Form state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [playerNameInput, setPlayerNameInput] = useState(initialName || 'Learner');

  // Categories list derived from flashcards
  const categoriesList = useMemo(() => {
    const set = new Set(flashcards.map((c) => c.category));
    return ['All Categories', ...Array.from(set)];
  }, [flashcards]);

  // Ensure Anonymous Auth on mount
  useEffect(() => {
    ensureAnonymousAuth().then((user) => {
      if (user?.uid) {
        setAuthUid(user.uid);
      }
    });
  }, []);

  // Subscribe to room updates when in an active room
  useEffect(() => {
    if (!roomCode || mode !== 'room_active') return;

    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      if (!updatedRoom || updatedRoom.status === 'CLOSED') {
        alert('This room has been closed or does not exist.');
        setMode('select');
        setRoomCode('');
        setRoomData(null);
      } else {
        setRoomData(updatedRoom);
      }
    });

    return () => unsubscribe();
  }, [roomCode, mode]);

  // Host Room Submit Handler
  const handleHostCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const user = await ensureAnonymousAuth();
      setAuthUid(user.uid);

      const res = await createLiveRoom({
        hostName,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        questionCount,
        timePerQuestion,
        flashcards
      });

      setRoomCode(res.roomCode);
      setMode('room_active');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create live room.');
    } finally {
      setLoading(false);
    }
  };

  // Join Room Submit Handler
  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const user = await ensureAnonymousAuth();
      setAuthUid(user.uid);

      const res = await joinLiveRoom({
        roomCode: joinCodeInput,
        displayName: playerNameInput
      });

      setRoomCode(res.roomCode);
      setMode('room_active');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to join room.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      await startLiveQuiz(roomCode);
    } catch (err) {
      console.error('Error starting quiz:', err);
    }
  };

  const handleSubmitAnswer = async (selectedOption) => {
    try {
      await submitPlayerAnswer({
        roomCode,
        selectedAnswer: selectedOption
      });
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  const handleLockQuestion = async () => {
    try {
      await lockCurrentQuestion(roomCode);
    } catch (err) {
      console.error('Error locking question:', err);
    }
  };

  const handleNextQuestion = async () => {
    try {
      await advanceNextQuestion(roomCode);
    } catch (err) {
      console.error('Error advancing question:', err);
    }
  };

  const handleLeaveRoom = async () => {
    if (roomData?.hostUid === authUid) {
      if (window.confirm('Closing the room as host will end the session for all participants. Continue?')) {
        await closeLiveRoom(roomCode);
      } else {
        return;
      }
    }
    setMode('select');
    setRoomCode('');
    setRoomData(null);
  };

  return (
    <div className="live-quiz-wrapper animate-fade-in">
      {/* 1. SELECT MODE SCREEN */}
      {mode === 'select' && (
        <div className="concept-placeholder-container">
          <div className="concept-banner live-quiz-banner">
            <div className="concept-badge competition">Real-Time Multiplayer Engine</div>
            <h2 className="concept-title">Live Quiz Challenge</h2>
            <p className="concept-description">
              Host a live multiplayer quiz session or enter a 6-digit room code to join and compete live against classmates.
            </p>
          </div>

          <div className="live-modes-grid">
            {/* Host Room Option */}
            <div className="live-mode-card">
              <div className="mode-icon">👑</div>
              <h3 className="mode-title">Host a Live Room</h3>
              <p className="mode-desc">
                Create a custom multiplayer room from your flashcard deck and get a 6-digit join code for participants.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setMode('host_setup')}
              >
                Configure & Host Room →
              </button>
            </div>

            {/* Join Room Option */}
            <div className="live-mode-card">
              <div className="mode-icon">🎮</div>
              <h3 className="mode-title">Join a Room</h3>
              <p className="mode-desc">
                Enter a host&apos;s 6-digit room code to enter the lobby, answer synchronized questions, and compete on the live podium.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMode('join_setup')}
              >
                Enter Room Code →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. HOST SETUP FORM */}
      {mode === 'host_setup' && (
        <div className="quiz-config-container animate-fade-in">
          <div className="config-header-card">
            <div className="concept-badge competition">Room Host Setup</div>
            <h2 className="config-title">Create Live Room</h2>
            <p className="config-subtitle">
              Configure parameters for your live multiplayer competition.
            </p>
          </div>

          <form onSubmit={handleHostCreate} className="quiz-config-form">
            {errorMessage && <div className="zero-warning-box">{errorMessage}</div>}

            <div className="config-section">
              <label className="config-label">Host Display Name</label>
              <input
                type="text"
                className="form-input"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                required
              />
            </div>

            <div className="config-section">
              <label className="config-label">Category</label>
              <div className="config-chips-grid">
                {categoriesList.map((catName) => (
                  <button
                    key={catName}
                    type="button"
                    className={`config-chip ${selectedCategory === catName ? 'selected' : ''}`}
                    onClick={() => setSelectedCategory(catName)}
                  >
                    <span className="chip-emoji">{catName === 'All Categories' ? '📚' : getCategoryIcon(catName)}</span>
                    <span>{catName}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="config-section">
              <label className="config-label">Difficulty</label>
              <div className="config-chips-grid">
                {['All Difficulties', 'Easy', 'Medium', 'Hard'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`config-chip ${selectedDifficulty === lvl ? 'selected' : ''}`}
                    onClick={() => setSelectedDifficulty(lvl)}
                  >
                    <span>{lvl}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="config-section">
              <label className="config-label">Question Count & Timer</label>
              <div className="form-row">
                <div className="flex-1">
                  <label className="form-label">Questions</label>
                  <select
                    className="form-select"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="form-label">Time Per Question</label>
                  <select
                    className="form-select"
                    value={timePerQuestion}
                    onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                  >
                    <option value={10}>10 Seconds</option>
                    <option value={15}>15 Seconds</option>
                    <option value={30}>30 Seconds</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMode('select')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating Room...' : 'Create Live Room 👑'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. JOIN SETUP FORM */}
      {mode === 'join_setup' && (
        <div className="quiz-config-container animate-fade-in">
          <div className="config-header-card">
            <div className="concept-badge competition">Participant Join</div>
            <h2 className="config-title">Join Live Room</h2>
            <p className="config-subtitle">
              Enter the host&apos;s 6-digit room code to enter the competition lobby.
            </p>
          </div>

          <form onSubmit={handleJoinSubmit} className="quiz-config-form">
            {errorMessage && <div className="zero-warning-box">{errorMessage}</div>}

            <div className="config-section">
              <label className="config-label">6-Digit Room Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. QZ-8492"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="config-section">
              <label className="config-label">Your Display Name</label>
              <input
                type="text"
                className="form-input"
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                required
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMode('select')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Joining Room...' : 'Join Lobby 🎮'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. ACTIVE ROOM STAGES */}
      {mode === 'room_active' && roomData && (
        <>
          {roomData.status === 'LOBBY' && (
            <LiveQuizLobby
              roomData={roomData}
              localPlayerId={authUid}
              onStartQuiz={handleStartQuiz}
              onLeaveRoom={handleLeaveRoom}
            />
          )}

          {(roomData.status === 'QUESTION_ACTIVE' || roomData.status === 'QUESTION_LOCKED') && (
            <LiveQuizSession
              roomData={roomData}
              localPlayerId={authUid}
              onSubmitAnswer={handleSubmitAnswer}
              onLockQuestion={handleLockQuestion}
              onNextQuestion={handleNextQuestion}
            />
          )}

          {roomData.status === 'RESULTS' && (
            <LiveQuizResults
              roomData={roomData}
              localPlayerId={authUid}
              onReturnHome={() => onNavigateView('dashboard')}
            />
          )}
        </>
      )}
    </div>
  );
}
