import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FlashcardList from './components/FlashcardList';
import MockQuiz from './components/MockQuiz';
import Statistics from './components/Statistics';
import LiveQuiz from './components/LiveQuiz';
import Settings from './components/Settings';
import ToastContainer from './components/Toast';
import {
  getStoredFlashcards,
  saveStoredFlashcards,
  resetStoredFlashcards,
  getStoredQuizHistory,
  saveQuizResult,
  clearStoredQuizHistory,
  getStoredLearnerProfile,
  saveStoredLearnerProfile,
  getStoredPreferences,
  saveStoredPreferences,
  getStoredThemeMode,
  saveStoredThemeMode,
  getLearningActivityDates,
  recordLearningActivity
} from './services/storage';
import { recordDifficultyAttempt } from './utils/difficultyUtils';
import './App.css';

/**
 * Main Application Component - Phase 6C
 * Coordinates Flashcards, Mock Quiz, Statistics, Live Quiz, Settings & Learner Profile,
 * Theme Mode (Light/Dark/System Auto-detection & OS listener), activeView navigation,
 * and global Toast Notification System.
 */
function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [themeMode, setThemeMode] = useState(getStoredThemeMode);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [flashcards, setFlashcards] = useState(getStoredFlashcards);
  const [quizHistory, setQuizHistory] = useState(getStoredQuizHistory);
  const [profile, setProfile] = useState(getStoredLearnerProfile);
  const [preferences, setPreferences] = useState(getStoredPreferences);
  const [learningActivity, setLearningActivity] = useState(getLearningActivityDates);

  // Phase 15 Temporary Selection & Quiz Pool State
  const [selectedFlashcardIds, setSelectedFlashcardIds] = useState([]);
  const [selectedQuizCardIds, setSelectedQuizCardIds] = useState(null);

  // Global Toast Notification State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => {
      // Keep maximum 4 toasts visible at a time
      const sliced = prev.length >= 4 ? prev.slice(prev.length - 3) : prev;
      return [...sliced, { id, type, message, duration }];
    });
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync theme attribute on document root (handling Light, Dark, and System Auto with dynamic OS listener)
  useEffect(() => {
    const applyTheme = () => {
      let resolved = themeMode;
      if (themeMode === 'system') {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = isSystemDark ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', resolved);
    };

    applyTheme();
    saveStoredThemeMode(themeMode);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  // Persist flashcards changes to localStorage
  const updateAndSaveCards = (newCards) => {
    setFlashcards(newCards);
    saveStoredFlashcards(newCards);
  };

  // Flashcard CRUD Handlers
  const handleAddCard = (cardData) => {
    const now = new Date().toISOString();
    const newCard = {
      id: `fc-${Date.now()}`,
      question: cardData.question,
      answer: cardData.answer,
      category: cardData.category,
      difficulty: cardData.difficulty,
      createdAt: now,
      updatedAt: now,
      studiedCount: 0
    };
    const updatedCollection = [newCard, ...flashcards];
    updateAndSaveCards(updatedCollection);
  };

  const handleBulkAddCards = (newCards) => {
    if (!Array.isArray(newCards) || newCards.length === 0) return;
    const updatedCollection = [...newCards, ...flashcards];
    updateAndSaveCards(updatedCollection);
  };

  const handleEditCard = (cardData) => {
    const now = new Date().toISOString();
    const updatedCollection = flashcards.map((card) => {
      if (card.id === cardData.id) {
        return {
          ...card,
          question: cardData.question,
          answer: cardData.answer,
          category: cardData.category,
          difficulty: cardData.difficulty,
          updatedAt: now
        };
      }
      return card;
    });
    updateAndSaveCards(updatedCollection);
  };

  const handleDeleteCard = (cardId) => {
    const updatedCollection = flashcards.filter((card) => card.id !== cardId);
    setSelectedFlashcardIds((prev) => prev.filter((id) => id !== cardId));
    updateAndSaveCards(updatedCollection);
  };

  const handleBatchDeleteCards = (targetIds = []) => {
    if (!Array.isArray(targetIds) || targetIds.length === 0) return;
    const idSet = new Set(targetIds);
    const updatedCollection = flashcards.filter((card) => !idSet.has(card.id));
    setSelectedFlashcardIds([]);
    updateAndSaveCards(updatedCollection);
    addToast(`${targetIds.length} flashcard${targetIds.length === 1 ? '' : 's'} deleted successfully.`, 'info');
  };

  const handleStartQuizFromSelected = (cardIds = []) => {
    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      addToast('Select at least one flashcard to start a quiz.', 'warning');
      return;
    }
    setSelectedQuizCardIds(cardIds);
    setActiveView('mock-quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStudyCard = (cardId) => {
    const updatedCollection = flashcards.map((card) => {
      if (card.id === cardId) {
        return {
          ...card,
          studiedCount: (card.studiedCount || 0) + 1,
          updatedAt: new Date().toISOString()
        };
      }
      return card;
    });
    updateAndSaveCards(updatedCollection);

    const updatedDates = recordLearningActivity();
    setLearningActivity(updatedDates);
  };

  // Quiz History Handlers
  const handleSaveQuizResult = (resultData, flashcardAttempts = []) => {
    const updatedHistory = saveQuizResult(resultData);
    setQuizHistory(updatedHistory);

    if (Array.isArray(flashcardAttempts) && flashcardAttempts.length > 0) {
      const attemptMap = new Map();
      flashcardAttempts.forEach((item) => {
        if (item && item.flashcardId) {
          attemptMap.set(item.flashcardId, item.isCorrect);
        }
      });

      const updatedCollection = flashcards.map((card) => {
        if (attemptMap.has(card.id)) {
          const isCorrect = attemptMap.get(card.id);
          return recordDifficultyAttempt(card, isCorrect);
        }
        return card;
      });

      updateAndSaveCards(updatedCollection);
    }

    const updatedDates = recordLearningActivity();
    setLearningActivity(updatedDates);
  };

  const handleClearQuizHistory = () => {
    const cleared = clearStoredQuizHistory();
    setQuizHistory(cleared);
  };

  const handleResetFlashcards = () => {
    const resetDeck = resetStoredFlashcards();
    setFlashcards(resetDeck);
  };

  // Profile & Preferences Handlers
  const handleUpdateProfile = (newProfile) => {
    setProfile(newProfile);
    saveStoredLearnerProfile(newProfile);
  };

  const handleUpdatePreferences = (newPrefs) => {
    setPreferences(newPrefs);
    saveStoredPreferences(newPrefs);
  };

  const handleUpdateThemeMode = (mode) => {
    setThemeMode(mode);
  };

  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  const handleNavigate = (viewId) => {
    setActiveView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Global Toast Notifications Stack */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Application Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleNavigate}
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Application Main Content Area */}
      <div className="app-main-wrapper">
        <Header
          activeView={activeView}
          themeMode={themeMode}
          profile={profile}
          onToggleTheme={toggleTheme}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigateView={handleNavigate}
        />

        <main className="app-main-content">
          {activeView === 'dashboard' && (
            <Dashboard
              onNavigateView={handleNavigate}
              flashcards={flashcards}
              quizHistory={quizHistory}
              profile={profile}
              learningActivity={learningActivity}
            />
          )}

          {activeView === 'flashcards' && (
            <FlashcardList
              flashcards={flashcards}
              selectedFlashcardIds={selectedFlashcardIds}
              onSelectCardsChange={setSelectedFlashcardIds}
              onBatchDeleteCards={handleBatchDeleteCards}
              onQuizSelectedCards={handleStartQuizFromSelected}
              onAddCard={handleAddCard}
              onBulkImportCards={handleBulkAddCards}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onStudyCard={handleStudyCard}
              onShowToast={addToast}
            />
          )}

          {activeView === 'mock-quiz' && (
            <MockQuiz
              flashcards={flashcards}
              selectedQuizCardIds={selectedQuizCardIds}
              onClearSelectedQuizPool={() => setSelectedQuizCardIds(null)}
              preferences={preferences}
              onSaveQuizResult={handleSaveQuizResult}
              onNavigateToFlashcards={() => handleNavigate('flashcards')}
              onShowToast={addToast}
            />
          )}

          {activeView === 'live-quiz' && (
            <LiveQuiz
              flashcards={flashcards}
              profile={profile}
              preferences={preferences}
              onNavigateView={handleNavigate}
              onShowToast={addToast}
            />
          )}

          {activeView === 'statistics' && (
            <Statistics
              flashcards={flashcards}
              quizHistory={quizHistory}
              onNavigateView={handleNavigate}
            />
          )}

          {activeView === 'settings' && (
            <Settings
              profile={profile}
              preferences={preferences}
              themeMode={themeMode}
              onUpdateProfile={handleUpdateProfile}
              onUpdatePreferences={handleUpdatePreferences}
              onUpdateThemeMode={handleUpdateThemeMode}
              onClearQuizHistory={handleClearQuizHistory}
              onResetFlashcards={handleResetFlashcards}
              onShowToast={addToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
