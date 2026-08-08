import { getCategoryIcon } from '../utils/quizUtils';
import { calculateOverviewStats } from '../utils/statisticsUtils';

/**
 * Dashboard View Component - Phase 6E
 * Learner portal showing real persisted stats and personalized learner greeting.
 * Enhanced with full keyboard interaction and ARIA accessibility labels.
 */
export default function Dashboard({
  onNavigateView,
  flashcards = [],
  quizHistory = [],
  profile = {}
}) {
  const overview = calculateOverviewStats(flashcards, quizHistory);
  const displayName = profile.displayName || 'Learner';

  // Compute category breakdown from active flashcards
  const categoryCounts = {};
  flashcards.forEach((card) => {
    const cat = card.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoriesList = Object.keys(categoryCounts).map((catName) => ({
    name: catName,
    count: categoryCounts[catName],
    icon: getCategoryIcon(catName)
  }));

  const handleCardKeyDown = (e, viewTarget) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigateView(viewTarget);
    }
  };

  return (
    <div className="dashboard-container">
      {/* 1. Personalized Welcome Banner */}
      <section className="welcome-banner" aria-label="Welcome Overview">
        <div className="welcome-content">
          <div className="welcome-pill">⚡ Learning Workspace</div>
          <h1 className="welcome-title">
            {displayName !== 'Learner' ? `Ready to learn something new, ${displayName}?` : 'Ready to learn something new?'}
          </h1>
          <p className="welcome-subtitle">
            Create flashcards, test your knowledge, or challenge others in real-time.
          </p>
          <div className="welcome-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigateView('flashcards')}
            >
              <span>Explore Flashcards</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigateView('live-quiz')}
            >
              <span>Join Live Quiz ⚡</span>
            </button>
          </div>
        </div>
        <div className="welcome-illustration" aria-hidden="true">
          <div className="card-stack-decoration">
            <div className="deco-card card-3">DBMS 🗄️</div>
            <div className="deco-card card-2">React ⚛️</div>
            <div className="deco-card card-1">JavaScript 🟨</div>
          </div>
        </div>
      </section>

      {/* 2. Four Primary Experience Cards */}
      <section className="dashboard-section" aria-label="Core Learning Experiences">
        <h3 className="section-title">Core Learning Experiences</h3>
        <div className="three-cards-grid">
          {/* Flashcards (Create / Study) */}
          <div
            className="feature-card learning-card"
            onClick={() => onNavigateView('flashcards')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleCardKeyDown(e, 'flashcards')}
            aria-label="Open Flashcards section to create and study decks"
          >
            <div className="feature-card-header">
              <div className="feature-icon-box purple" aria-hidden="true">🎴</div>
              <span className="badge badge-purple">Active Mode</span>
            </div>
            <div className="feature-card-meta">
              <span className="feature-mode-label">CREATE & STUDY</span>
              <h4 className="feature-card-title">Flashcards</h4>
            </div>
            <p className="feature-card-desc">
              Build, edit, organize, and flip through custom flashcard decks with persistent study tracking.
            </p>
            <div className="feature-card-footer">
              <span className="feature-cta-btn primary-cta">Open Flashcards →</span>
            </div>
          </div>

          {/* Mock Quiz (Self-Assessment) */}
          <div
            className="feature-card assessment-card"
            onClick={() => onNavigateView('mock-quiz')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleCardKeyDown(e, 'mock-quiz')}
            aria-label="Open Mock Quiz section for self-assessment practice"
          >
            <div className="feature-card-header">
              <div className="feature-icon-box blue" aria-hidden="true">📝</div>
              <span className="badge badge-purple">Active Mode</span>
            </div>
            <div className="feature-card-meta">
              <span className="feature-mode-label">SELF-ASSESS</span>
              <h4 className="feature-card-title">Mock Quiz</h4>
            </div>
            <p className="feature-card-desc">
              Test yourself with a solo practice quiz generated by the application based on your parameters.
            </p>
            <div className="feature-card-footer">
              <span className="feature-cta-btn primary-cta">Start Mock Quiz →</span>
            </div>
          </div>

          {/* Live Quiz (Real-Time Multiplayer) */}
          <div
            className="feature-card competition-card"
            onClick={() => onNavigateView('live-quiz')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleCardKeyDown(e, 'live-quiz')}
            aria-label="Open Live Quiz section to host or join multiplayer rooms"
          >
            <div className="feature-card-header">
              <div className="feature-icon-box amber" aria-hidden="true">⚡</div>
              <span className="badge badge-purple">Active Mode</span>
            </div>
            <div className="feature-card-meta">
              <span className="feature-mode-label">COMPETE</span>
              <h4 className="feature-card-title">Live Quiz</h4>
            </div>
            <p className="feature-card-desc">
              Host a live quiz room or enter a 6-digit room code to compete against classmates in real-time.
            </p>
            <div className="feature-card-footer">
              <span className="feature-cta-btn primary-cta">Join Live Quiz ⚡</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Real Persisted Overview Stats */}
      <section className="dashboard-stats-grid" aria-label="Persisted Learning Statistics">
        <div className="stat-card">
          <div className="stat-icon-wrapper purple" aria-hidden="true">📚</div>
          <div className="stat-details">
            <span className="stat-value">{overview.totalCards}</span>
            <span className="stat-label">Total Flashcards</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper blue" aria-hidden="true">🎯</div>
          <div className="stat-details">
            <span className="stat-value">{overview.quizzesCompleted}</span>
            <span className="stat-label">Quizzes Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green" aria-hidden="true">📖</div>
          <div className="stat-details">
            <span className="stat-value">{overview.totalStudied}</span>
            <span className="stat-label">Cards Studied</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper amber" aria-hidden="true">🏆</div>
          <div className="stat-details">
            <span className="stat-value">{overview.averageScore}%</span>
            <span className="stat-label">Overall Accuracy</span>
          </div>
        </div>
      </section>

      {/* 4. Categories Overview Section */}
      <section className="dashboard-section" aria-label="Category Breakdown Overview">
        <div className="section-header-flex">
          <h3 className="section-title">Categories Breakdown</h3>
          <button
            type="button"
            className="text-link"
            onClick={() => onNavigateView('flashcards')}
          >
            View All Cards →
          </button>
        </div>

        <div className="categories-grid">
          {categoriesList.map((cat) => (
            <div
              key={cat.name}
              className="category-card"
              onClick={() => onNavigateView('flashcards')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleCardKeyDown(e, 'flashcards')}
              aria-label={`Category ${cat.name} with ${cat.count} flashcards. Click to view.`}
            >
              <div className="category-icon" aria-hidden="true">{cat.icon}</div>
              <div className="category-info">
                <h4 className="category-name">{cat.name}</h4>
                <span className="category-count">{cat.count} {cat.count === 1 ? 'Flashcard' : 'Flashcards'}</span>
              </div>
              <span className="category-arrow" aria-hidden="true">→</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
