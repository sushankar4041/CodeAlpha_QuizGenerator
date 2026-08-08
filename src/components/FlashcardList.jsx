import { useState, useMemo } from 'react';
import Flashcard from './Flashcard';
import CategoryFilter from './CategoryFilter';
import EmptyState from './EmptyState';
import FlashcardForm from './FlashcardForm';
import BulkImportModal from './BulkImportModal';

/**
 * Flashcard List Container Component - Phase 6C & Phase 11 Quizelle
 * Manages search, category filtering, study deck navigation, CRUD modals, and Bulk Import.
 */
export default function FlashcardList({
  flashcards = [],
  selectedFlashcardIds = [],
  onSelectCardsChange,
  onBatchDeleteCards,
  onQuizSelectedCards,
  onAddCard,
  onBulkImportCards,
  onEditCard,
  onDeleteCard,
  onStudyCard,
  onShowToast
}) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('deck'); // 'deck' | 'grid'
  const [currentIndex, setCurrentIndex] = useState(0);

  // Selection mode & Batch Delete Confirmation Modal states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

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

  // Selection Handlers
  const selectedSet = useMemo(() => new Set(selectedFlashcardIds), [selectedFlashcardIds]);

  const handleToggleSelect = (cardId) => {
    const nextSet = new Set(selectedFlashcardIds);
    if (nextSet.has(cardId)) {
      nextSet.delete(cardId);
    } else {
      nextSet.add(cardId);
    }
    if (onSelectCardsChange) {
      onSelectCardsChange(Array.from(nextSet));
    }
  };

  const visibleIds = useMemo(() => filteredCards.map((c) => c.id), [filteredCards]);
  const areAllVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));

  const handleSelectAllVisible = () => {
    const nextSet = new Set(selectedFlashcardIds);
    if (areAllVisibleSelected) {
      visibleIds.forEach((id) => nextSet.delete(id));
    } else {
      visibleIds.forEach((id) => nextSet.add(id));
    }
    if (onSelectCardsChange) {
      onSelectCardsChange(Array.from(nextSet));
    }
  };

  const handleClearSelection = () => {
    if (onSelectCardsChange) {
      onSelectCardsChange([]);
    }
  };

  const handleConfirmBatchDelete = () => {
    if (onBatchDeleteCards && selectedFlashcardIds.length > 0) {
      onBatchDeleteCards(selectedFlashcardIds);
    }
    setIsBatchDeleteModalOpen(false);
  };

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
      if (onShowToast) {
        onShowToast('Flashcard updated successfully!', 'success');
      }
    } else {
      onAddCard(cardData);
      if (onShowToast) {
        onShowToast('New flashcard created successfully!', 'success');
      }
    }
  };

  const handleDelete = (cardId) => {
    onDeleteCard(cardId);
    if (onShowToast) {
      onShowToast('Flashcard deleted.', 'info');
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
            className={`btn ${isSelectionMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsSelectionMode((prev) => !prev)}
            title="Toggle Selection Mode"
          >
            <span>{isSelectionMode ? '✓ Selection Mode' : '☑ Select Cards'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsBulkImportOpen(true)}
            title="Bulk Import Flashcards"
          >
            <span>📥 Bulk Import</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreateModal}
          >
            <span>+ Create Flashcard</span>
          </button>
        </div>
      </div>

      {/* Phase 15 Batch Actions Toolbar */}
      {(isSelectionMode || selectedFlashcardIds.length > 0) && (
        <div className="batch-actions-toolbar animate-fade-in">
          <div className="batch-info">
            <span className="batch-count-badge">
              <strong>{selectedFlashcardIds.length}</strong> card{selectedFlashcardIds.length === 1 ? '' : 's'} selected
            </span>
            <button
              type="button"
              className="btn btn-secondary-sm"
              onClick={handleSelectAllVisible}
            >
              {areAllVisibleSelected ? 'Deselect Visible' : `Select All Visible (${filteredCards.length})`}
            </button>
            {selectedFlashcardIds.length > 0 && (
              <button
                type="button"
                className="btn btn-outline-sm"
                onClick={handleClearSelection}
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="batch-buttons">
            <button
              type="button"
              className="btn btn-primary-sm"
              disabled={selectedFlashcardIds.length === 0}
              onClick={() => onQuizSelectedCards && onQuizSelectedCards(selectedFlashcardIds)}
            >
              <span>📝 Quiz Selected ({selectedFlashcardIds.length})</span>
            </button>
            <button
              type="button"
              className="btn btn-danger-sm"
              disabled={selectedFlashcardIds.length === 0}
              onClick={() => setIsBatchDeleteModalOpen(true)}
            >
              <span>🗑 Delete Selected ({selectedFlashcardIds.length})</span>
            </button>
          </div>
        </div>
      )}

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
                  isSelected={selectedSet.has(currentCard.id)}
                  onToggleSelect={handleToggleSelect}
                  isSelectionMode={isSelectionMode || selectedFlashcardIds.length > 0}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDelete}
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
                isSelected={selectedSet.has(card.id)}
                onToggleSelect={handleToggleSelect}
                isSelectionMode={isSelectionMode || selectedFlashcardIds.length > 0}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
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

      {/* Batch Delete Confirmation Modal */}
      {isBatchDeleteModalOpen && (
        <div className="modal-backdrop animate-fade-in" role="dialog" aria-modal="true">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Batch Deletion</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsBatchDeleteModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to permanently delete <strong>{selectedFlashcardIds.length}</strong> selected flashcard{selectedFlashcardIds.length === 1 ? '' : 's'}?
              </p>
              <p className="subtle-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsBatchDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmBatchDelete}
              >
                Delete {selectedFlashcardIds.length} Cards
              </button>
            </div>
          </div>
        </div>
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

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportCards={(newCards) => {
          if (onBulkImportCards) {
            onBulkImportCards(newCards);
          }
          if (onShowToast) {
            onShowToast(`Successfully imported ${newCards.length} flashcard${newCards.length === 1 ? '' : 's'}!`, 'success');
          }
        }}
        existingCards={flashcards}
        existingCategories={uniqueCategories}
      />
    </div>
  );
}
