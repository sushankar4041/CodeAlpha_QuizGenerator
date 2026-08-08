/**
 * Storage Service
 * Handles persistence for Quiz Generator flashcards and preferences
 */

import { defaultFlashcards } from '../data/defaultFlashcards';

const FLASHCARDS_KEY = 'quiz_generator_flashcards';
const THEME_KEY = 'quiz_generator_theme';

export const getStoredFlashcards = () => {
  try {
    const saved = localStorage.getItem(FLASHCARDS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading flashcards from localStorage:', error);
  }
  return defaultFlashcards;
};

export const saveStoredFlashcards = (cards) => {
  try {
    localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error('Error saving flashcards to localStorage:', error);
  }
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
