import { useState } from 'react';
import MockQuizConfig from './MockQuizConfig';
import MockQuizSession from './MockQuizSession';
import MockQuizResults from './MockQuizResults';
import MockQuizReview from './MockQuizReview';
import { generateMockQuiz } from '../utils/quizUtils';

/**
 * Mock Quiz Master Coordinator Component - Phase 6C
 * Orchestrates Mock Quiz stages: Config -> Active Session -> Results -> Answer Review
 * Migrated browser alert to toast notification system.
 */
export default function MockQuiz({ flashcards = [], onSaveQuizResult, onNavigateToFlashcards, onShowToast }) {
  const [stage, setStage] = useState('config'); // 'config' | 'active' | 'results' | 'review'
  const [activeConfig, setActiveConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [result, setResult] = useState(null);

  // 1. Start Quiz Handler (Generate Quiz & Begin Session)
  const handleStartQuiz = (configData) => {
    setActiveConfig(configData);

    const generated = generateMockQuiz({
      flashcards,
      category: configData.category,
      difficulty: configData.difficulty,
      requestedCount: configData.questionCount
    });

    if (!generated.success) {
      if (onShowToast) {
        onShowToast('Could not generate quiz with selected settings.', 'error');
      }
      return;
    }

    setQuestions(generated.questions);
    setUserAnswers({});
    setResult(null);
    setStage('active');
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
      difficulty: activeConfig?.difficulty || 'All Difficulties'
    };

    setResult(resultData);

    if (onSaveQuizResult) {
      onSaveQuizResult(resultData);
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
          onStartQuiz={handleStartQuiz}
          onNavigateToFlashcards={onNavigateToFlashcards}
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
