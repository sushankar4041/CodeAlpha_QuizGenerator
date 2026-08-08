import { shuffleArray, generateMockQuiz } from '../utils/quizUtils';

/**
 * Lazy-loaded Question Bank Dataset Registry
 * Maps category keys to dynamic imports for bundle optimization.
 */
const CATEGORY_DATASET_MAP = {
  'javascript': () => import('../data/questions/javascript.json'),
  'react': () => import('../data/questions/react.json'),
  'dbms': () => import('../data/questions/dbms.json'),
  'data structures': () => import('../data/questions/data_structures.json'),
  'computer science': () => import('../data/questions/computer_science.json'),
  'operating systems': () => import('../data/questions/operating_systems.json'),
  'networking': () => import('../data/questions/networking.json'),
  'general knowledge': () => import('../data/questions/general.json')
};

/**
 * Load raw dataset for a specific category key or all categories
 */
async function loadCategoryDataset(categoryKey) {
  try {
    if (categoryKey && categoryKey !== 'all categories') {
      const loader = CATEGORY_DATASET_MAP[categoryKey.toLowerCase()];
      if (loader) {
        const module = await loader();
        return module.default || module;
      }
      return [];
    }

    // If 'All Categories', lazy load all datasets concurrently
    const loaders = Object.values(CATEGORY_DATASET_MAP);
    const modules = await Promise.all(loaders.map((loader) => loader()));
    return modules.flatMap((mod) => mod.default || mod);
  } catch (error) {
    console.error('Error lazy-loading question bank dataset:', error);
    return [];
  }
}

/**
 * Universal Question Bank Service API - Phase 8B
 * Serves randomized, filtered MCQs for Mock Quiz and Live Quiz.
 *
 * @param {Object} options
 * @param {string} options.category - Target category or 'All Categories'
 * @param {string} options.difficulty - 'All Difficulties' | 'Easy' | 'Medium' | 'Hard'
 * @param {number} options.requestedCount - Desired number of questions (5, 10, 15)
 * @param {string} options.source - 'system' | 'flashcards'
 * @param {Array} options.flashcards - User flashcards fallback collection
 */
export async function getQuestions({
  category = 'All Categories',
  difficulty = 'All Difficulties',
  requestedCount = 5,
  source = 'system',
  flashcards = []
}) {
  // 1. Fallback to User Flashcards if source is explicitly set to 'flashcards'
  if (source === 'flashcards') {
    return generateMockQuiz({
      flashcards,
      category,
      difficulty,
      requestedCount
    });
  }

  // 2. Load System Question Bank datasets on-demand
  const rawQuestions = await loadCategoryDataset(category);

  if (!rawQuestions || rawQuestions.length === 0) {
    // If system question bank has no questions for a custom user category, fall back to flashcards
    if (flashcards && flashcards.length > 0) {
      return generateMockQuiz({
        flashcards,
        category,
        difficulty,
        requestedCount
      });
    }

    return {
      success: false,
      reason: 'NO_MATCHING_QUESTIONS',
      questions: [],
      availableCount: 0
    };
  }

  // 3. Filter by category (if 'All Categories' was loaded)
  let filtered = rawQuestions;
  if (category && category !== 'All Categories') {
    filtered = filtered.filter(
      (q) => q.category.toLowerCase() === category.toLowerCase()
    );
  }

  // 4. Filter by difficulty
  if (difficulty && difficulty !== 'All Difficulties') {
    filtered = filtered.filter(
      (q) => q.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  }

  const availableCount = filtered.length;

  if (availableCount === 0) {
    return {
      success: false,
      reason: 'NO_MATCHING_QUESTIONS',
      questions: [],
      availableCount: 0
    };
  }

  // 5. Randomize questions using Fisher-Yates shuffle
  const shuffled = shuffleArray(filtered);

  // 6. Slice up to requestedCount
  const countToTake = Math.min(requestedCount, availableCount);
  const selected = shuffled.slice(0, countToTake);

  // 7. Format questions for runtime quiz engines (ensuring unique option shuffling per question)
  const formattedQuestions = selected.map((item, idx) => ({
    quizQuestionId: `qq-${item.id}-${idx + 1}-${Date.now()}`,
    questionId: item.id,
    question: item.question,
    category: item.category,
    difficulty: item.difficulty,
    correctAnswer: item.answer,
    options: shuffleArray([...item.options]),
    explanation: item.explanation || ''
  }));

  const isPartial = requestedCount > availableCount;

  return {
    success: true,
    questions: formattedQuestions,
    availableCount,
    isPartial,
    warning: isPartial ? `Only ${availableCount} questions available for current settings.` : null
  };
}

/**
 * Get available question count matching category and difficulty without loading full session
 */
export async function getAvailableQuestionCount({
  category = 'All Categories',
  difficulty = 'All Difficulties',
  source = 'system',
  flashcards = []
}) {
  if (source === 'flashcards') {
    let matching = flashcards;
    if (category && category !== 'All Categories') {
      matching = matching.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    }
    if (difficulty && difficulty !== 'All Difficulties') {
      matching = matching.filter((c) => c.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    return matching.length;
  }

  const rawQuestions = await loadCategoryDataset(category);
  let filtered = rawQuestions;

  if (category && category !== 'All Categories') {
    filtered = filtered.filter((q) => q.category.toLowerCase() === category.toLowerCase());
  }

  if (difficulty && difficulty !== 'All Difficulties') {
    filtered = filtered.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  return filtered.length;
}

/**
 * Returns available categories list supported by system question bank
 */
export const SYSTEM_CATEGORIES = [
  'All Categories',
  'JavaScript',
  'React',
  'DBMS',
  'Data Structures',
  'Computer Science',
  'Operating Systems',
  'Networking',
  'General Knowledge'
];
