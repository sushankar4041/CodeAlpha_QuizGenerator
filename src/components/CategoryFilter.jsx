import { sampleCategories } from '../data/defaultFlashcards';

/**
 * Category Filter Component
 * Renders filter chips for flashcard category selection
 */
export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div className="category-filter-bar">
      <span className="filter-label">Filter by Category:</span>
      <div className="filter-chips">
        {sampleCategories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.id}
              type="button"
              className={`filter-chip ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.name)}
              aria-pressed={isSelected}
            >
              <span className="chip-icon">{cat.icon}</span>
              <span className="chip-name">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
