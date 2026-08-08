/**
 * Quizelle Heuristic Difficulty Engine - Phase 12
 * Local, deterministic, explainable initial difficulty estimator for flashcards.
 * Analyzes question & answer text signals without external dependencies or AI APIs.
 */

// Keyword & Pattern Dictionaries
const HIGH_COMPLEXITY_PATTERNS = [
  /\banalyze\b/i,
  /\bevaluate\b/i,
  /\bderive\b/i,
  /\bprove\b/i,
  /\barchitecture of\b/i,
  /\bworking of\b/i,
  /\binner workings\b/i,
  /\bdeep dive\b/i
];

const MEDIUM_COMPLEXITY_PATTERNS = [
  /\bexplain\b/i,
  /\bcompare\b/i,
  /\bdifferentiate\b/i,
  /\bcontrast\b/i,
  /\bdiscuss\b/i,
  /\bdescribe\b/i,
  /\bimplement\b/i,
  /\bhow does\b/i,
  /\bwhy does\b/i,
  /\bwhy is\b/i
];

const DEFINITION_PATTERNS = [
  /^what is\b/i,
  /^define\b/i,
  /^what does\b/i,
  /^who invented\b/i,
  /^what is the full form of\b/i,
  /\bstand for\b/i
];

const COMPARISON_PATTERNS = [
  /\bcompare\b/i,
  /\bdifferentiate\b/i,
  /\bdifference between\b/i,
  /\bversus\b/i,
  /\bvs\.?\b/i,
  /\bcontrast\b/i
];

const MULTI_PART_PATTERNS = [
  /\badvantages and disadvantages\b/i,
  /\bpros and cons\b/i,
  /\bdefine and explain\b/i,
  /\bsteps and benefits\b/i,
  /\bcauses and effects\b/i
];

const TECHNICAL_TERMS = [
  'algorithm', 'recursion', 'normalization', 'transaction', 'concurrency',
  'polymorphism', 'inheritance', 'encapsulation', 'virtualization', 'cryptography',
  'tcp', 'udp', 'dns', 'http', 'https', 'operating system', 'data structure',
  'database', 'dbms', 'compiler', 'networking', 'closure', 'lexical', 'asynchronous',
  'promise', 'async', 'await', 'index', 'deadlock', 'semaphore', 'mutex',
  'bytecode', 'garbage collection', 'abstraction', 'socket', 'thread'
];

/**
 * Estimates initial difficulty for a flashcard based on text content.
 * 
 * @param {Object} params
 * @param {string} params.question - Card question text
 * @param {string} params.answer - Card answer text
 * @param {string} [params.category] - Optional category string
 * @returns {Object} Heuristic result object containing difficulty, confidence, score, signals, and reason
 */
