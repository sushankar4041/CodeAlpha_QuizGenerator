/**
 * Quiz & Flashcard Utilities
 */

/**
 * Fisher-Yates array shuffle implementation
 * @param {Array} array
 * @returns {Array} new shuffled array
 */
export const shuffleArray = (array) => {
  if (!Array.isArray(array)) return [];
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/**
 * Returns CSS badge class based on difficulty level
 * @param {string} difficulty - 'Easy' | 'Medium' | 'Hard'
 * @returns {string} className
 */
export const getDifficultyBadgeClass = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'badge-easy';
    case 'medium':
      return 'badge-medium';
    case 'hard':
      return 'badge-hard';
    default:
      return 'badge-purple';
  }
};

/**
 * Get category icon emoji
 * @param {string} category
 * @returns {string} emoji
 */
export const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'javascript':
      return '🟨';
    case 'react':
      return '⚛️';
    case 'data structures':
      return '🌲';
    case 'dbms':
      return '🗄️';
    default:
      return '📖';
  }
};

/**
 * Filter flashcards by category
 * @param {Array} flashcards
 * @param {string} categoryFilter
 * @returns {Array} filtered flashcards
 */
export const filterCardsByCategory = (flashcards, categoryFilter) => {
  if (!categoryFilter || categoryFilter === 'All Categories') {
    return flashcards;
  }
  return flashcards.filter(
    (card) => card.category.toLowerCase() === categoryFilter.toLowerCase()
  );
};

/**
 * Helper function to select up to 3 smart distractors for a target card using 4-tier hierarchy:
 * Tier 1: Explicit distractors array from card.distractors
 * Tier 2: Related flashcards (same category + same/adjacent difficulty + keyword/length similarity)
 * Tier 3: Same category pool
 * Tier 4: Global collection fallback
 */
export const selectSmartDistractors = (targetCard, allFlashcards = []) => {
  const correctAnswerNorm = (targetCard.answer || '').trim().toLowerCase();
  const selectedDistractors = [];
  const selectedNormSet = new Set([correctAnswerNorm]);

  // Helper to validate and add a candidate distractor string
  const tryAddDistractor = (distractorStr) => {
    if (!distractorStr || typeof distractorStr !== 'string') return false;
    const trimmed = distractorStr.trim();
    if (trimmed.length < 2) return false;
    const norm = trimmed.toLowerCase();
    if (selectedNormSet.has(norm)) return false;

    selectedDistractors.push(trimmed);
    selectedNormSet.add(norm);
    return true;
  };

  // --- TIER 1: Explicit Distractors (from card.distractors) ---
  if (Array.isArray(targetCard.distractors) && targetCard.distractors.length > 0) {
    for (const expDist of targetCard.distractors) {
      if (selectedDistractors.length >= 3) break;
      tryAddDistractor(expDist);
    }
  }

  if (selectedDistractors.length >= 3) {
    return selectedDistractors.slice(0, 3);
  }

  // Candidates pool: all other cards in collection with non-empty answers
  const otherCards = allFlashcards.filter(
    (c) => c && c.id !== targetCard.id && c.answer && c.answer.trim()
  );

  // Difficulty level weight helper ('Easy':1, 'Medium':2, 'Hard':3)
  const getDiffLevel = (d) => {
    const lower = (d || '').toLowerCase();
    if (lower === 'easy') return 1;
    if (lower === 'hard') return 3;
    return 2;
  };
  const targetDiffLevel = getDiffLevel(targetCard.difficulty);
  const targetCatLower = (targetCard.category || '').toLowerCase();

  // Keywords set for relevance scoring
  const targetKeywords = new Set(
    `${targetCard.question || ''} ${targetCard.answer || ''}`
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3)
  );

  // --- TIER 2: Related Flashcards ---
  // Rank candidate cards by deterministic similarity score
  const candidateScores = otherCards.map((card) => {
    let score = 0;
    const cardCatLower = (card.category || '').toLowerCase();
    const cardDiffLevel = getDiffLevel(card.difficulty);

    // Same category bonus
    if (cardCatLower === targetCatLower) {
      score += 10;
    }

    // Difficulty proximity bonus
    const diffDiff = Math.abs(cardDiffLevel - targetDiffLevel);
    if (diffDiff === 0) score += 5;
    else if (diffDiff === 1) score += 2;

    // Answer length similarity bonus
    const lenDiff = Math.abs(card.answer.trim().length - targetCard.answer.trim().length);
    if (lenDiff < 20) score += 3;
    else if (lenDiff < 50) score += 1;

    // Keyword overlap bonus
    const cardText = `${card.question || ''} ${card.answer || ''}`.toLowerCase();
    let kwMatches = 0;
    for (const kw of targetKeywords) {
      if (cardText.includes(kw)) {
        kwMatches += 1;
      }
    }
    score += Math.min(kwMatches * 2, 6);

    return { card, score };
  });

  // Sort candidates by score descending (deterministic tie-breaker by card.id)
  candidateScores.sort((a, b) => b.score - a.score || a.card.id.localeCompare(b.card.id));

  for (const { card } of candidateScores) {
    if (selectedDistractors.length >= 3) break;
    tryAddDistractor(card.answer);
  }

  if (selectedDistractors.length >= 3) {
    return selectedDistractors.slice(0, 3);
  }

  // --- TIER 3: Generic Same Category Pool ---
  const sameCatCards = otherCards.filter((c) => (c.category || '').toLowerCase() === targetCatLower);
  for (const card of sameCatCards) {
    if (selectedDistractors.length >= 3) break;
    tryAddDistractor(card.answer);
  }

  if (selectedDistractors.length >= 3) {
    return selectedDistractors.slice(0, 3);
  }

  // --- TIER 4: Global Fallback Pool ---
  for (const card of otherCards) {
    if (selectedDistractors.length >= 3) break;
    tryAddDistractor(card.answer);
  }

  return selectedDistractors.slice(0, 3);
};

