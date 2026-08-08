import { useState, useEffect, useRef } from 'react';
import { validateFlashcardForm } from '../utils/validation';

/**
 * FlashcardForm Component - Phase 6E
 * Modal form for creating new flashcards or editing existing flashcards.
 * Enhanced with keyboard Escape close support, auto-focus, and full accessibility labels.
 */
export default function FlashcardForm({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  existingCategories = []
}) {
  const isEditing = Boolean(initialData);
  const questionInputRef = useRef(null);

  const [question, setQuestion] = useState(() => initialData?.question || '');
  const [answer, setAnswer] = useState(() => initialData?.answer || '');
  const [difficulty, setDifficulty] = useState(() => initialData?.difficulty || 'Easy');

  const initialCat = initialData?.category || existingCategories[0] || 'JavaScript';
  const isExistingCat = existingCategories.includes(initialCat);

  const [category, setCategory] = useState(() => (isExistingCat ? initialCat : 'CUSTOM'));
  const [customCategory, setCustomCategory] = useState(() => (isExistingCat ? '' : initialCat));
  const [isCustomCategory, setIsCustomCategory] = useState(() => !isExistingCat);
  const [errors, setErrors] = useState({});

  // Escape key handler to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-focus question input when modal opens
  useEffect(() => {
    if (isOpen && questionInputRef.current) {
      questionInputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setIsCustomCategory(true);
      setCategory('CUSTOM');
    } else {
      setIsCustomCategory(false);
      setCategory(val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedCategoryName = isCustomCategory ? customCategory.trim() : category;

    const formData = {
      question: question.trim(),
      answer: answer.trim(),
      category: selectedCategoryName,
      difficulty
    };

    const { isValid, errors: validationErrors } = validateFlashcardForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      ...(isEditing ? { id: initialData.id, createdAt: initialData.createdAt, studiedCount: initialData.studiedCount } : {}),
      ...formData
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">
            {isEditing ? 'Edit Flashcard ✏️' : 'Create New Flashcard ➕'}
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flashcard-form">
          {/* Question Input */}
          <div className="form-group">
            <label htmlFor="card-question" className="form-label">
              Question <span className="required-star">*</span>
            </label>
            <textarea
              ref={questionInputRef}
              id="card-question"
              rows="3"
              className={`form-input ${errors.question ? 'input-error' : ''}`}
              placeholder="e.g. What is Closure in JavaScript?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
            {errors.question && <span className="error-text">{errors.question}</span>}
          </div>

          {/* Answer Input */}
          <div className="form-group">
            <label htmlFor="card-answer" className="form-label">
              Answer <span className="required-star">*</span>
            </label>
            <textarea
              id="card-answer"
              rows="4"
              className={`form-input ${errors.answer ? 'input-error' : ''}`}
              placeholder="e.g. A closure gives inner functions access to an outer function's scope..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
            />
            {errors.answer && <span className="error-text">{errors.answer}</span>}
          </div>

          {/* Category Selection */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="card-category" className="form-label">
                Category <span className="required-star">*</span>
              </label>
              <select
                id="card-category"
                className="form-select"
                value={isCustomCategory ? 'CUSTOM' : category}
                onChange={handleCategorySelect}
              >
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="CUSTOM">+ Add New Category</option>
              </select>
            </div>

            {isCustomCategory && (
              <div className="form-group flex-1">
                <label htmlFor="custom-category" className="form-label">
                  New Category Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="custom-category"
                  className={`form-input ${errors.category ? 'input-error' : ''}`}
                  placeholder="e.g. Node.js"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                />
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>
            )}
          </div>

          {/* Difficulty Radio Selector */}
          <div className="form-group">
            <label className="form-label">
              Difficulty Level <span className="required-star">*</span>
            </label>
            <div className="difficulty-radio-group">
              {['Easy', 'Medium', 'Hard'].map((lvl) => (
                <label
                  key={lvl}
                  className={`difficulty-radio-label ${difficulty === lvl ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={lvl}
                    checked={difficulty === lvl}
                    onChange={(e) => setDifficulty(e.target.value)}
                  />
                  <span>{lvl}</span>
                </label>
              ))}
            </div>
            {errors.difficulty && <span className="error-text">{errors.difficulty}</span>}
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {isEditing ? 'Update Flashcard' : 'Save Flashcard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