export const estimateInitialDifficulty = ({ question = '', answer = '', category = '' }) => {
  const qText = (question || '').trim();
  const aText = (answer || '').trim();
  const catText = (category || '').trim();

  const qLength = qText.length;
  const aLength = aText.length;

  const qWords = qText.split(/\s+/).filter(Boolean);
  const aWords = aText.split(/\s+/).filter(Boolean);

  // --- SIGNAL 1: Question Length ---
  let qLenScore = 0;
  if (qLength > 75 || qWords.length > 12) {
    qLenScore = 2;
  } else if (qLength > 35 || qWords.length > 6) {
    qLenScore = 1;
  }

  // --- SIGNAL 2: Answer Length ---
  let aLenScore = 0;
  if (aLength < 35 && aWords.length <= 6) {
    aLenScore = -1; // Very short factual answer biases toward Easy
  } else if (aLength > 120 || aWords.length > 20) {
    aLenScore = 2; // Detailed explanatory answer increases complexity
  }

  // --- SIGNAL 3: Question Complexity (Action Verbs) ---
  let complexityScore = 0;
  let hasHighComplexity = false;

  for (const pat of HIGH_COMPLEXITY_PATTERNS) {
    if (pat.test(qText)) {
      complexityScore += 3;
      hasHighComplexity = true;
      break;
    }
  }

  if (!hasHighComplexity) {
    for (const pat of MEDIUM_COMPLEXITY_PATTERNS) {
      if (pat.test(qText)) {
        complexityScore += 1.5;
        break;
      }
    }
  }

  // --- SIGNAL 4: Definition / Recall Pattern ---
  let definitionPattern = false;
  let defScore = 0;
  for (const pat of DEFINITION_PATTERNS) {
    if (pat.test(qText)) {
      definitionPattern = true;
      defScore = -1.5; // Recall questions bias toward Easy
      break;
    }
  }

  // --- SIGNAL 5: Technical Term Density ---
  let technicalTermCount = 0;
  const qLower = qText.toLowerCase();
  for (const term of TECHNICAL_TERMS) {
    if (qLower.includes(term.toLowerCase())) {
      technicalTermCount += 1;
    }
  }

  let techScore = 0;
  if (technicalTermCount >= 3) {
    techScore = 2;
  } else if (technicalTermCount >= 1) {
    techScore = 1;
  }

  // Optional category complexity hint (e.g. System Architecture / Operating Systems)
  if (catText.toLowerCase().includes('architecture') || catText.toLowerCase().includes('operating system')) {
    techScore += 0.5;
  }

  // --- SIGNAL 6: Multi-Concept & Comparison Detection ---
  let isComparison = false;
  for (const pat of COMPARISON_PATTERNS) {
    if (pat.test(qText)) {
      isComparison = true;
      break;
    }
  }

  const isMultiConcept = isComparison || (qText.includes(' and ') && technicalTermCount >= 2);
  const comparisonScore = isComparison ? 2 : 0;
  const multiConceptScore = isMultiConcept && !isComparison ? 1 : 0;

  // --- SIGNAL 7: Multi-Part Questions ---
  let isMultiPart = false;
  for (const pat of MULTI_PART_PATTERNS) {
    if (pat.test(qText)) {
      isMultiPart = true;
      break;
    }
  }
  const multiPartScore = isMultiPart ? 1.5 : 0;

  // --- TOTAL SCORE CALCULATION ---
  const rawScore = qLenScore + aLenScore + complexityScore + defScore + techScore + comparisonScore + multiConceptScore + multiPartScore;
  const finalScore = Math.max(0, Math.round(rawScore * 10) / 10);

  // --- SCORE BANDS & CLASSIFICATION ---
  let difficulty;
  if (finalScore < 3.5) {
    difficulty = 'Easy';
  } else if (finalScore >= 7.0) {
    difficulty = 'Hard';
  } else {
    difficulty = 'Medium';
  }

  // --- CONFIDENCE ASSESSMENT ---
  let confidence = 'medium';
  if (definitionPattern && aLength < 45 && technicalTermCount <= 1) {
    confidence = 'high'; // Strong recall signal
  } else if ((hasHighComplexity || isComparison) && (aLength > 80 || technicalTermCount >= 2)) {
    confidence = 'high'; // Strong complexity signal
  } else if (qText.length < 15 || (definitionPattern && hasHighComplexity)) {
    confidence = 'low'; // Conflicting or ambiguous text
  }

  // --- EXPLAINABLE REASON GENERATOR ---
  let reason = 'Balanced question and answer length.';
  if (definitionPattern && aLength < 50) {
    reason = 'Simple definition question with a short factual answer.';
  } else if (isComparison) {
    reason = 'Multi-concept comparison question requiring analytical distinction.';
  } else if (hasHighComplexity) {
    reason = 'High-complexity analytical question requiring detailed explanation.';
  } else if (isMultiConcept || isMultiPart) {
    reason = 'Multi-concept topic covering multiple related technical ideas.';
  } else if (technicalTermCount >= 2 && difficulty !== 'Easy') {
    reason = 'Multiple technical concepts detected with moderate question complexity.';
  } else if (difficulty === 'Easy') {
    reason = 'Direct recall question with concise answer text.';
  } else if (difficulty === 'Hard') {
    reason = 'Comprehensive conceptual topic with detailed answer requirements.';
  }

  return {
    difficulty,
    difficultySource: 'heuristic',
    confidence,
    score: finalScore,
    signals: {
      questionLength: qLength,
      answerLength: aLength,
      questionComplexity: complexityScore,
      answerComplexity: aLenScore,
      technicalTerms: technicalTermCount,
      multiConcept: isMultiConcept,
      definitionPattern
    },
    reason
  };
};

