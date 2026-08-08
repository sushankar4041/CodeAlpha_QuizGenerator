import { useEffect } from 'react';

/**
 * Sidebar Navigation Component - Phase 7 Quizelle
 * Golden Premium Learning rail with semantic navigation groups:
 * LEARN (Flashcards), PRACTICE (Mock Quiz), COMPETE (Live Quiz), INSIGHTS (Statistics), SYSTEM (Settings).
 */
export default function Sidebar({ activeView, onViewChange, isOpen, onCloseMobile }) {
  // Escape key handler for mobile menu drawer
  useEffect(() => {
    if (!isOpen || !onCloseMobile) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCloseMobile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCloseMobile]);

  const navSections = [
    {
      label: 'MAIN',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
          )
        }
      ]
    },
    {
      label: 'LEARN',
      items: [
        {
          id: 'flashcards',
          label: 'Flashcards',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          )
        }
      ]
    },
    {
      label: 'PRACTICE',
      items: [
        {
          id: 'mock-quiz',
          label: 'Mock Quiz',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          )
        }
      ]
    },
    {
      label: 'COMPETE',
      items: [
        {
          id: 'live-quiz',
          label: 'Live Quiz',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 1 0 7.75" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          )
        }
      ]
    },
    {
      label: 'INSIGHTS',
      items: [
        {
          id: 'statistics',
          label: 'Statistics',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          )
        }
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          )
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Quizelle Golden Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo q-dial-logo">
            <span className="logo-q" aria-hidden="true">Q</span>
          </div>
          <div className="brand-text">
            <h1 className="brand-name">Quizelle</h1>
            <p className="brand-tagline">Learn. Practice. Compete. Improve.</p>
          </div>
          {onCloseMobile && (
            <button
              type="button"
              className="mobile-close-btn"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Rail with Semantic Groups */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          {navSections.map((section) => (
            <div key={section.label} className="nav-group-section">
              <p className="nav-section-label">{section.label}</p>
              <ul className="nav-list">
                {section.items.map((item) => {
                  const isActive = activeView === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`nav-button ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          onViewChange(item.id);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="internship-badge">
            <span className="pulse-dot" aria-hidden="true"></span>
            <span>CodeAlpha Internship</span>
          </div>
        </div>
      </aside>
    </>
  );
}
