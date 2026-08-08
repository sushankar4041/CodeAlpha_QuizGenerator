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

  if (category && category !== 'All Categories') {
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

  // Extract all unique answers in the collection for distractor sampling
  const allUniqueAnswers = Array.from(new Set(flashcards.map((c) => c.answer.trim())));

  // 3. Convert selected cards into multiple-choice quiz questions
  const generatedQuestions = selectedCards.map((card, idx) => {
    const correctAnswer = card.answer.trim();

    // Pick distractors from other flashcards in collection
    const otherAnswers = allUniqueAnswers.filter((ans) => ans !== correctAnswer);
    const shuffledDistractors = shuffleArray(otherAnswers);
    const distractors = shuffledDistractors.slice(0, 3);

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