/**
 * Calculates personalized difficulty ("Your Difficulty") based on actual quiz attempts.
 * Uses a Bayesian-smoothed accuracy formula centered on initial difficulty to prevent
 * volatile flips on early attempts.
 * @param {Object} card - Flashcard object
 * @returns {Object} { personalizedDifficulty, confidence, accuracy, smoothedAccuracy, attempts, correct, incorrect }
 */
export const calculatePersonalizedDifficulty = (card = {}) => {
  const stats = card.difficultyStats || { attempts: 0, correct: 0, incorrect: 0 };
  const attempts = Math.max(0, parseInt(stats.attempts, 10) || 0);
  const correct = Math.max(0, parseInt(stats.correct, 10) || 0);

  // Confidence determination (Step 6)
  let confidence = 'insufficient';
  if (attempts >= 3) {
    confidence = 'established';
  } else if (attempts >= 1) {
    confidence = 'emerging';
  }

  if (attempts === 0) {
    return {
      personalizedDifficulty: null,
      confidence: 'insufficient',
      accuracy: 0,
      smoothedAccuracy: 0,
      attempts: 0,
      correct: 0,
      incorrect: 0
    };
  }

  const rawAccuracy = attempts > 0 ? (correct / attempts) : 0;

  // Initial difficulty prior weighting (2 pseudo-attempts to smooth early swings)
  const baseDiffLower = (card.difficulty || 'Medium').toLowerCase();
  let priorCorrect = 1.4;
  const priorTotal = 2.0;

  if (baseDiffLower === 'easy') priorCorrect = 1.8;
  else if (baseDiffLower === 'hard') priorCorrect = 0.8;

  const smoothedAccuracy = (correct + priorCorrect) / (attempts + priorTotal);

  // Personalized difficulty bands
  let personalizedDifficulty;
  if (smoothedAccuracy >= 0.82) {
    personalizedDifficulty = 'Easy';
  } else if (smoothedAccuracy < 0.58) {
    personalizedDifficulty = 'Hard';
  } else {
    personalizedDifficulty = 'Medium';
  }

  return {
    personalizedDifficulty,
    confidence,
    accuracy: Math.round(rawAccuracy * 100) / 100,
    smoothedAccuracy: Math.round(smoothedAccuracy * 100) / 100,
    attempts,
    correct,
    incorrect: Math.max(0, attempts - correct)
  };
};

/**
 * Pure function that returns an updated card object with recorded performance attempt
 * @param {Object} card - Original flashcard object
 * @param {boolean} isCorrect - Whether the user answered correctly
 * @returns {Object} New card object with updated difficultyStats, lastAttemptAt, and personalizedDifficulty
 */
export const recordDifficultyAttempt = (card = {}, isCorrect = false) => {
  const currentStats = card.difficultyStats || { attempts: 0, correct: 0, incorrect: 0 };
  const prevAttempts = Math.max(0, parseInt(currentStats.attempts, 10) || 0);
  const prevCorrect = Math.max(0, parseInt(currentStats.correct, 10) || 0);
  const prevIncorrect = Math.max(0, parseInt(currentStats.incorrect, 10) || 0);

  const newAttempts = prevAttempts + 1;
  const newCorrect = isCorrect ? prevCorrect + 1 : prevCorrect;
  const newIncorrect = !isCorrect ? prevIncorrect + 1 : prevIncorrect;

  const updatedStats = {
    attempts: newAttempts,
    correct: newCorrect,
    incorrect: newIncorrect
  };

  const updatedCardTemp = {
    ...card,
    difficultyStats: updatedStats
  };

  const personalized = calculatePersonalizedDifficulty(updatedCardTemp);

  return {
    ...card,
    difficultyStats: updatedStats,
    lastAttemptAt: new Date().toISOString(),
    personalizedDifficulty: personalized.personalizedDifficulty,
    personalizedConfidence: personalized.confidence
  };
};
