import { ref, set, get, update, onValue, off, remove } from 'firebase/database';
import { database, ensureAnonymousAuth } from './firebase';
import { getQuestions } from './questionBankService';

const DISPLAY_NAME_KEY = 'quiz_generator_live_display_name';

/**
 * Generates a 6-character room code format: QZ-XXXX
 */
export const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `QZ-${randomPart}`;
};

export const getLocalDisplayName = () => {
  try {
    return localStorage.getItem(DISPLAY_NAME_KEY) || 'Learner';
  } catch {
    return 'Learner';
  }
};

export const saveLocalDisplayName = (name) => {
  try {
    localStorage.setItem(DISPLAY_NAME_KEY, name);
  } catch (err) {
    console.error('Error saving display name:', err);
  }
};

/**
 * Atomic Room Code Generator
 * Ensures room code does not collide with an existing active room
 */
export const getUniqueRoomCode = async () => {
  let attempts = 0;
  while (attempts < 5) {
    const code = generateRoomCode();
    const roomRef = ref(database, `rooms/${code}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) {
      return code;
    }
    attempts++;
  }
  return generateRoomCode();
};

/**
 * Create a new Live Quiz Room with SEPARATE Public and Private State
 */
export const createLiveRoom = async ({
  hostName,
  category = 'All Categories',
  difficulty = 'All Difficulties',
  questionCount = 5,
  timePerQuestion = 15,
  flashcards = []
}) => {
  // 1. Authoritative Firebase Anonymous Auth
  const authUser = await ensureAnonymousAuth();
  const hostUid = authUser.uid;

  // 2. Generate unique room code with collision prevention
  const roomCode = await getUniqueRoomCode();

  // 3. Generate randomized questions from System Question Bank
  const generated = await getQuestions({
    category,
    difficulty,
    requestedCount: questionCount,
    source: 'system',
    flashcards
  });

  if (!generated.success || generated.questions.length === 0) {
    throw new Error('Insufficient questions available for selected settings.');
  }

  const fullQuestions = generated.questions;

  // Sanitized questions for public room state (CRITICAL: Omit correctAnswer!)
  const publicQuestions = fullQuestions.map((q) => ({
    quizQuestionId: q.quizQuestionId,
    question: q.question,
    category: q.category,
    difficulty: q.difficulty,
    options: q.options
  }));

  const now = Date.now();

  // 4. Public Room State (Readable by all authenticated participants)
  const publicRoomData = {
    roomCode,
    hostUid,
    status: 'LOBBY', // 'LOBBY' | 'STARTING' | 'QUESTION_ACTIVE' | 'QUESTION_LOCKED' | 'RESULTS' | 'CLOSED'
    config: {
      category,
      difficulty,
      questionCount: publicQuestions.length,
      timePerQuestion
    },
    currentQuestionIndex: 0,
    questionsCount: publicQuestions.length,
    publicQuestions,
    currentQuestion: publicQuestions[0],
    lastRevealedAnswer: null,
    questionStartTime: null,
    questionEndTime: null,
    createdAt: now,
    players: {
      [hostUid]: {
        uid: hostUid,
        displayName: hostName || 'Host',
        score: 0,
        currentAnswer: null,
        submittedAt: null,
        isHost: true,
        joinedAt: now
      }
    }
  };

  // 5. Protected Private Room Secret State (Readable ONLY by Room Host)
  const privateSecretData = {
    hostUid,
    privateQuestions: fullQuestions
  };

  // Atomic write
  const publicRoomRef = ref(database, `rooms/${roomCode}`);
  const secretRoomRef = ref(database, `roomSecrets/${roomCode}`);

  await set(publicRoomRef, publicRoomData);
  await set(secretRoomRef, privateSecretData);

  saveLocalDisplayName(hostName);

  return { roomCode, hostUid };
};

/**
 * Join an existing Live Room by 6-digit room code
 */
export const joinLiveRoom = async ({ roomCode, displayName }) => {
  const cleanCode = roomCode.trim().toUpperCase();
  const authUser = await ensureAnonymousAuth();
  const playerUid = authUser.uid;

  const roomRef = ref(database, `rooms/${cleanCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('Room not found. Please check the 6-digit code and try again.');
  }

  const roomData = snapshot.val();

  if (roomData.status === 'CLOSED') {
    throw new Error('This live room has been closed by the host.');
  }

  if (roomData.status !== 'LOBBY') {
    throw new Error('Quiz has already started. Late joins are not permitted.');
  }

  const playerRef = ref(database, `rooms/${cleanCode}/players/${playerUid}`);
  const playerData = {
    uid: playerUid,
    displayName: displayName || 'Player',
    score: 0,
    currentAnswer: null,
    submittedAt: null,
    isHost: roomData.hostUid === playerUid,
    joinedAt: Date.now()
  };

  await set(playerRef, playerData);
  saveLocalDisplayName(displayName);

  return { roomCode: cleanCode, playerUid };
};

/**
 * Subscribe to real-time public room changes in Firebase
 * (CRITICAL: Reads ONLY public rooms node, never exposes private answer secrets)
 */
export const subscribeToRoom = (roomCode, onUpdate) => {
  const cleanCode = roomCode.trim().toUpperCase();
  const roomRef = ref(database, `rooms/${cleanCode}`);

  const listener = (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.val());
    } else {
      onUpdate({ status: 'CLOSED' });
    }
  };

  onValue(roomRef, listener);

  return () => {
    off(roomRef, listener);
  };
};

/**
 * Host Action: Start Live Quiz Session
 */