/**
 * Generate a randomized Mock Quiz from available flashcards
 */
export const generateMockQuiz = ({
  flashcards = [],
  category = 'All Categories',
  difficulty = 'All Difficulties',
  requestedCount = 5
}) => {
  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    return { success: false, reason: 'EMPTY_COLLECTION', questions: [], availableCount: 0 };
  }

  // 1. Filter flashcards by category and difficulty
  let matchingCards = flashcards;

  if (category && category.toLowerCase() !== 'all categories') {
    matchingCards = matchingCards.filter(
      (c) => c.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (difficulty && difficulty !== 'All Difficulties') {
    matchingCards = matchingCards.filter(
      (c) => c.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  }

  if (matchingCards.length === 0) {
    return { success: false, reason: 'NO_MATCHING_CARDS', questions: [], availableCount: 0 };
  }

  // 2. Shuffle matching cards and take up to requestedCount
  const shuffledCards = shuffleArray(matchingCards);
  const selectedCards = shuffledCards.slice(0, Math.min(requestedCount, matchingCards.length));

  // 3. Convert selected cards into multiple-choice quiz questions using smart distractors
  const generatedQuestions = selectedCards.map((card, idx) => {
    const correctAnswer = card.answer.trim();

    // Select smart distractors using 4-tier pipeline
    const distractors = selectSmartDistractors(card, flashcards);

    // Combine and shuffle multiple choice options
    const rawOptions = [correctAnswer, ...distractors];
    const options = shuffleArray(rawOptions);

    return {
      quizQuestionId: `qq-${idx + 1}-${Date.now()}`,
      flashcardId: card.id,
      question: card.question,
      category: card.category,
      difficulty: card.difficulty,
      correctAnswer,
      options
    };
  });

  return {
    success: true,
    questions: generatedQuestions,
    availableCount: matchingCards.length
  };
};
