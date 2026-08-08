import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FlashcardList from './components/FlashcardList';
import MockQuizPlaceholder from './components/MockQuizPlaceholder';
import LiveQuizPlaceholder from './components/LiveQuizPlaceholder';
import StatisticsPlaceholder from './components/StatisticsPlaceholder';
import { getStoredFlashcards, getStoredTheme, saveStoredTheme } from './services/storage';
import './App.css';

/**
 * Main Application Component - Phase 1.5
 * Coordinates navigation across 4 product modes (Flashcards, Mock Quiz, Live Quiz, Statistics),
 * theme state, and mobile navigation drawer.
 */
function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [theme, setTheme] = useState(getStoredTheme);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [flashcards] = useState(getStoredFlashcards);

  // Sync theme attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveStoredTheme(theme);
  }, [theme]);

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
              flashcardsCount={flashcards.length}
            />
          )}

          {activeView === 'flashcards' && (
            <FlashcardList flashcards={flashcards} />
          )}

          {activeView === 'mock-quiz' && (
            <MockQuizPlaceholder
              onNavigateToFlashcards={() => handleNavigate('flashcards')}
            />
          )}

          {activeView === 'live-quiz' && (
            <LiveQuizPlaceholder
              onNavigateToFlashcards={() => handleNavigate('flashcards')}
            />
          )}

          {activeView === 'statistics' && (
            <StatisticsPlaceholder
              onNavigateToFlashcards={() => handleNavigate('flashcards')}
              flashcardsCount={flashcards.length}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
