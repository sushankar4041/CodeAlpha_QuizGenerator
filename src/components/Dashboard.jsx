import { getCategoryIcon } from '../utils/quizUtils';
import { calculateOverviewStats, calculateCurrentStreak } from '../utils/statisticsUtils';

/**
 * Dashboard View Component - Phase 7 Quizelle
 * Learning Command Center showing real persisted stats, personalized greeting,
 * "Continue Learning" hero block with "Resume Session" Brushed Amber CTA,
 * Quick Actions, and Category Breakdown.
 */
export default function Dashboard({
  onNavigateView,
  flashcards = [],
  quizHistory = [],
  profile = {},
  learningActivity = []
}) {
  const overview = calculateOverviewStats(flashcards, quizHistory);
  const currentStreak = calculateCurrentStreak(learningActivity);
  const streakDisplay = `${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'}`;
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

  const recentTopic = categoriesList.length > 0 ? categoriesList[0].name : 'JavaScript Fundamentals';

  return (
    <div className="dashboard-container">
      {/* 1. Command Center Greeting & KPI Metrics Header */}
      <section className="command-center-header" aria-label="Learning Command Center Header">
        <div className="greeting-row">
          <div>
            <h1 className="welcome-title">
              Good morning, {displayName}! 👋
            </h1>
            <p className="welcome-subtitle">Let&apos;s continue your learning journey.</p>
          </div>

          <div className="header-quick-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigateView('flashcards')}
            >
              <span>+ Add Flashcard</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Row */}
        <div className="dashboard-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper amber" aria-hidden="true">🎴</div>
            <div className="stat-details">
              <span className="stat-value">{overview.totalCards}</span>
              <span className="stat-label">Total Cards</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper amber" aria-hidden="true">📝</div>
            <div className="stat-details">
              <span className="stat-value">{overview.quizzesCompleted}</span>
              <span className="stat-label">Quizzes Taken</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper green" aria-hidden="true">🎯</div>
            <div className="stat-details">
              <span className="stat-value">{overview.averageScore}%</span>
              <span className="stat-label">Avg. Score</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper streak" aria-hidden="true">🔥</div>
            <div className="stat-details">
              <span className="stat-value">{streakDisplay}</span>
              <span className="stat-label">Current Streak</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Hero Section: Continue Learning & Quick Actions Panel */}
      <section className="command-hero-grid" aria-label="Continue Learning and Quick Actions">
        {/* Continue Learning Hero Block */}
        <div className="continue-learning-hero">
          <div className="hero-content-col">
            <span className="hero-badge">IN PROGRESS</span>
            <h2 className="hero-title">Continue Learning</h2>
            <p className="hero-subtitle">{recentTopic}</p>
            <div className="hero-progress-meta">
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: '65%' }}></div>
              </div>
              <span className="progress-text-label">12 / 20 cards studied</span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-resume-session"
              onClick={() => onNavigateView('flashcards')}
            >
              <span>Resume Session →</span>
            </button>
          </div>

          <div className="hero-cards-stack-illustration" aria-hidden="true">
            <div className="card-stack-decoration">
              <div className="deco-card card-3">DBMS 🗄️</div>
              <div className="deco-card card-2">React ⚛️</div>
              <div className="deco-card card-1">JavaScript 🟨</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="quick-actions-panel">
          <h3 className="panel-title">Quick Actions</h3>
          <div className="quick-actions-list">
            <button
              type="button"
              className="quick-action-item"
              onClick={() => onNavigateView('mock-quiz')}
            >
              <span className="action-icon">📝</span>
              <span className="action-label">Start Mock Quiz</span>
              <span className="action-arrow">›</span>
            </button>

            <button
              type="button"
              className="quick-action-item"
              onClick={() => onNavigateView('live-quiz')}
            >
              <span className="action-icon">👑</span>
              <span className="action-label">Host Live Quiz</span>
              <span className="action-arrow">›</span>
            </button>

            <button
              type="button"
              className="quick-action-item"
              onClick={() => onNavigateView('live-quiz')}
            >
              <span className="action-icon">🎮</span>
              <span className="action-label">Join Live Quiz</span>
              <span className="action-arrow">›</span>
            </button>

            <button
              type="button"
              className="quick-action-item"
              onClick={() => onNavigateView('flashcards')}
            >
              <span className="action-icon">🎴</span>
              <span className="action-label">Browse Flashcards</span>
              <span className="action-arrow">›</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Core Learning Experience Cards */}
      <section className="dashboard-section" aria-label="Core Learning Experiences">
        <h3 className="section-title">Core Learning Experiences</h3>
        <div className="three-cards-grid">
          {/* Flashcards */}
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
              <span className="badge badge-amber">Active Mode</span>
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

          {/* Mock Quiz */}
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
              <span className="badge badge-amber">Active Mode</span>
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

          {/* Live Quiz */}
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
              <span className="badge badge-amber">Active Mode</span>
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
