/**
 * Validation Helpers for Flashcard Form
 */

export const validateFlashcardForm = ({ question, answer, category, difficulty }) => {
  const errors = {};

  const trimmedQuestion = (question || '').trim();
  const trimmedAnswer = (answer || '').trim();
  const trimmedCategory = (category || '').trim();
  const trimmedDifficulty = (difficulty || '').trim();

  if (!trimmedQuestion) {
    errors.question = 'Question is required.';
  } else if (trimmedQuestion.length < 3) {
    errors.question = 'Question must be at least 3 characters.';
  }

  if (!trimmedAnswer) {
    errors.answer = 'Answer is required.';
  } else if (trimmedAnswer.length < 2) {
    errors.answer = 'Answer must be at least 2 characters.';
  }

  if (!trimmedCategory) {
    errors.category = 'Category is required.';
  }

  if (!trimmedDifficulty) {
    errors.difficulty = 'Difficulty level is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
