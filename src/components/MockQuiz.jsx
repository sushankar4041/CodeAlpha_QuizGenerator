import { useState } from 'react';
import MockQuizConfig from './MockQuizConfig';
import MockQuizSession from './MockQuizSession';
import MockQuizResults from './MockQuizResults';
import MockQuizReview from './MockQuizReview';
import { getQuestions } from '../services/questionBankService';

/**
 * Mock Quiz Master Coordinator Component - Phase 8B
 * Orchestrates Mock Quiz stages: Config -> Active Session -> Results -> Answer Review
 * Consumes questionBankService for System Question Bank & User Flashcards.
 */
export default function MockQuiz({ flashcards = [], selectedQuizCardIds = null, preferences, onSaveQuizResult, onNavigateToFlashcards, onShowToast }) {
  const [stage, setStage] = useState('config'); // 'config' | 'active' | 'results' | 'review'
  const [activeConfig, setActiveConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Start Quiz Handler (Generate Quiz & Begin Session)
  const handleStartQuiz = async (configData) => {
    setActiveConfig(configData);
    setLoading(true);

    try {
      const generated = await getQuestions({
        category: configData.category,
        difficulty: configData.difficulty,
        requestedCount: configData.questionCount,
        source: configData.source || 'system',
        mode: configData.mode || 'standard',
        selectedCardIds: configData.selectedCardIds || (configData.source === 'selected' ? selectedQuizCardIds : null),
        flashcards
      });

      if (!generated.success || generated.questions.length === 0) {
        if (onShowToast) {
          onShowToast('Could not generate quiz with selected settings.', 'error');
        }
        return;
      }

      if (generated.warning && onShowToast) {
        onShowToast(generated.warning, 'info');
      }

      setQuestions(generated.questions);
      setActiveConfig({ ...configData, modeNotice: generated.modeNotice });
      setUserAnswers({});
      setResult(null);
      setStage('active');
    } catch (err) {
      console.error('Error starting mock quiz:', err);
      if (onShowToast) {
        onShowToast('An error occurred while generating the quiz.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Select Answer Handler
  const handleSelectAnswer = (quizQuestionId, selectedOption) => {
    setUserAnswers((prev) => ({
      ...prev,
      [quizQuestionId]: selectedOption
    }));
  };

  // 3. Submit Quiz & Evaluate Results
  const handleSubmitQuiz = () => {
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    questions.forEach((q) => {
      const ans = userAnswers[q.quizQuestionId];
      if (!ans) {
        unansweredCount++;
      } else if (ans.trim() === q.correctAnswer.trim()) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const resultData = {
      score: `${correctCount} / ${totalQuestions}`,
      percentage,
      totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unanswered: unansweredCount,
      category: activeConfig?.category || 'All Categories',
      difficulty: activeConfig?.difficulty || 'All Difficulties',
      mode: activeConfig?.mode || 'standard',
      modeNotice: activeConfig?.modeNotice || null
    };

    const flashcardAttempts = questions
      .filter((q) => q.flashcardId)
      .map((q) => {
        const userAns = userAnswers[q.quizQuestionId];
        if (!userAns) return null; // unanswered -> omit from attempts
        return {
          flashcardId: q.flashcardId,
          isCorrect: userAns.trim() === q.correctAnswer.trim()
        };
      })
      .filter(Boolean);

    setResult(resultData);

    if (onSaveQuizResult) {
      onSaveQuizResult(resultData, flashcardAttempts);
    }

    if (onShowToast) {
      onShowToast(`Mock Quiz completed! Score: ${percentage}%`, 'success');
    }

    setStage('results');
  };

  // 4. Retake Quiz with Same Configuration
  const handleRetakeQuiz = () => {
    if (activeConfig) {
      handleStartQuiz(activeConfig);
    } else {
      setStage('config');
    }
  };

  // 5. Reset to New Quiz Setup
  const handleNewQuiz = () => {
    setActiveConfig(null);
    setQuestions([]);
    setUserAnswers({});
    setResult(null);
    setStage('config');
  };

  return (
    <div className="mock-quiz-wrapper">
      {stage === 'config' && (
        <MockQuizConfig
          flashcards={flashcards}
          selectedQuizCardIds={selectedQuizCardIds}
          preferences={preferences}
          onStartQuiz={handleStartQuiz}
          onNavigateToFlashcards={onNavigateToFlashcards}
          loading={loading}
        />
      )}

      {stage === 'active' && (
        <MockQuizSession
          questions={questions}
          userAnswers={userAnswers}
          onSelectAnswer={handleSelectAnswer}
          onSubmitQuiz={handleSubmitQuiz}
        />
      )}

      {stage === 'results' && result && (
        <MockQuizResults
          result={result}
          onReviewAnswers={() => setStage('review')}
          onRetakeQuiz={handleRetakeQuiz}
          onNewQuiz={handleNewQuiz}
        />
      )}

      {stage === 'review' && (
        <MockQuizReview
          questions={questions}
          userAnswers={userAnswers}
          onBackToResults={() => setStage('results')}
          onNewQuiz={handleNewQuiz}
        />
      )}
    </div>
  );
}
