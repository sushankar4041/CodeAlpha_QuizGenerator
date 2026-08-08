import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FlashcardList from './components/FlashcardList';
import MockQuiz from './components/MockQuiz';
import Statistics from './components/Statistics';
import LiveQuiz from './components/LiveQuiz';
import Settings from './components/Settings';
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
  saveStoredThemeMode
} from './services/storage';
import './App.css';

/**
 * Main Application Component - Phase 6B
 * Coordinates Flashcards, Mock Quiz, Statistics, Live Quiz, Settings & Learner Profile,
 * Theme Mode (Light/Dark/System Auto-detection & OS listener), and activeView navigation.
 */
function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [themeMode, setThemeMode] = useState(getStoredThemeMode);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [flashcards, setFlashcards] = useState(getStoredFlashcards);
  const [quizHistory, setQuizHistory] = useState(getStoredQuizHistory);
  const [profile, setProfile] = useState(getStoredLearnerProfile);
  const [preferences, setPreferences] = useState(getStoredPreferences);

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
    updateAndSaveCards(updatedCollection);
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
  };

  // Quiz History Handlers
  const handleSaveQuizResult = (resultData) => {
    const updatedHistory = saveQuizResult(resultData);
    setQuizHistory(updatedHistory);
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
            />
          )}

          {activeView === 'flashcards' && (
            <FlashcardList
              flashcards={flashcards}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onStudyCard={handleStudyCard}
            />
          )}

          {activeView === 'mock-quiz' && (
            <MockQuiz
              flashcards={flashcards}
              onSaveQuizResult={handleSaveQuizResult}
              onNavigateToFlashcards={() => handleNavigate('flashcards')}
            />
          )}

          {activeView === 'live-quiz' && (
            <LiveQuiz
              flashcards={flashcards}
              profile={profile}
              onNavigateView={handleNavigate}
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
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
