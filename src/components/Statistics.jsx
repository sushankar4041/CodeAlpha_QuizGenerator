import { useMemo } from 'react';
import {
  calculateOverviewStats,
  calculateCategoryAnalytics,
  calculateDifficultyAnalytics,
  formatQuizDate
} from '../utils/statisticsUtils';
import { getDifficultyBadgeClass } from '../utils/quizUtils';

/**
 * Statistics & Learning Analytics Dashboard Component - Phase 7B Quizelle
 * Editorial analytics dashboard featuring overall accuracy, category mastery horizontal bars,
 * difficulty distribution, and recent quiz history logs.
 */
export default function Statistics({ flashcards = [], quizHistory = [], onNavigateView }) {
  const overview = useMemo(
    () => calculateOverviewStats(flashcards, quizHistory),
    [flashcards, quizHistory]
  );

  const categoriesAnalytics = useMemo(
    () => calculateCategoryAnalytics(flashcards, quizHistory),
    [flashcards, quizHistory]
  );

  const difficultyAnalytics = useMemo(
    () => calculateDifficultyAnalytics(flashcards),
    [flashcards]
  );

  const totalQuestionsAnswered = overview.totalCorrect + overview.totalIncorrect + overview.totalUnanswered;

  const correctPct = totalQuestionsAnswered > 0 ? Math.round((overview.totalCorrect / totalQuestionsAnswered) * 100) : 0;
  const incorrectPct = totalQuestionsAnswered > 0 ? Math.round((overview.totalIncorrect / totalQuestionsAnswered) * 100) : 0;
  const unansweredPct = totalQuestionsAnswered > 0 ? Math.round((overview.totalUnanswered / totalQuestionsAnswered) * 100) : 0;

  return (
    <div className="statistics-container animate-fade-in" role="region" aria-label="Learning Analytics">
      {/* Editorial Header Banner */}
      <div className="stats-header-banner">
        <div className="concept-badge stats">PERFORMANCE & INSIGHTS</div>
        <h2 className="stats-main-title">Your Learning Insights</h2>
        <p className="stats-main-subtitle">
          Real-time performance metrics derived from your flashcard study deck and quiz history.
        </p>
      </div>

      {/* Overview KPI Cards Grid */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper amber" aria-hidden="true">🏆</div>
          <div className="stat-details">
            <span className="stat-value">{overview.averageScore}%</span>
            <span className="stat-label">
              Overall Accuracy {overview.quizzesCompleted > 0 && `(Best: ${overview.bestScore}%)`}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper amber" aria-hidden="true">🎯</div>
          <div className="stat-details">
            <span className="stat-value">{overview.quizzesCompleted}</span>
            <span className="stat-label">Quizzes Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper amber" aria-hidden="true">📖</div>
          <div className="stat-details">
            <span className="stat-value">{overview.totalStudied}</span>
            <span className="stat-label">Cards Studied</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper amber" aria-hidden="true">📚</div>
          <div className="stat-details">
            <span className="stat-value">{overview.totalCards}</span>
            <span className="stat-label">Total Flashcards</span>
          </div>
        </div>
      </div>

      {/* Answer Distribution & Quiz Performance Section */}
      {overview.quizzesCompleted > 0 ? (
        <section className="stats-section-card" aria-label="Answer Distribution">
          <div className="stats-section-header">
            <h3 className="stats-section-title">Quiz Performance & Answer Distribution</h3>
            <span className="stats-sub-badge">{totalQuestionsAnswered} total questions answered</span>
          </div>

          {/* Visual Answer Ratio Bar */}
          <div className="answer-ratio-bar-container">
            <div className="ratio-bar-segment correct" style={{ width: `${correctPct}%` }} title={`Correct: ${correctPct}%`} />
            <div className="ratio-bar-segment incorrect" style={{ width: `${incorrectPct}%` }} title={`Incorrect: ${incorrectPct}%`} />
            <div className="ratio-bar-segment unanswered" style={{ width: `${unansweredPct}%` }} title={`Unanswered: ${unansweredPct}%`} />
          </div>

          <div className="ratio-legend-grid">
            <div className="legend-item legend-correct">
              <span className="dot" aria-hidden="true" />
              <div className="legend-info">
                <span className="lbl">Correct Answers</span>
                <strong className="val">{overview.totalCorrect} ({correctPct}%)</strong>
              </div>
            </div>

            <div className="legend-item legend-incorrect">
              <span className="dot" aria-hidden="true" />
              <div className="legend-info">
                <span className="lbl">Incorrect Answers</span>
                <strong className="val">{overview.totalIncorrect} ({incorrectPct}%)</strong>
              </div>
            </div>

            <div className="legend-item legend-unanswered">
              <span className="dot" aria-hidden="true" />
              <div className="legend-info">
                <span className="lbl">Unanswered</span>
                <strong className="val">{overview.totalUnanswered} ({unansweredPct}%)</strong>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="stats-section-card empty-stats-card" aria-label="No Quiz Data">
          <div className="empty-stats-content">
            <span className="empty-icon-emoji" aria-hidden="true">📝</span>
            <h4>No Quiz Data Yet</h4>
            <p>Complete your first practice quiz to start building your learning insights and accuracy trends.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigateView('mock-quiz')}
            >
              Take a Mock Quiz 🚀
            </button>
          </div>
        </section>
      )}

      {/* Category Mastery Section */}
      <section className="stats-section-card" aria-label="Category Mastery">
        <h3 className="stats-section-title">Category Mastery</h3>

        {categoriesAnalytics.length > 0 ? (
          <div className="category-analytics-grid">
            {categoriesAnalytics.map((cat) => (
              <div key={cat.name} className="cat-analytics-card">
                <div className="cat-card-top">
                  <div className="cat-icon-name">
                    <span className="cat-emoji-icon" aria-hidden="true">{cat.icon}</span>
                    <h4 className="cat-title">{cat.name}</h4>
                  </div>
                  <span className="badge badge-amber">{cat.cardCount} {cat.cardCount === 1 ? 'Card' : 'Cards'}</span>
                </div>

                <div className="cat-metrics-rows">
                  <div className="cat-metric-row">
                    <span className="lbl">Study Interactions:</span>
                    <strong className="val">{cat.studiedCount} times</strong>
                  </div>

                  <div className="cat-metric-row">
                    <span className="lbl">Quizzes Taken:</span>
                    <strong className="val">{cat.quizzesTaken}</strong>
                  </div>

                  <div className="cat-metric-row">
                    <span className="lbl">Category Mastery Accuracy:</span>
                    <strong className="val">
                      {cat.averageQuizScore !== null ? `${cat.averageQuizScore}%` : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-stats-content">
            <p>No categories found. Create flashcards to see category performance analytics.</p>
          </div>
        )}
      </section>

      {/* Difficulty Distribution Section */}
      <section className="stats-section-card" aria-label="Flashcard Difficulty Distribution">
        <h3 className="stats-section-title">Flashcard Difficulty Distribution</h3>
        <div className="difficulty-stats-grid">
          {['Easy', 'Medium', 'Hard'].map((lvl) => {
            const count = difficultyAnalytics.counts[lvl];
            const pct = difficultyAnalytics.percentages[lvl];
            const badgeClass = getDifficultyBadgeClass(lvl);

            return (
              <div key={lvl} className="diff-stat-card">
                <div className="diff-card-header">
                  <span className={`badge ${badgeClass}`}>{lvl}</span>
                  <span className="diff-count">{count} {count === 1 ? 'Card' : 'Cards'}</span>
                </div>
                <div className="diff-progress-bar">
                  <div className={`diff-bar-fill ${lvl.toLowerCase()}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="diff-pct-label">{pct}% of deck</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Quiz History Table */}
      {quizHistory.length > 0 && (
        <section className="stats-section-card" aria-label="Recent Quiz History">
          <div className="stats-section-header">
            <h3 className="stats-section-title">Recent Quiz History</h3>
            <span className="stats-sub-badge">Last {quizHistory.length} quizzes</span>
          </div>

          <div className="table-wrapper">
            <table className="quiz-history-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Breakdown (✓ / ✕ / ⚪)</th>
                </tr>
              </thead>
              <tbody>
                {quizHistory.map((quiz) => (
                  <tr key={quiz.id}>
                    <td className="date-cell">{formatQuizDate(quiz.completedAt)}</td>
                    <td>{quiz.category}</td>
                    <td>
                      <span className={`badge ${getDifficultyBadgeClass(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                    </td>
                    <td className="score-cell">{quiz.score || `${quiz.correctAnswers} / ${quiz.totalQuestions}`}</td>
                    <td>
                      <span className={`badge ${quiz.percentage >= 80 ? 'badge-easy' : quiz.percentage >= 50 ? 'badge-medium' : 'badge-hard'}`}>
                        {quiz.percentage}%
                      </span>
                    </td>
                    <td className="breakdown-cell">
                      <span className="text-correct">✓ {quiz.correctAnswers}</span> /{' '}
                      <span className="text-incorrect">✕ {quiz.incorrectAnswers}</span> /{' '}
                      <span className="text-unanswered">⚪ {quiz.unanswered}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
