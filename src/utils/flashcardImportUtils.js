/**
 * Utility functions for parsing, validating, and deduplicating bulk flashcard imports.
 */

/**
 * Normalizes question text for deterministic duplicate detection
 * Trims, lowercases, collapses whitespace, and strips outer punctuation.
 */
export const normalizeQuestion = (text = '') => {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^[^\w]+|[^\w]+$/g, '');
};

/**
 * Normalizes difficulty level string to standard Title-case ("Easy", "Medium", "Hard")
 */
export const normalizeDifficulty = (diffStr) => {
  if (!diffStr || typeof diffStr !== 'string') return null;
  const lower = diffStr.trim().toLowerCase();
  if (lower === 'easy') return 'Easy';
  if (lower === 'medium') return 'Medium';
  if (lower === 'hard') return 'Hard';
  return null;
};

/**
 * Parses raw text input into raw candidate records.
 * Supports:
 *   1. JSON (array or single object)
 *   2. Simple Q/A text format (Q: ... A: ... or Question: ... Answer: ...)
 */
export const parseRawImportText = (rawText = '') => {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { success: false, records: [], format: 'none', error: 'Input is empty.' };
  }

  // Attempt 1: Parse as JSON
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      const records = items.map((item) => ({
        question: typeof item.question === 'string' ? item.question : (item.q || item.prompt || ''),
        answer: typeof item.answer === 'string' ? item.answer : (item.a || item.response || ''),
        category: typeof item.category === 'string' ? item.category : null,
        difficulty: typeof item.difficulty === 'string' ? item.difficulty : null,
        raw: item
      }));

      return { success: true, records, format: 'json', error: null };
    } catch (err) {
      if (trimmed.startsWith('[')) {
        return {
          success: false,
          records: [],
          format: 'json',
          error: `Invalid JSON format: ${err.message}`
        };
      }
    }
  }

  // Attempt 2: Parse Simple Q/A Text
  // Looks for blocks matching Q: ... A: ... or Question: ... Answer: ...
  const qaRegex = /(?:^|\n)\s*(?:Q|Question)\s*[:\d.-]*\s*(.+?)\n\s*(?:A|Answer)\s*[:\d.-]*\s*(.+?)(?=\n\s*(?:Q|Question)\s*[:\d.-]*|\n*$)/gis;

  const records = [];
  let match;

  while ((match = qaRegex.exec(trimmed)) !== null) {
    const qText = match[1] ? match[1].trim() : '';
    const aText = match[2] ? match[2].trim() : '';

    if (qText || aText) {
      records.push({
        question: qText,
        answer: aText,
        category: null,
        difficulty: null,
        raw: match[0]
      });
    }
  }

  if (records.length > 0) {
    return { success: true, records, format: 'text', error: null };
  }

  return {
    success: false,
    records: [],
    format: 'unknown',
    error: 'Could not detect valid JSON array or Q/A text blocks.\n\nSupported Formats:\n1. JSON array: [{"question":"...","answer":"..."}]\n2. Simple Q/A text:\nQ: What is TCP?\nA: Transmission Control Protocol'
  };
};

/**
 * Validates candidate records and checks against existing flashcards for duplicates.
 * Returns a full preview object with summary counts and status per item.
 */
export const validateAndDeduplicateImport = ({
  records = [],
  existingCards = [],
  fallbackCategory = 'General',
  fallbackDifficulty = 'Medium'
}) => {
  const existingQuestionSet = new Set(
    existingCards.map((c) => normalizeQuestion(c.question))
  );

  const batchQuestionSet = new Set();

  let validCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  const items = records.map((rec, index) => {
    const questionTrimmed = (rec.question || '').trim();
    const answerTrimmed = (rec.answer || '').trim();

    // Check validity
    if (!questionTrimmed || questionTrimmed.length < 3) {
      invalidCount += 1;
      return {
        id: `import-temp-${index + 1}`,
        question: questionTrimmed || '(Missing Question)',
        answer: answerTrimmed || '(Missing Answer)',
        category: (rec.category || fallbackCategory || 'General').trim(),
        difficulty: normalizeDifficulty(rec.difficulty) || fallbackDifficulty || 'Medium',
        difficultySource: rec.difficulty ? 'ai' : 'manual',
        status: 'invalid',
        invalidReason: !questionTrimmed ? 'Question is required' : 'Question must be at least 3 characters',
        selected: false
      };
    }

    if (!answerTrimmed || answerTrimmed.length < 2) {
      invalidCount += 1;
      return {
        id: `import-temp-${index + 1}`,
        question: questionTrimmed,
        answer: answerTrimmed || '(Missing Answer)',
        category: (rec.category || fallbackCategory || 'General').trim(),
        difficulty: normalizeDifficulty(rec.difficulty) || fallbackDifficulty || 'Medium',
        difficultySource: rec.difficulty ? 'ai' : 'manual',
        status: 'invalid',
        invalidReason: !answerTrimmed ? 'Answer is required' : 'Answer must be at least 2 characters',
        selected: false
      };
    }

    const normQ = normalizeQuestion(questionTrimmed);

    // Check if duplicate (against existing cards or within this batch)
    const isDupInExisting = existingQuestionSet.has(normQ);
    const isDupInBatch = batchQuestionSet.has(normQ);

    batchQuestionSet.add(normQ);

    const normDiff = normalizeDifficulty(rec.difficulty);
    const finalDiff = normDiff || fallbackDifficulty || 'Medium';
    const diffSource = normDiff ? 'ai' : 'manual';
    const finalCat = (rec.category || '').trim() || fallbackCategory || 'General';

    if (isDupInExisting || isDupInBatch) {
      duplicateCount += 1;
      return {
        id: `import-temp-${index + 1}`,
        question: questionTrimmed,
        answer: answerTrimmed,
        category: finalCat,
        difficulty: finalDiff,
        difficultySource: diffSource,
        status: 'duplicate',
        invalidReason: isDupInExisting
          ? 'Question already exists in flashcard collection'
          : 'Duplicate question within import batch',
        selected: false // Duplicates excluded by default
      };
    }

    validCount += 1;
    return {
      id: `import-temp-${index + 1}`,
      question: questionTrimmed,
      answer: answerTrimmed,
      category: finalCat,
      difficulty: finalDiff,
      difficultySource: diffSource,
      status: 'valid',
      invalidReason: null,
      selected: true // Valid new cards selected by default
    };
  });

  return {
    totalDetected: records.length,
    validCount,
    duplicateCount,
    invalidCount,
    items
  };
};
