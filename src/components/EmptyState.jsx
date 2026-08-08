/**
 * Empty State Component
 * Displayed when no flashcards are available for a given filter or search
 */
export default function EmptyState({ message, onResetFilter }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🔍</div>
      <h4 className="empty-title">No flashcards found</h4>
      <p className="empty-description">
        {message || "We couldn't find any flashcards matching your current criteria."}
      </p>
      {onResetFilter && (
        <button
          type="button"
          className="btn btn-outline"
          onClick={onResetFilter}
        >
          Clear Category Filter
        </button>
      )}
    </div>
  );
}
