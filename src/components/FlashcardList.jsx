import { useState } from 'react';
import Flashcard from './Flashcard';
import CategoryFilter from './CategoryFilter';
import EmptyState from './EmptyState';
import { filterCardsByCategory } from '../utils/quizUtils';

/**
 * Flashcard List Container Component
 * Manages category filtering and flashcard grid layout
 */
export default function FlashcardList({ flashcards }) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const filteredCards = filterCardsByCategory(flashcards, selectedCategory);

  return (
    <div className="flashcards-section">
      {/* Section Controls Header */}
      <div className="flashcards-controls-header">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <div className="flashcard-count-badge">
          Showing <strong>{filteredCards.length}</strong> of {flashcards.length} cards
        </div>
      </div>

      {/* Cards Grid or Empty State */}
      {filteredCards.length > 0 ? (
        <div className="flashcards-grid">
          {filteredCards.map((card) => (
            <Flashcard key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <EmptyState
          message={`No flashcards found in category "${selectedCategory}".`}
          onResetFilter={() => setSelectedCategory('All Categories')}
        />
      )}
    </div>
  );
}
