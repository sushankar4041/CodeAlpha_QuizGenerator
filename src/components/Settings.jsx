import { useState } from 'react';

/**
 * Settings & Learner Profile View Component - Phase 6C
 * Allows user to edit display name, select theme mode (Light/Dark/System), customize quiz preferences,
 * and manage data reset options with accessible confirmation dialogs and toast feedback.
 */
export default function Settings({
  profile = {},
  preferences = {},
  themeMode = 'light',
  onUpdateProfile,
  onUpdatePreferences,
  onUpdateThemeMode,
  onClearQuizHistory,
  onResetFlashcards,
  onShowToast
}) {
  const [displayNameInput, setDisplayNameInput] = useState(profile.displayName || 'Learner');
  const [nameError, setNameError] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Modal State for Data Management
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [showResetCardsModal, setShowResetCardsModal] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const trimmed = displayNameInput.trim();

    if (!trimmed) {
      setNameError('Display name is required.');
      return;
    }

    if (trimmed.length < 2) {
      setNameError('Display name must be at least 2 characters.');
      return;
    }

    if (trimmed.length > 30) {
      setNameError('Display name must not exceed 30 characters.');
      return;
    }

    setNameError('');
    onUpdateProfile({ displayName: trimmed });
    setIsSavedNotice(true);
    if (onShowToast) {
      onShowToast(`Learner name updated to "${trimmed}"`, 'success');
    }
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handlePreferenceChange = (key, value) => {
    const updated = { ...preferences, [key]: value };
    onUpdatePreferences(updated);
    if (onShowToast) {
      onShowToast('Quiz preference updated', 'info');
    }
  };

  const handleThemeChange = (mode) => {
    onUpdateThemeMode(mode);
    if (onShowToast) {
      const modeLabel = mode === 'system' ? 'System Auto' : mode === 'dark' ? 'Dark Mode' : 'Light Mode';
      onShowToast(`Theme switched to ${modeLabel}`, 'info');
    }
  };

  const avatarChar = (displayNameInput.trim() || 'L').charAt(0).toUpperCase();

  return (
    <div className="settings-container animate-fade-in">
      {/* Header Banner */}
      <div className="settings-header-banner">
        <div className="concept-badge stats">Application Preferences</div>
        <h2 className="settings-main-title">Settings & Learner Profile</h2>
        <p className="settings-main-subtitle">
          Customize your display identity, theme preferences, quiz defaults, and local learning data.
        </p>
      </div>

      <div className="settings-grid">
        {/* SECTION 1: LEARNER PROFILE */}
        <section className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">1. Learner Profile</h3>
            <span className="settings-card-desc">Personalize how your name appears across the workspace and live quizzes.</span>
          </div>

          <form onSubmit={handleProfileSubmit} className="settings-form">
            <div className="profile-edit-flex">
              <div className="user-avatar-large" title="Learner Avatar">
                {avatarChar}
              </div>

              <div className="profile-fields-col">
                <label className="form-label" htmlFor="settings-display-name">
                  Display Name <span className="required-star">*</span>
                </label>
                <input
                  id="settings-display-name"
                  type="text"
                  className={`form-input ${nameError ? 'input-error' : ''}`}
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  maxLength={30}
                  required
                />
                {nameError && <p className="error-text">{nameError}</p>}
                <p className="form-help-text">Visible on the header, welcome banner, and live quiz lobbies.</p>
              </div>
            </div>

            <div className="settings-action-row">
              {isSavedNotice && <span className="save-success-badge">✓ Profile Saved!</span>}
              <button type="submit" className="btn btn-primary">
                Save Profile Name
              </button>
            </div>
          </form>
        </section>

        {/* SECTION 2: APPEARANCE (THEME MODE) */}
        <section className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">2. Appearance & Theme</h3>
            <span className="settings-card-desc">Select your preferred color theme or match your system OS settings.</span>
          </div>

          <div className="theme-options-grid">
            <button
              type="button"
              className={`theme-option-card ${themeMode === 'light' ? 'selected' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <span className="theme-option-icon">☀️</span>
              <span className="theme-option-label">Light Mode</span>
              <span className="theme-option-desc">Bright surfaces & high contrast</span>
            </button>

            <button
              type="button"
              className={`theme-option-card ${themeMode === 'dark' ? 'selected' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <span className="theme-option-icon">🌙</span>
              <span className="theme-option-label">Dark Mode</span>
              <span className="theme-option-desc">Sleek dark surfaces</span>
            </button>

            <button
              type="button"
              className={`theme-option-card ${themeMode === 'system' ? 'selected' : ''}`}
              onClick={() => handleThemeChange('system')}
            >
              <span className="theme-option-icon">🖥️</span>
              <span className="theme-option-label">System Auto</span>
              <span className="theme-option-desc">Match device OS theme setting</span>
            </button>
          </div>
        </section>

        {/* SECTION 3: QUIZ DEFAULTS */}
        <section className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">3. Quiz Preferences</h3>
            <span className="settings-card-desc">Set default configuration values for Mock Quiz and Live Quiz sessions.</span>
          </div>

          <div className="preferences-group">
            {/* Preferred Question Count */}
            <div className="preference-item">
              <label className="pref-label">Default Question Count</label>
              <div className="config-chips-grid">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    className={`config-chip ${preferences.preferredQuestionCount === cnt ? 'selected' : ''}`}
                    onClick={() => handlePreferenceChange('preferredQuestionCount', cnt)}
                  >
                    <span>{cnt} Questions</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Difficulty */}
            <div className="preference-item">
              <label className="pref-label">Default Difficulty Level</label>
              <div className="config-chips-grid">
                {['All Difficulties', 'Easy', 'Medium', 'Hard'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`config-chip ${preferences.preferredDifficulty === lvl ? 'selected' : ''}`}
                    onClick={() => handlePreferenceChange('preferredDifficulty', lvl)}
                  >
                    <span>{lvl}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Live Time Limit */}
            <div className="preference-item">
              <label className="pref-label">Default Live Question Time Limit</label>
              <div className="config-chips-grid">
                {[10, 15, 30].map((secs) => (
                  <button
                    key={secs}
                    type="button"
                    className={`config-chip ${preferences.preferredTimeLimit === secs ? 'selected' : ''}`}
                    onClick={() => handlePreferenceChange('preferredTimeLimit', secs)}
                  >
                    <span>{secs} Seconds</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: DATA MANAGEMENT & RESET */}
        <section className="settings-card danger-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">4. Learning Data Management</h3>
            <span className="settings-card-desc">Manage local storage data, clear history, or reset flashcards.</span>
          </div>

          <div className="data-actions-grid">
            <div className="data-action-item">
              <div>
                <h4 className="data-title">Clear Quiz History</h4>
                <p className="data-desc">Remove all completed quiz result logs and accuracy statistics. Flashcards will remain unaffected.</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-danger-text"
                onClick={() => setShowClearHistoryModal(true)}
              >
                Clear Quiz History
              </button>
            </div>

            <div className="data-action-item">
              <div>
                <h4 className="data-title">Reset Flashcard Deck</h4>
                <p className="data-desc">Permanently delete custom flashcards and restore the default technical sample deck.</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-danger-text"
                onClick={() => setShowResetCardsModal(true)}
              >
                Reset Flashcards Deck
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* CONFIRMATION MODAL: CLEAR QUIZ HISTORY */}
      {showClearHistoryModal && (
        <div className="modal-backdrop" onClick={() => setShowClearHistoryModal(false)}>
          <div
            className="modal-container warning-modal animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="clear-modal-title"
          >
            <div className="modal-header">
              <h3 id="clear-modal-title" className="modal-title">Clear Quiz History? ⚠️</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowClearHistoryModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="warning-modal-body">
              <p className="warning-text">
                This action will permanently delete all completed quiz logs and reset your accuracy statistics to 0%. Your flashcard collection will remain completely unaffected.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowClearHistoryModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger-sm"
                onClick={() => {
                  onClearQuizHistory();
                  setShowClearHistoryModal(false);
                  if (onShowToast) {
                    onShowToast('Quiz history cleared successfully.', 'success');
                  }
                }}
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: RESET FLASHCARDS DECK */}
      {showResetCardsModal && (
        <div className="modal-backdrop" onClick={() => setShowResetCardsModal(false)}>
          <div
            className="modal-container warning-modal animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="reset-modal-title"
          >
            <div className="modal-header">
              <h3 id="reset-modal-title" className="modal-title">Reset Flashcard Deck? ⚠️</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowResetCardsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="warning-modal-body">
              <p className="warning-text">
                This action will permanently delete your current flashcards and replace them with the default sample deck. This cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowResetCardsModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger-sm"
                onClick={() => {
                  onResetFlashcards();
                  setShowResetCardsModal(false);
                  if (onShowToast) {
                    onShowToast('Flashcards reset to default sample deck.', 'success');
                  }
                }}
              >
                Reset Flashcards Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
