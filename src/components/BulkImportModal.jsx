import { useState, useEffect } from 'react';
import { parseRawImportText, validateAndDeduplicateImport } from '../utils/flashcardImportUtils';

/**
 * BulkImportModal Component - Phase 11 Quizelle
 * Modal interface for bulk importing flashcards via JSON array or Q/A text format.
 * Includes format guidance, parsing, validation, duplicate detection, interactive preview,
 * and batch creation.
 */
export default function BulkImportModal({
  isOpen,
  onClose,
  onImportCards,
  existingCards = [],
  existingCategories = []
}) {
  const [step, setStep] = useState('input'); // 'input' | 'preview'
  const [rawInput, setRawInput] = useState('');
  const [fallbackCategory, setFallbackCategory] = useState(() => existingCategories[0] || 'General');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [fallbackDifficulty, setFallbackDifficulty] = useState('AUTO');

  const [parseError, setParseError] = useState('');
  const [previewResult, setPreviewResult] = useState(null);
  const [itemsState, setItemsState] = useState([]);

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

  if (!isOpen) return null;

  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setIsCustomCategory(true);
      setFallbackCategory('CUSTOM');
    } else {
      setIsCustomCategory(false);
      setFallbackCategory(val);
    }
  };

  const handleParseAndPreview = (e) => {
    e.preventDefault();
    setParseError('');

    const targetCategory = isCustomCategory ? customCategory.trim() || 'General' : fallbackCategory;

    const parsed = parseRawImportText(rawInput);
    if (!parsed.success) {
      setParseError(parsed.error);
      return;
    }

    const validated = validateAndDeduplicateImport({
      records: parsed.records,
      existingCards,
      fallbackCategory: targetCategory,
      fallbackDifficulty
    });

    // If user explicitly chose a manual fallback difficulty (not AUTO), override heuristic items
    let finalItems = validated.items;
    if (fallbackDifficulty !== 'AUTO') {
      finalItems = finalItems.map((item) => {
        if (!item.hasExplicitDifficulty) {
          return {
            ...item,
            difficulty: fallbackDifficulty,
            difficultySource: 'manual',
            difficultyReason: `Manually set via import fallback option (${fallbackDifficulty})`
          };
        }
        return item;
      });
    }

    setPreviewResult({ ...validated, items: finalItems });
    setItemsState(finalItems);
    setStep('preview');
  };

  const handleToggleItemSelection = (id) => {
    setItemsState((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.status === 'invalid') return item; // invalid items cannot be selected
          return { ...item, selected: !item.selected };
        }
        return item;
      })
    );
  };

  const handleItemDifficultyChange = (id, newDifficulty) => {
    setItemsState((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            difficulty: newDifficulty,
            difficultySource: 'manual',
            difficultyReason: `Manually overridden by user (${newDifficulty})`
          };
        }
        return item;
      })
    );
  };

  const handleSelectAllValid = () => {
    setItemsState((prev) =>
      prev.map((item) => (item.status !== 'invalid' ? { ...item, selected: true } : item))
    );
  };

  const handleDeselectAll = () => {
    setItemsState((prev) => prev.map((item) => ({ ...item, selected: false })));
  };

  const selectedItems = itemsState.filter((item) => item.selected);

  const handleFinalImport = () => {
    if (selectedItems.length === 0) return;

    const targetCategory = isCustomCategory ? customCategory.trim() || 'General' : fallbackCategory;

    const newCards = selectedItems.map((item, idx) => ({
      id: `fc-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
      question: item.question,
      answer: item.answer,
      category: item.category || targetCategory,
      difficulty: item.difficulty,
      difficultySource: item.difficultySource || 'manual',
      ...(item.difficultyConfidence ? { difficultyConfidence: item.difficultyConfidence } : {}),
      ...(item.difficultyReason ? { difficultyReason: item.difficultyReason } : {}),
      ...(item.difficultyScore !== undefined ? { difficultyScore: item.difficultyScore } : {}),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studiedCount: 0
    }));

    onImportCards(newCards);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container modal-lg animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-import-title"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 id="bulk-import-title" className="modal-title">
              Bulk Import Flashcards 📥
            </h3>
            <p className="modal-subtitle">
              Paste JSON or simple Q/A text format to parse and import multiple cards at once.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* STEP 1: INPUT FORM */}
        {step === 'input' && (
          <form onSubmit={handleParseAndPreview} className="flashcard-form">
            {parseError && <div className="zero-warning-box error">{parseError}</div>}

            {/* Input Textarea */}
            <div className="form-group">
              <label htmlFor="bulk-raw-input" className="form-label">
                Paste Flashcards Content <span className="required-star">*</span>
              </label>
              <textarea
                id="bulk-raw-input"
                rows="8"
                className="form-input code-font"
                placeholder={`--- FORMAT 1: JSON ---
[
  {
    "question": "What is TCP?",
    "answer": "Transmission Control Protocol",
    "category": "Networking",
    "difficulty": "medium"
  }
]

--- FORMAT 2: SIMPLE Q/A TEXT ---
Q: What is TCP?
A: Transmission Control Protocol

Q: What is UDP?
A: User Datagram Protocol`}
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                required
              />
            </div>

            {/* Fallback Selectors */}
            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="fallback-category" className="form-label">
                  Default Category (for unassigned cards)
                </label>
                <select
                  id="fallback-category"
                  className="form-select"
                  value={isCustomCategory ? 'CUSTOM' : fallbackCategory}
                  onChange={handleCategorySelect}
                >
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="CUSTOM">+ New Category</option>
                </select>
              </div>

              {isCustomCategory && (
                <div className="form-group flex-1">
                  <label htmlFor="custom-fallback-cat" className="form-label">
                    New Category Name
                  </label>
                  <input
                    type="text"
                    id="custom-fallback-cat"
                    className="form-input"
                    placeholder="e.g. System Architecture"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group flex-1">
                <label htmlFor="fallback-difficulty" className="form-label">
                  Default Difficulty Handling
                </label>
                <select
                  id="fallback-difficulty"
                  className="form-select"
                  value={fallbackDifficulty}
                  onChange={(e) => setFallbackDifficulty(e.target.value)}
                >
                  <option value="AUTO">✨ Auto Estimate (Quizelle Engine)</option>
                  <option value="Easy">Force Easy</option>
                  <option value="Medium">Force Medium</option>
                  <option value="Hard">Force Hard</option>
                </select>
              </div>
            </div>

            {/* Actions */}
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
                disabled={!rawInput.trim()}
              >
                Parse &amp; Preview →
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PREVIEW & IMPORT SUMMARY */}
        {step === 'preview' && previewResult && (
          <div className="bulk-preview-wrapper">
            {/* Summary Badges Header */}
            <div className="import-summary-bar">
              <div className="summary-chip detected">
                Detected: <strong>{previewResult.totalDetected}</strong>
              </div>
              <div className="summary-chip valid">
                New Valid: <strong>{previewResult.validCount}</strong>
              </div>
              <div className="summary-chip duplicate">
                Duplicates: <strong>{previewResult.duplicateCount}</strong>
              </div>
              <div className="summary-chip invalid">
                Invalid: <strong>{previewResult.invalidCount}</strong>
              </div>
            </div>

            <div className="preview-selection-toolbar">
              <span className="selection-count-text">
                Selected for import: <strong>{selectedItems.length}</strong> of {itemsState.length}
              </span>
              <div className="toolbar-btn-group">
                <button type="button" className="text-btn" onClick={handleSelectAllValid}>
                  Select All Valid
                </button>
                <button type="button" className="text-btn" onClick={handleDeselectAll}>
                  Deselect All
                </button>
              </div>
            </div>

            {/* Items Table Preview */}
            <div className="preview-table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th className="col-import">Import</th>
                    <th className="col-status">Status</th>
                    <th className="col-question">Question</th>
                    <th className="col-answer">Answer</th>
                    <th className="col-category">Category</th>
                    <th className="col-difficulty">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsState.map((item) => (
                    <tr
                      key={item.id}
                      className={`preview-row ${item.status} ${item.selected ? 'selected-row' : ''}`}
                    >
                      <td className="col-import center-cell">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          disabled={item.status === 'invalid'}
                          onChange={() => handleToggleItemSelection(item.id)}
                          aria-label={`Select question ${item.question}`}
                        />
                      </td>
                      <td className="col-status">
                        <span className={`status-tag ${item.status}`}>
                          {item.status === 'valid' && 'New'}
                          {item.status === 'duplicate' && 'Duplicate'}
                          {item.status === 'invalid' && 'Invalid'}
                        </span>
                      </td>
                      <td className="q-cell">
                        <div className="cell-main">{item.question}</div>
                        {item.invalidReason && (
                          <span className="cell-warning">{item.invalidReason}</span>
                        )}
                      </td>
                      <td className="a-cell">{item.answer}</td>
                      <td className="col-category">
                        <span className="cat-chip-sm">{item.category}</span>
                      </td>
                      <td className="col-difficulty" title={item.difficultyReason || ''}>
                        <div className="diff-cell-wrapper">
                          <select
                            className={`diff-select-sm ${item.difficulty.toLowerCase()}`}
                            value={item.difficulty}
                            onChange={(e) => handleItemDifficultyChange(item.id, e.target.value)}
                            title={item.difficultyReason || 'Click to override difficulty'}
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                          {item.difficultySource === 'heuristic' && (
                            <span className="diff-source-tag heuristic" title={item.difficultyReason}>
                              Quizelle Estimate
                            </span>
                          )}
                          {item.difficultySource === 'ai' && (
                            <span className="diff-source-tag ai" title="Explicitly provided in import payload">
                              Imported
                            </span>
                          )}
                          {item.difficultySource === 'manual' && (
                            <span className="diff-source-tag manual" title="Manually selected or overridden">
                              Manual
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="modal-actions space-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep('input')}
              >
                ← Edit Input
              </button>
              <div className="right-action-group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={selectedItems.length === 0}
                  onClick={handleFinalImport}
                >
                  Import {selectedItems.length} Cards 📥
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
