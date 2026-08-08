/**
 * Storage Service
 * Handles persistence for Quizelle flashcards, quiz history, learner profile, preferences, and theme
 */

import { defaultFlashcards } from '../data/defaultFlashcards';

const FLASHCARDS_KEY = 'quiz_generator_flashcards';
const QUIZ_HISTORY_KEY = 'quiz_generator_history';
const THEME_KEY = 'quiz_generator_theme';
const PROFILE_KEY = 'quiz_generator_learner_profile';
const PREFERENCES_KEY = 'quiz_generator_preferences';
const DISPLAY_NAME_KEY = 'quiz_generator_live_display_name';

/**
 * Helper to normalize a card object ensuring all required Phase 2 fields exist
 */
const normalizeCard = (card, index) => {
  const now = new Date().toISOString();
  return {
    id: card.id || `fc-${index + 1}`,
    question: card.question || '',
    answer: card.answer || '',
    category: card.category || 'General',
    difficulty: card.difficulty || 'Medium',
    createdAt: card.createdAt || now,
    updatedAt: card.updatedAt || now,
    studiedCount: typeof card.studiedCount === 'number' ? card.studiedCount : 0
  };
};

/**
 * Retrieve flashcards from localStorage, falling back safely to defaultFlashcards
 */
export const getStoredFlashcards = () => {
  try {
    const saved = localStorage.getItem(FLASHCARDS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((card, idx) => normalizeCard(card, idx));
      }
    }
  } catch (error) {
    console.error('Error loading flashcards from localStorage:', error);
  }
  return defaultFlashcards.map((card, idx) => normalizeCard(card, idx));
};

/**
 * Save flashcards collection to localStorage
 */
export const saveStoredFlashcards = (cards) => {
  try {
    localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error('Error saving flashcards to localStorage:', error);
  }
};

/**
 * Reset flashcards to default sample deck
 */
export const resetStoredFlashcards = () => {
  const resetCollection = defaultFlashcards.map((card, idx) => normalizeCard(card, idx));
  saveStoredFlashcards(resetCollection);
  return resetCollection;
};

/**
 * Calculate total study interactions count across all cards
 */
export const getTotalCardsStudied = (cards) => {
  if (!Array.isArray(cards)) return 0;
  return cards.reduce((sum, card) => sum + (card.studiedCount || 0), 0);
};

/**
 * Retrieve completed quiz history from localStorage
 */
export const getStoredQuizHistory = () => {
  try {
    const saved = localStorage.getItem(QUIZ_HISTORY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading quiz history from localStorage:', error);
  }
  return [];
};

/**
 * Append completed quiz result to quiz history in localStorage
 */
export const saveQuizResult = (result) => {
  try {
    const currentHistory = getStoredQuizHistory();
    const newResult = {
      id: `qz-${Date.now()}`,
      completedAt: new Date().toISOString(),
      ...result
    };
    const updatedHistory = [newResult, ...currentHistory];
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (error) {
    console.error('Error saving quiz result to localStorage:', error);
    return getStoredQuizHistory();
  }
};

/**
 * Clear completed quiz history from localStorage
 */
export const clearStoredQuizHistory = () => {
  try {
    localStorage.removeItem(QUIZ_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing quiz history:', error);
  }
  return [];
};

/**
 * Calculate average percentage score across completed quizzes
 */
export const getAverageQuizScore = (history) => {
  if (!Array.isArray(history) || history.length === 0) return 0;
  const totalPercentage = history.reduce((sum, item) => sum + (item.percentage || 0), 0);
  return Math.round(totalPercentage / history.length);
};

/**
 * Learner Profile Storage
 * Unifies learner profile with legacy live quiz display name key fallback
 */
export const getStoredLearnerProfile = () => {
  try {
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      if (parsed && typeof parsed.displayName === 'string' && parsed.displayName.trim() !== '' && parsed.displayName !== 'Learner') {
        return parsed;
      }
    }
    // Check legacy live display name fallback
    const legacyName = localStorage.getItem(DISPLAY_NAME_KEY);
    if (legacyName && legacyName.trim() !== '') {
      return { displayName: legacyName.trim() };
    }
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      if (parsed && typeof parsed.displayName === 'string') {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading learner profile:', error);
  }
  return { displayName: 'Learner' };
};

export const saveStoredLearnerProfile = (profile) => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    if (profile.displayName) {
      localStorage.setItem(DISPLAY_NAME_KEY, profile.displayName);
    }
  } catch (error) {
    console.error('Error saving learner profile:', error);
  }
};

/**
 * Quiz Preferences Storage
 */
export const getStoredPreferences = () => {
  const defaultPrefs = {
    preferredDifficulty: 'Medium',
    preferredQuestionCount: 5,
    preferredTimeLimit: 15
  };
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultPrefs, ...parsed };
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
  return defaultPrefs;
};

export const saveStoredPreferences = (preferences) => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

/**
 * Theme Preference Storage ('light' | 'dark' | 'system')
 */
export const getStoredThemeMode = () => {
  try {
    return localStorage.getItem(THEME_KEY) || 'light';
  } catch {
    return 'light';
  }
};

export const saveStoredThemeMode = (mode) => {
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch (error) {
    console.error('Error saving theme mode:', error);
  }
};

export const getStoredTheme = () => getStoredThemeMode();
export const saveStoredTheme = (theme) => saveStoredThemeMode(theme);

const LEARNING_ACTIVITY_KEY = 'quiz_generator_learning_activity';

/**
 * Returns YYYY-MM-DD in local time zone
 */
export const getTodayLocalDateString = (dateObj = new Date()) => {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Learning Activity Storage
 * Persists unique local calendar activity dates (YYYY-MM-DD) for streak calculation
 */
export const getLearningActivityDates = () => {
  try {
    const saved = localStorage.getItem(LEARNING_ACTIVITY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d));
      }
    }
  } catch (error) {
    console.error('Error loading learning activity from localStorage:', error);
  }
  return [];
};

export const recordLearningActivity = () => {
  try {
    const currentDates = getLearningActivityDates();
    const todayStr = getTodayLocalDateString();
    if (!currentDates.includes(todayStr)) {
      const updatedDates = [todayStr, ...currentDates];
      localStorage.setItem(LEARNING_ACTIVITY_KEY, JSON.stringify(updatedDates));
      return updatedDates;
    }
    return currentDates;
  } catch (error) {
    console.error('Error recording learning activity:', error);
    return getLearningActivityDates();
  }
};

export const clearLearningActivity = () => {
  try {
    localStorage.removeItem(LEARNING_ACTIVITY_KEY);
  } catch (error) {
    console.error('Error clearing learning activity:', error);
  }
  return [];
};
