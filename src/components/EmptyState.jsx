/**
 * Empty State Component - Phase 7B QuizForge
 * Standardized empty state visualization with muted gold icon, title, description, and primary action.
 */
export default function EmptyState({ title = "No Flashcards Found", message, onResetFilter }) {
  return (
    <div className="empty-state animate-fade-in" role="region" aria-label="Empty State Notice">
      <div className="empty-icon" aria-hidden="true">🎴</div>
      <h4 className="empty-title">{title}</h4>
      <p className="empty-description">
        {message || "We couldn't find any flashcards matching your current criteria."}
      </p>
      {onResetFilter && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onResetFilter}
        >
          Reset Filter & Search
        </button>
      )}
    </div>
  );
}
