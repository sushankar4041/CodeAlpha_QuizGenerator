/**
 * Quiz & Flashcard Utilities
 */

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
