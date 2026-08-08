/**
 * Top Header Component
 * Contains section metadata, theme toggle, mobile menu toggle, and user-neutral profile pill
 */
export default function Header({
  activeView,
  themeMode,
  profile = {},
  onToggleTheme,
  onOpenMobileMenu,
  onNavigateView
}) {
  const getHeaderMeta = () => {
    switch (activeView) {
      case 'dashboard':
        return {
          title: 'Dashboard Overview',
          subtitle: 'Welcome to your flashcard and quiz learning workspace.'
        };
      case 'flashcards':
        return {
          title: 'Flashcard Collection',
          subtitle: 'Browse, reveal answers, and master technical concepts.'
        };
      case 'mock-quiz':
        return {
          title: 'Mock Quiz (Self-Assessment)',
          subtitle: 'Generate customized practice quizzes to test your knowledge.'
        };
      case 'live-quiz':
        return {
          title: 'Live Quiz (Multiplayer)',
          subtitle: 'Host or join real-time competitive quiz rooms with peers.'
        };
      case 'statistics':
        return {
          title: 'Statistics & Progress',
          subtitle: 'Track your quiz scores, study progress, and accuracy trends.'
        };
      case 'settings':
        return {
          title: 'Settings & Preferences',
          subtitle: 'Manage your learner profile, theme mode, and data settings.'
        };
      default:
        return {
          title: 'Quiz Generator',
          subtitle: 'Learn. Practice. Remember.'
        };
    }
  };

  const meta = getHeaderMeta();
  const displayName = profile.displayName || 'Learner';
  const avatarChar = displayName.charAt(0).toUpperCase();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="header-titles">
          <h2 className="header-title">{meta.title}</h2>
          <p className="header-subtitle">{meta.subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Dark/Light/System Theme Switcher */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label={`Switch theme mode (Current: ${themeMode})`}
          title={`Theme mode: ${themeMode}`}
        >
          {themeMode === 'light' ? (
            <>
              <span className="theme-icon">☀️</span>
              <span className="theme-label">Light</span>
            </>
          ) : themeMode === 'dark' ? (
            <>
              <span className="theme-icon">🌙</span>
              <span className="theme-label">Dark</span>
            </>
          ) : (
            <>
              <span className="theme-icon">🖥️</span>
              <span className="theme-label">System</span>
            </>
          )}
        </button>

        {/* Persisted User Identity Pill */}
        <div
          className="user-profile-pill clickable"
          onClick={() => onNavigateView('settings')}
          title="Click to manage profile settings"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigateView('settings')}
        >
          <div className="user-avatar">
            {avatarChar}
          </div>
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-role">Student Account</span>
          </div>
        </div>
      </div>
    </header>
  );
}
