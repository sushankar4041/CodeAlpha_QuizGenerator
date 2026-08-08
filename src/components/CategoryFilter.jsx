import { getCategoryIcon } from '../utils/quizUtils';

/**
 * Category Filter Component
 * Dynamically renders category chips based on the active flashcard collection
 */
export default function CategoryFilter({ selectedCategory, onSelectCategory, flashcards = [] }) {
  // Extract unique categories from current cards
  const categoriesList = ['All Categories'];
  flashcards.forEach((card) => {
    if (card.category && !categoriesList.includes(card.category)) {
      categoriesList.push(card.category);
    }
  });

  return (
    <div className="category-filter-bar">
      <span className="filter-label">Category:</span>
      <div className="filter-chips">
        {categoriesList.map((catName) => {
          const isSelected = selectedCategory === catName;
          const count = catName === 'All Categories'
            ? flashcards.length
            : flashcards.filter(c => c.category === catName).length;

          return (
            <button
              key={catName}
              type="button"
              className={`filter-chip ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(catName)}
              aria-pressed={isSelected}
            >
              <span className="chip-icon">{catName === 'All Categories' ? '📚' : getCategoryIcon(catName)}</span>
              <span className="chip-name">{catName}</span>
              <span className="chip-count">({count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