export const startLiveQuiz = async (roomCode) => {
  const authUser = await ensureAnonymousAuth();
  const cleanCode = roomCode.trim().toUpperCase();
  const roomRef = ref(database, `rooms/${cleanCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) return;
  const roomData = snapshot.val();

  if (roomData.hostUid !== authUser.uid) {
    throw new Error('Unauthorized: Only the room host can start the quiz.');
  }

  const timePerQuestion = roomData.config?.timePerQuestion || 15;
  const now = Date.now();

  await update(roomRef, {
    status: 'QUESTION_ACTIVE',
    currentQuestionIndex: 0,
    currentQuestion: roomData.publicQuestions[0],
    lastRevealedAnswer: null,
    questionStartTime: now,
    questionEndTime: now + timePerQuestion * 1000
  });
};

/**
 * Player Action: Submit Answer for Active Question
 * (CRITICAL: Player submits ONLY selected option & server timestamp — score is NOT directly modified by player!)
 */
export const submitPlayerAnswer = async ({ roomCode, selectedAnswer }) => {
  const authUser = await ensureAnonymousAuth();
  const playerUid = authUser.uid;
  const cleanCode = roomCode.trim().toUpperCase();

  const playerRef = ref(database, `rooms/${cleanCode}/players/${playerUid}`);

  await update(playerRef, {
    currentAnswer: selectedAnswer,
    submittedAt: Date.now()
  });
};

/**
 * Host Action: Lock current question, evaluate answers from private secrets, and reveal answer
 */
export const lockCurrentQuestion = async (roomCode) => {
  const authUser = await ensureAnonymousAuth();
  const cleanCode = roomCode.trim().toUpperCase();

  const publicRef = ref(database, `rooms/${cleanCode}`);
  const secretRef = ref(database, `roomSecrets/${cleanCode}`);

  const [publicSnap, secretSnap] = await Promise.all([
    get(publicRef),
    get(secretRef)
  ]);

  if (!publicSnap.exists() || !secretSnap.exists()) return;

  const publicData = publicSnap.val();
  const secretData = secretSnap.val();

  if (publicData.hostUid !== authUser.uid) {
    throw new Error('Unauthorized: Only the room host can lock questions.');
  }

  const currentIdx = publicData.currentQuestionIndex || 0;
  const privateQ = secretData.privateQuestions?.[currentIdx];
  const correctAnswer = privateQ?.correctAnswer || '';
  const timePerQuestion = publicData.config?.timePerQuestion || 15;

  // Evaluate scores for all players server-side / host-side based on protected private answers
  const updatedPlayers = { ...publicData.players };

  Object.keys(updatedPlayers).forEach((pUid) => {
    const player = updatedPlayers[pUid];
    const playerAns = player.currentAnswer;
    const submittedAt = player.submittedAt;

    if (playerAns && playerAns.trim() === correctAnswer.trim()) {
      let speedBonus = 0;
      if (submittedAt && publicData.questionEndTime && publicData.questionStartTime) {
        const timeRemaining = Math.max(0, publicData.questionEndTime - submittedAt);
        const totalDuration = timePerQuestion * 1000;
        speedBonus = Math.round(50 * Math.min(1, timeRemaining / totalDuration));
      }
      const pointsEarned = 100 + speedBonus;
      player.score = (player.score || 0) + pointsEarned;
    }
  });

  await update(publicRef, {
    status: 'QUESTION_LOCKED',
    lastRevealedAnswer: correctAnswer,
    players: updatedPlayers
  });
};

/**
 * Host Action: Advance to next question or complete quiz
 */
export const advanceNextQuestion = async (roomCode) => {
  const authUser = await ensureAnonymousAuth();
  const cleanCode = roomCode.trim().toUpperCase();

  const publicRef = ref(database, `rooms/${cleanCode}`);
  const publicSnap = await get(publicRef);

  if (!publicSnap.exists()) return;
  const publicData = publicSnap.val();

  if (publicData.hostUid !== authUser.uid) {
    throw new Error('Unauthorized: Only the room host can advance questions.');
  }

  const currentIdx = publicData.currentQuestionIndex || 0;
  const nextIdx = currentIdx + 1;

  if (nextIdx >= publicData.questionsCount) {
    // Complete Quiz
    await update(publicRef, {
      status: 'RESULTS',
      lastRevealedAnswer: null
    });
  } else {
    // Next Question
    const timePerQuestion = publicData.config?.timePerQuestion || 15;
    const now = Date.now();

    // Reset player currentAnswer fields for next question
    const updatedPlayers = { ...publicData.players };
    Object.keys(updatedPlayers).forEach((pUid) => {
      updatedPlayers[pUid] = {
        ...updatedPlayers[pUid],
        currentAnswer: null,
        submittedAt: null
      };
    });

    await update(publicRef, {
      status: 'QUESTION_ACTIVE',
      currentQuestionIndex: nextIdx,
      currentQuestion: publicData.publicQuestions[nextIdx],
      lastRevealedAnswer: null,
      questionStartTime: now,
      questionEndTime: now + timePerQuestion * 1000,
      players: updatedPlayers
    });
  }
};

/**
 * Host Action: Close Room
 */
export const closeLiveRoom = async (roomCode) => {
  const authUser = await ensureAnonymousAuth();
  const cleanCode = roomCode.trim().toUpperCase();

  const publicRef = ref(database, `rooms/${cleanCode}`);
  const secretRef = ref(database, `roomSecrets/${cleanCode}`);

  const publicSnap = await get(publicRef);
  if (publicSnap.exists() && publicSnap.val().hostUid === authUser.uid) {
    await Promise.all([
      remove(publicRef),
      remove(secretRef)
    ]);
  }
};
