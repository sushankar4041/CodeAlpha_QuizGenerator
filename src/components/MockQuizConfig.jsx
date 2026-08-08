import { useState, useMemo, useEffect } from 'react';
import { getCategoryIcon } from '../utils/quizUtils';
import { getStoredPreferences } from '../services/storage';
import { SYSTEM_CATEGORIES, getAvailableQuestionCount } from '../services/questionBankService';

/**
 * Mock Quiz Configuration Component - Phase 8B
 * Allows user to select Category, Difficulty, Question Count, and Question Source.
 * System Question Bank is lazy-loaded on-demand while user flashcards are preserved.
 */
export default function MockQuizConfig({ flashcards = [], selectedQuizCardIds = null, preferences, onStartQuiz }) {
  const activePrefs = preferences || getStoredPreferences();

  const hasSelectedPool = Array.isArray(selectedQuizCardIds) && selectedQuizCardIds.length > 0;

  const [quizMode, setQuizMode] = useState('standard'); // 'standard' | 'weak_areas' | 'adaptive'
  const [questionSource, setQuestionSource] = useState(() => (hasSelectedPool ? 'selected' : 'system')); // 'system' | 'flashcards' | 'selected'
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDifficulty, setSelectedDifficulty] = useState(() => activePrefs.preferredDifficulty || 'All Difficulties');
  const [requestedCount, setRequestedCount] = useState(() => Number(activePrefs.preferredQuestionCount) || 5);
  const [availableCount, setAvailableCount] = useState(0);

  // Pool of cards based on source
  const activeFlashcardPool = useMemo(() => {
    if (questionSource === 'selected' && hasSelectedPool) {
      const set = new Set(selectedQuizCardIds);
      return flashcards.filter((c) => set.has(c.id));
    }
    return flashcards;
  }, [questionSource, hasSelectedPool, selectedQuizCardIds, flashcards]);

  // Dynamic category list based on source
  const categoriesList = useMemo(() => {
    if (questionSource === 'system' && quizMode === 'standard') {
      return SYSTEM_CATEGORIES;
    }
    const set = new Set(activeFlashcardPool.map((c) => c.category));
    return ['All Categories', ...Array.from(set)];
  }, [questionSource, quizMode, activeFlashcardPool]);

  const effectiveCategory = categoriesList.includes(selectedCategory) ? selectedCategory : 'All Categories';

  // Compute live available questions asynchronously for active settings
  useEffect(() => {
    let isCancelled = false;
    getAvailableQuestionCount({
      category: effectiveCategory,
      difficulty: selectedDifficulty,
      source: questionSource,
      mode: quizMode,
      flashcards: activeFlashcardPool
    }).then((count) => {
      if (!isCancelled) {
        setAvailableCount(count);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [effectiveCategory, selectedDifficulty, questionSource, quizMode, activeFlashcardPool]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (availableCount === 0) return;

    onStartQuiz({
      category: effectiveCategory,
      difficulty: selectedDifficulty,
      questionCount: Math.min(requestedCount, availableCount),
      source: questionSource,
      mode: quizMode,
      selectedCardIds: questionSource === 'selected' ? selectedQuizCardIds : null
    });
  };

  return (
    <div className="quiz-config-container animate-fade-in">
      <div className="config-header-card">
        <div className="concept-badge">Self-Assessment Engine</div>
        <h2 className="config-title">Configure Your Mock Quiz</h2>
        <p className="config-subtitle">
          Customize your quiz parameters below. Practice using Standard mode, target Weak Areas, or enable Quizelle Adaptive Engine.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="quiz-config-form">
        {/* 1. Quiz Mode Selection */}
        <div className="config-section">
          <label className="config-label">1. Select Quiz Mode</label>
          <div className="config-chips-grid mode-chips-grid" role="group" aria-label="Quiz Mode Selection">
            <button
              type="button"
              className={`config-chip mode-chip ${quizMode === 'standard' ? 'selected' : ''}`}
              onClick={() => setQuizMode('standard')}
              aria-pressed={quizMode === 'standard'}
            >
              <span className="chip-emoji" aria-hidden="true">🎯</span>
              <div className="mode-chip-info">
                <strong>Standard Mode</strong>
                <span className="mode-desc">Practice normally using your selected settings.</span>
              </div>
            </button>
            <button
              type="button"
              className={`config-chip mode-chip ${quizMode === 'weak_areas' ? 'selected' : ''}`}
              onClick={() => {
                setQuizMode('weak_areas');
                if (questionSource === 'system') setQuestionSource('flashcards');
              }}
              aria-pressed={quizMode === 'weak_areas'}
            >
              <span className="chip-emoji" aria-hidden="true">⚠️</span>
              <div className="mode-chip-info">
                <strong>Weak Areas</strong>
                <span className="mode-desc">Focus on cards you are currently struggling with.</span>
              </div>
            </button>
            <button
              type="button"
              className={`config-chip mode-chip ${quizMode === 'adaptive' ? 'selected' : ''}`}
              onClick={() => {
                setQuizMode('adaptive');
                if (questionSource === 'system') setQuestionSource('flashcards');
              }}
              aria-pressed={quizMode === 'adaptive'}
            >
              <span className="chip-emoji" aria-hidden="true">⚡</span>
              <div className="mode-chip-info">
                <strong>Quizelle Adaptive</strong>
                <span className="mode-desc">Adjusts question difficulty based on your performance.</span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Source Selector */}
        <div className="config-section">
          <label className="config-label">2. Select Question Source</label>
          <div className="config-chips-grid" role="group" aria-label="Question Source Selection">
            <button
              type="button"
              className={`config-chip ${questionSource === 'system' ? 'selected' : ''}`}
              onClick={() => setQuestionSource('system')}
              disabled={quizMode !== 'standard'}
              aria-pressed={questionSource === 'system'}
            >
              <span className="chip-emoji" aria-hidden="true">🌐</span>
              <span>Quizelle System Question Bank</span>
            </button>
            <button
              type="button"
              className={`config-chip ${questionSource === 'flashcards' ? 'selected' : ''}`}
              onClick={() => setQuestionSource('flashcards')}
              aria-pressed={questionSource === 'flashcards'}
            >
              <span className="chip-emoji" aria-hidden="true">🎴</span>
              <span>My Personal Flashcards ({flashcards.length})</span>
            </button>
            {hasSelectedPool && (
              <button
                type="button"
                className={`config-chip ${questionSource === 'selected' ? 'selected' : ''}`}
                onClick={() => setQuestionSource('selected')}
                aria-pressed={questionSource === 'selected'}
              >
                <span className="chip-emoji" aria-hidden="true">🎯</span>
                <span>Selected Cards ({selectedQuizCardIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Category Selection */}
        <div className="config-section">
          <label className="config-label">3. Select Category / Topic</label>
          <div className="config-chips-grid" role="group" aria-label="Category Selection">
            {categoriesList.map((catName) => {
              const isSelected = effectiveCategory === catName;
              return (
                <button
                  key={catName}
                  type="button"
                  className={`config-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(catName)}
                  aria-pressed={isSelected}
                >
                  <span className="chip-emoji" aria-hidden="true">
                    {catName === 'All Categories' ? '📚' : getCategoryIcon(catName)}
                  </span>
                  <span>{catName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Difficulty Selection */}
        <div className="config-section">
          <label className="config-label">4. Select Difficulty Level</label>
          {quizMode !== 'standard' ? (
            <div className="mode-auto-notice">
              ✨ Difficulty is dynamically selected by Quizelle Engine for {quizMode === 'weak_areas' ? 'Weak Areas' : 'Adaptive'} mode.
            </div>
          ) : (
            <div className="config-chips-grid" role="group" aria-label="Difficulty Selection">
              {['All Difficulties', 'Easy', 'Medium', 'Hard'].map((lvl) => {
                const isSelected = selectedDifficulty === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    className={`config-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDifficulty(lvl)}
                    aria-pressed={isSelected}
                  >
                    <span>{lvl}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Question Count Selection */}
        <div className="config-section">
          <label className="config-label">4. Number of Questions</label>
          <div className="config-chips-grid" role="group" aria-label="Question Count Selection">
            {[5, 10, 15].map((cnt) => {
              const isSelected = Number(requestedCount) === cnt;
              return (
                <button
                  key={cnt}
                  type="button"
                  className={`config-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => setRequestedCount(cnt)}
                  aria-pressed={isSelected}
                >
                  <span>{cnt} Questions</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Availability Counter & Warnings */}
        <div className="config-status-bar">
          <div className="status-availability-info">
            <span className="availability-icon" aria-hidden="true">🎯</span>
            <div>
              <strong>{availableCount} questions available</strong> with current settings.
              {availableCount < requestedCount && availableCount > 0 && (
                <span className="count-notice"> (Quiz will generate {availableCount} available questions)</span>
              )}
            </div>
          </div>

          {availableCount === 0 ? (
            <div className="zero-warning-box" role="alert">
              ⚠️ No questions match your selected category and difficulty filter. Please adjust your configuration choices above.
            </div>
          ) : (
            <button
              type="submit"
              className="btn btn-primary btn-start-quiz"
            >
              <span>Start Mock Quiz 🚀</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
