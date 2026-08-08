import { useState, useMemo } from 'react';
import Flashcard from './Flashcard';
import CategoryFilter from './CategoryFilter';
import EmptyState from './EmptyState';
import FlashcardForm from './FlashcardForm';

/**
 * Flashcard List Container Component
 * Manages search, category filtering, study deck navigation, and CRUD modals
 */
export default function FlashcardList({
  flashcards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onStudyCard
}) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('deck'); // 'deck' | 'grid'
  const [currentIndex, setCurrentIndex] = useState(0);

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // Extract unique categories for form dropdown
  const uniqueCategories = useMemo(() => {
    const set = new Set(flashcards.map((c) => c.category));
    return Array.from(set);
  }, [flashcards]);

  // Filter cards by category and search term
  const filteredCards = useMemo(() => {
    let result = flashcards;

    if (selectedCategory && selectedCategory !== 'All Categories') {
      result = result.filter(
        (card) => card.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (card) =>
          card.question.toLowerCase().includes(q) ||
          card.answer.toLowerCase().includes(q) ||
          card.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [flashcards, selectedCategory, searchQuery]);

  // Reset active card index when filter or search changes
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentIndex(0);
  };

  // Study Deck Navigation Controls
  const handleNextCard = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Form actions
  const handleOpenCreateModal = () => {
    setEditingCard(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (card) => {
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const handleFormSave = (cardData) => {
    if (editingCard) {
      onEditCard(cardData);
    } else {
      onAddCard(cardData);
    }
  };

  const currentCard = filteredCards[currentIndex];

  return (
    <div className="flashcards-section">
      {/* Top Section Header & Actions */}
      <div className="flashcards-main-bar">
        <div className="search-bar-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search flashcards by question, answer, or category..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery('');
                setCurrentIndex(0);
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flashcards-action-group">
          {/* View Mode Switcher */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${viewMode === 'deck' ? 'active' : ''}`}
              onClick={() => setViewMode('deck')}
              title="Study Deck View (1-by-1)"
            >
              🎴 Deck View
            </button>
            <button
              type="button"
              className={`mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid Overview"
            >
              📱 Grid View
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreateModal}
          >
            <span>+ Create Flashcard</span>
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flashcards-controls-header">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          flashcards={flashcards}
        />
        <div className="flashcard-count-badge">
          Showing <strong>{filteredCards.length}</strong> of {flashcards.length} cards
        </div>
      </div>

      {/* Main View Area */}
      {filteredCards.length > 0 ? (
        viewMode === 'deck' ? (
          /* Study Deck Carousel View */
          <div className="study-deck-container">
            {/* Deck Navigation Controls Bar */}
            <div className="deck-nav-bar">
              <button
                type="button"
                className="btn btn-secondary nav-arrow-btn"
                onClick={handlePrevCard}
                disabled={currentIndex === 0}
                aria-label="Previous card"
              >
                ← Previous
              </button>

              <div className="deck-position-indicator">
                Card <strong>{currentIndex + 1}</strong> of <strong>{filteredCards.length}</strong>
              </div>

              <button
                type="button"
                className="btn btn-secondary nav-arrow-btn"
                onClick={handleNextCard}
                disabled={currentIndex === filteredCards.length - 1}
                aria-label="Next card"
              >
                Next →
              </button>
            </div>

            {/* Active Card Card Display */}
            {currentCard && (
              <div className="active-deck-card-wrapper">
                <Flashcard
                  key={currentCard.id}
                  card={currentCard}
                  onEdit={handleOpenEditModal}
                  onDelete={onDeleteCard}
                  onStudy={onStudyCard}
                />
              </div>
            )}
          </div>
        ) : (
          /* Grid View */
          <div className="flashcards-grid">
            {filteredCards.map((card) => (
              <Flashcard
                key={card.id}
                card={card}
                onEdit={handleOpenEditModal}
                onDelete={onDeleteCard}
                onStudy={onStudyCard}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          message={
            searchQuery
              ? `No flashcards matched your search "${searchQuery}".`
              : `No flashcards found in category "${selectedCategory}".`
          }
          onResetFilter={() => {
            setSelectedCategory('All Categories');
            setSearchQuery('');
            setCurrentIndex(0);
          }}
        />
      )}

      {/* Create / Edit Form Modal */}
      <FlashcardForm
        key={editingCard ? `edit-${editingCard.id}` : `create-${isFormOpen}`}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCard(null);
        }}
        onSave={handleFormSave}
        initialData={editingCard}
        existingCategories={uniqueCategories}
      />
    </div>
  );
}
