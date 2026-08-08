/**
 * Validation Helpers
 */

export const validateFlashcardForm = ({ question, answer, category }) => {
  const errors = {};

  if (!question || !question.trim()) {
    errors.question = 'Question is required.';
  } else if (question.trim().length < 5) {
    errors.question = 'Question must be at least 5 characters.';
  }

  if (!answer || !answer.trim()) {
    errors.answer = 'Answer is required.';
  } else if (answer.trim().length < 3) {
    errors.answer = 'Answer must be at least 3 characters.';
  }

  if (!category || !category.trim()) {
    errors.category = 'Category is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
