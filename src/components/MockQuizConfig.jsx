import { useState, useMemo } from 'react';
import { getCategoryIcon } from '../utils/quizUtils';
import { getStoredPreferences } from '../services/storage';

/**
 * Mock Quiz Configuration Component - Phase 6E
 * Allows user to select Category, Difficulty, and Question Count before generating quiz.
 * Pre-populates default preferences from storage and uses ARIA labels for accessibility.
 */
export default function MockQuizConfig({ flashcards = [], onStartQuiz, onNavigateToFlashcards }) {
  const initialPrefs = useMemo(() => getStoredPreferences(), []);

  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialPrefs.preferredDifficulty || 'All Difficulties');
  const [requestedCount, setRequestedCount] = useState(initialPrefs.preferredQuestionCount || 5);

  // Extract unique categories from flashcards collection
  const categoriesList = useMemo(() => {
    const set = new Set(flashcards.map((c) => c.category));
    return ['All Categories', ...Array.from(set)];
  }, [flashcards]);

  // Compute live available questions matching current selection
  const matchingCardsCount = useMemo(() => {
    let result = flashcards;
    if (selectedCategory && selectedCategory !== 'All Categories') {
      result = result.filter((c) => c.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (selectedDifficulty && selectedDifficulty !== 'All Difficulties') {
      result = result.filter((c) => c.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
    }
    return result.length;
  }, [flashcards, selectedCategory, selectedDifficulty]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (matchingCardsCount === 0) return;

    onStartQuiz({
      category: selectedCategory,
      difficulty: selectedDifficulty,
      questionCount: Math.min(requestedCount, matchingCardsCount)
    });
  };

  if (flashcards.length === 0) {
    return (
      <div className="concept-placeholder-container">
        <div className="concept-banner mock-quiz-banner">
          <div className="concept-badge">Self-Assessment Mode</div>
          <h2 className="concept-title">Mock Quiz Generator</h2>
          <p className="concept-description">
            You need flashcards in your deck before you can generate a mock quiz.
          </p>
        </div>
        <div className="concept-action-box">
          <div className="concept-status-info">
            <span className="status-icon" aria-hidden="true">📚</span>
            <div>
              <h4>No Flashcards Found</h4>
              <p>Add technical flashcards to your collection to unlock practice quizzes.</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNavigateToFlashcards}
          >
            <span>+ Create Flashcards</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-config-container animate-fade-in">
      <div className="config-header-card">
        <div className="concept-badge">Self-Assessment Engine</div>
        <h2 className="config-title">Configure Your Mock Quiz</h2>
        <p className="config-subtitle">
          Customize your quiz parameters below. Questions will be generated dynamically from your active flashcard deck.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="quiz-config-form">
        {/* Category Selection */}
        <div className="config-section">
          <label className="config-label">1. Select Category / Topic</label>
          <div className="config-chips-grid" role="group" aria-label="Category Selection">
            {categoriesList.map((catName) => {
              const isSelected = selectedCategory === catName;
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

        {/* Difficulty Selection */}
        <div className="config-section">
          <label className="config-label">2. Select Difficulty Level</label>
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
        </div>

        {/* Question Count Selection */}
        <div className="config-section">
          <label className="config-label">3. Number of Questions</label>
          <div className="config-chips-grid" role="group" aria-label="Question Count Selection">
            {[5, 10, 15].map((cnt) => {
              const isSelected = requestedCount === cnt;
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
              <strong>{matchingCardsCount} questions available</strong> with current settings.
              {matchingCardsCount < requestedCount && matchingCardsCount > 0 && (
                <span className="count-notice"> (Quiz will generate {matchingCardsCount} available questions)</span>
              )}
            </div>
          </div>

          {matchingCardsCount === 0 ? (
            <div className="zero-warning-box" role="alert">
              ⚠️ No flashcards match your selected category and difficulty filter. Please adjust your configuration choices above.
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
