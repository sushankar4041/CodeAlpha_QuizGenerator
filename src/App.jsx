import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FlashcardList from './components/FlashcardList';
import MockQuiz from './components/MockQuiz';
import Statistics from './components/Statistics';
import LiveQuiz from './components/LiveQuiz';
import {
  getStoredFlashcards,
  saveStoredFlashcards,
  getStoredQuizHistory,
  saveQuizResult,
  getStoredTheme,
  saveStoredTheme
} from './services/storage';
import './App.css';

/**
 * Main Application Component - Phase 5
 * Coordinates Flashcard CRUD, Mock Quiz generator engine, Statistics & Analytics Dashboard,
 * Real-Time Multiplayer Live Quiz, theme state, and section navigation.
 */
function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [theme, setTheme] = useState(getStoredTheme);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [flashcards, setFlashcards] = useState(getStoredFlashcards);
  const [quizHistory, setQuizHistory] = useState(getStoredQuizHistory);

  // Sync theme attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveStoredTheme(theme);
  }, [theme]);

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

  // Quiz History Handler
  const handleSaveQuizResult = (resultData) => {
    const updatedHistory = saveQuizResult(resultData);
    setQuizHistory(updatedHistory);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
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
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="app-main-content">
          {activeView === 'dashboard' && (
            <Dashboard
              onNavigateView={handleNavigate}
              flashcards={flashcards}
              quizHistory={quizHistory}
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
        </main>
      </div>
    </div>
  );
}

export default App;
