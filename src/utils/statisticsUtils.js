import { getCategoryIcon } from './quizUtils';

/**
 * Pure Calculation Utilities for Statistics & Learning Analytics
 */

/**
 * Calculate top-level Overview KPIs
 */
export const calculateOverviewStats = (flashcards = [], quizHistory = []) => {
  const totalCards = Array.isArray(flashcards) ? flashcards.length : 0;

  const totalStudied = Array.isArray(flashcards)
    ? flashcards.reduce((sum, c) => sum + (c.studiedCount || 0), 0)
    : 0;

  const quizzesCompleted = Array.isArray(quizHistory) ? quizHistory.length : 0;

  let averageScore = 0;
  let bestScore = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnanswered = 0;

  if (quizzesCompleted > 0) {
    const totalPercentage = quizHistory.reduce((sum, q) => sum + (q.percentage || 0), 0);
    averageScore = Math.round(totalPercentage / quizzesCompleted);
    bestScore = Math.max(...quizHistory.map((q) => q.percentage || 0));

    totalCorrect = quizHistory.reduce((sum, q) => sum + (q.correctAnswers || 0), 0);
    totalIncorrect = quizHistory.reduce((sum, q) => sum + (q.incorrectAnswers || 0), 0);
    totalUnanswered = quizHistory.reduce((sum, q) => sum + (q.unanswered || 0), 0);
  }

  return {
    totalCards,
    totalStudied,
    quizzesCompleted,
    averageScore,
    bestScore,
    totalCorrect,
    totalIncorrect,
    totalUnanswered
  };
};

/**
 * Calculate per-category breakdown for cards, study interactions, and quiz scores
 */
export const calculateCategoryAnalytics = (flashcards = [], quizHistory = []) => {
  const categoryMap = {};

  // 1. Process flashcards
  flashcards.forEach((card) => {
    const cat = card.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        name: cat,
        icon: getCategoryIcon(cat),
        cardCount: 0,
        studiedCount: 0,
        quizzesTaken: 0,
        quizScores: []
      };
    }
    categoryMap[cat].cardCount += 1;
    categoryMap[cat].studiedCount += card.studiedCount || 0;
  });

  // 2. Process quiz history
  quizHistory.forEach((quiz) => {
    const cat = quiz.category;
    if (cat && cat !== 'All Categories') {
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          name: cat,
          icon: getCategoryIcon(cat),
          cardCount: 0,
          studiedCount: 0,
          quizzesTaken: 0,
          quizScores: []
        };
      }
      categoryMap[cat].quizzesTaken += 1;
      if (typeof quiz.percentage === 'number') {
        categoryMap[cat].quizScores.push(quiz.percentage);
      }
    }
  });

  return Object.values(categoryMap).map((cat) => {
    const avgQuizScore =
      cat.quizScores.length > 0
        ? Math.round(cat.quizScores.reduce((a, b) => a + b, 0) / cat.quizScores.length)
        : null;

    return {
      ...cat,
      averageQuizScore: avgQuizScore
    };
  });
};

/**
 * Calculate difficulty distribution across flashcards
 */
export const calculateDifficultyAnalytics = (flashcards = []) => {
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  const total = flashcards.length;

  flashcards.forEach((card) => {
    const diff = card.difficulty || 'Medium';
    if (counts[diff] !== undefined) {
      counts[diff] += 1;
    } else {
      counts.Medium += 1;
    }
  });

  return {
    counts,
    percentages: {
      Easy: total > 0 ? Math.round((counts.Easy / total) * 100) : 0,
      Medium: total > 0 ? Math.round((counts.Medium / total) * 100) : 0,
      Hard: total > 0 ? Math.round((counts.Hard / total) * 100) : 0
    }
  };
};

/**
 * Format completedAt ISO date to readable string
 */
export const formatQuizDate = (isoString) => {
  if (!isoString) return 'Just now';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Just now';
  }
};

/**
 * Returns YYYY-MM-DD in local time zone
 */
const getLocalDateString = (dateObj = new Date()) => {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate current consecutive-day learning streak
 * @param {Array<string>} activityDates - Array of YYYY-MM-DD date strings
 * @param {Date} [referenceDate] - Optional reference date (defaults to today)
 * @returns {number} Current streak in days
 */
export const calculateCurrentStreak = (activityDates = [], referenceDate = new Date()) => {
  if (!Array.isArray(activityDates) || activityDates.length === 0) {
    return 0;
  }

  const dateSet = new Set(
    activityDates.filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
  );

  const todayStr = getLocalDateString(referenceDate);
  if (!dateSet.has(todayStr)) {
    return 0;
  }

  let streak = 0;
  const checkDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  while (true) {
    const checkStr = getLocalDateString(checkDate);
    if (dateSet.has(checkStr)) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
