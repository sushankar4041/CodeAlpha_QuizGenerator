/**
 * Quizelle Adaptive Quiz Engine Utilities - Phase 14
 * Deterministic algorithms for Weak Areas selection, Adaptive difficulty balancing,
 * and card learning weight calculation.
 */

import { calculatePersonalizedDifficulty } from './difficultyUtils.js';

/**
 * Calculates a numerical learning weight for a flashcard.
 * Higher weight = higher priority for adaptive practice.
 * 
 * @param {Object} card - Flashcard object
 * @returns {number} Weight score (0 - 100)
 */
export const calculateCardLearningWeight = (card = {}) => {
  const personalized = calculatePersonalizedDifficulty(card);
  const baseDiff = (card.difficulty || 'Medium').toLowerCase();
  const persDiff = (personalized.personalizedDifficulty || baseDiff).toLowerCase();
  const attempts = card.difficultyStats?.attempts || 0;
  const accuracy = personalized.accuracy;

  let weight = 50; // default baseline

  // Hard / Struggling cards get highest priority
  if (persDiff === 'hard') {
    weight += 35;
  } else if (persDiff === 'medium') {
    weight += 15;
  } else if (persDiff === 'easy') {
    weight -= 20; // lower priority for mastered cards, but not zero for reinforcement
  }

  // Low accuracy bonus
  if (attempts >= 1) {
    if (accuracy < 0.5) {
      weight += 20;
    } else if (accuracy < 0.7) {
      weight += 10;
    } else if (accuracy >= 0.9) {
      weight -= 10;
    }
  }

  // Established confidence bonus for struggling cards
  if (personalized.confidence === 'established' && persDiff === 'hard') {
    weight += 10;
  }

  return Math.max(5, Math.min(100, weight));
};

/**
 * Selects flashcards for WEAK AREAS mode.
 * Prioritizes:
 *   1. Established Hard cards with low accuracy
 *   2. Medium cards with moderate accuracy
 *   3. Unassessed or emerging cards if weak pool is small
 * 
 * @param {Array} flashcards - Array of user flashcards
 * @param {Object} options - { category, requestedCount }
 * @returns {Object} { cards, fallbackUsed, reason }
 */
export const selectWeakAreaCards = (flashcards = [], { category = 'All Categories', requestedCount = 5 }) => {
  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    return { cards: [], fallbackUsed: false, reason: 'EMPTY_COLLECTION' };
  }

  // Filter by category first if specified
  let candidateCards = flashcards;
  if (category && category.toLowerCase() !== 'all categories') {
    candidateCards = candidateCards.filter(
      (c) => c.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (candidateCards.length === 0) {
    return { cards: [], fallbackUsed: false, reason: 'NO_MATCHING_CARDS' };
  }

  // Calculate learning weights for all candidate cards
  const weightedCards = candidateCards.map((card) => {
    const weight = calculateCardLearningWeight(card);
    return { card, weight };
  });

  // Filter cards that are assessed as struggling or weak (attempts >= 1 and (personalized === Hard or accuracy < 0.75))
  const weakAssessed = weightedCards.filter(({ card }) => {
    const attempts = card.difficultyStats?.attempts || 0;
    const pers = calculatePersonalizedDifficulty(card);
    const persDiff = (pers.personalizedDifficulty || card.difficulty).toLowerCase();
    return attempts >= 1 && (persDiff === 'hard' || pers.accuracy < 0.75);
  });

  let selected = [];
  let fallbackUsed = false;

  if (weakAssessed.length > 0) {
    // Sort weak assessed cards by weight descending
    weakAssessed.sort((a, b) => b.weight - a.weight || a.card.id.localeCompare(b.card.id));
    selected = weakAssessed.slice(0, Math.min(requestedCount, weakAssessed.length)).map((item) => item.card);
  }

  // If fewer weak cards exist than requested count, supplement with remaining weighted candidate cards
  if (selected.length < requestedCount && selected.length < candidateCards.length) {
    fallbackUsed = weakAssessed.length === 0;
    const selectedIds = new Set(selected.map((c) => c.id));
    const remaining = weightedCards
      .filter(({ card }) => !selectedIds.has(card.id))
      .sort((a, b) => b.weight - a.weight || a.card.id.localeCompare(b.card.id));

    for (const { card } of remaining) {
      if (selected.length >= Math.min(requestedCount, candidateCards.length)) break;
      selected.push(card);
    }
  }

  return {
    cards: selected,
    fallbackUsed,
    reason: fallbackUsed
      ? 'Not enough performance data yet. Quizelle is using your available cards while you build your learning history.'
      : 'Prioritizing flashcards you are currently struggling with based on your quiz history.'
  };
};

/**
 * Selects flashcards for ADAPTIVE mode.
 * Balances:
 *   - ~50% Hard / Struggling cards
 *   - ~30% Medium / Developing cards
 *   - ~20% Easy / Mastered cards (reinforcement)
 * 
 * @param {Array} flashcards - Array of user flashcards
 * @param {Object} options - { category, requestedCount }
 * @returns {Object} { cards, reason }
 */
export const selectAdaptiveCards = (flashcards = [], { category = 'All Categories', requestedCount = 5 }) => {
  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    return { cards: [], reason: 'EMPTY_COLLECTION' };
  }

  let candidateCards = flashcards;
  if (category && category.toLowerCase() !== 'all categories') {
    candidateCards = candidateCards.filter(
      (c) => c.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (candidateCards.length === 0) {
    return { cards: [], reason: 'NO_MATCHING_CARDS' };
  }

  const count = Math.min(requestedCount, candidateCards.length);

  // Group candidate cards by effective difficulty (prefer personalized if attempts >= 1)
  const hardPool = [];
  const mediumPool = [];
  const easyPool = [];

  candidateCards.forEach((card) => {
    const attempts = card.difficultyStats?.attempts || 0;
    const pers = calculatePersonalizedDifficulty(card);
    const effDiff = (attempts >= 1 && pers.personalizedDifficulty ? pers.personalizedDifficulty : card.difficulty).toLowerCase();

    if (effDiff === 'hard') hardPool.push(card);
    else if (effDiff === 'easy') easyPool.push(card);
    else mediumPool.push(card);
  });

  // Calculate target quotas (~50% Hard, ~30% Medium, ~20% Easy)
  const hardTarget = Math.max(1, Math.round(count * 0.5));
  const mediumTarget = Math.max(1, Math.round(count * 0.3));
  const easyTarget = Math.max(0, count - hardTarget - mediumTarget);

  const selected = [];
  const selectedIds = new Set();

  const addFromPool = (pool, targetCount) => {
    const sorted = [...pool].sort((a, b) => calculateCardLearningWeight(b) - calculateCardLearningWeight(a));
    for (const card of sorted) {
      if (selected.length >= count) break;
      if (selectedIds.has(card.id)) continue;
      if (selected.filter((c) => pool.includes(c)).length >= targetCount) break;
      selected.push(card);
      selectedIds.add(card.id);
    }
  };

  addFromPool(hardPool, hardTarget);
  addFromPool(mediumPool, mediumTarget);
  addFromPool(easyPool, easyTarget);

  // Fill remaining slots if any pool was short
  if (selected.length < count) {
    const remaining = [...candidateCards]
      .filter((c) => !selectedIds.has(c.id))
      .sort((a, b) => calculateCardLearningWeight(b) - calculateCardLearningWeight(a));

    for (const card of remaining) {
      if (selected.length >= count) break;
      selected.push(card);
      selectedIds.add(card.id);
    }
  }

  return {
    cards: selected,
    reason: 'Quizelle adjusted question selection dynamically using your learning history.'
  };
};
