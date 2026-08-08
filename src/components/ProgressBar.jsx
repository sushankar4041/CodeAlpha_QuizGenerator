/**
 * ProgressBar Component
 * Renders progress bar for quiz and study completion
 */
export default function ProgressBar({ value = 0, max = 100 }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="progress-bar-container">
      <div
        className="progress-bar-fill"
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}
