/**
 * Storage Service
 * Handles persistence for Quiz Generator flashcards, quiz history, and user preferences
 */

import { defaultFlashcards } from '../data/defaultFlashcards';

const FLASHCARDS_KEY = 'quiz_generator_flashcards';
const QUIZ_HISTORY_KEY = 'quiz_generator_history';
const THEME_KEY = 'quiz_generator_theme';

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
 * Calculate average percentage score across completed quizzes
 */
export const getAverageQuizScore = (history) => {
  if (!Array.isArray(history) || history.length === 0) return 0;
  const totalPercentage = history.reduce((sum, item) => sum + (item.percentage || 0), 0);
  return Math.round(totalPercentage / history.length);
};

export const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || 'light';
  } catch {
    return 'light';
  }
};

export const saveStoredTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};
