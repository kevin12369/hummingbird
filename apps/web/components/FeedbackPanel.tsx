import type { FeedbackCategory, FeedbackOutput, FeedbackSeverity } from '@hummingbird/feedback';

const SEVERITY_COLORS: Record<FeedbackSeverity, string> = {
  praise: 'border-emerald-500 text-emerald-300 bg-emerald-900/20',
  info: 'border-zinc-500 text-zinc-300',
  warning: 'border-amber-500 text-amber-300 bg-amber-900/20',
};

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  pitch: '音准',
  rhythm: '节奏',
  tempo: '速度',
  style: '风格',
  praise: '肯定',
};

export interface FeedbackPanelProps {
  feedback: FeedbackOutput | null;
  feedbackError: string | null;
  loading: boolean;
  onGenerate: () => void;
}

export function FeedbackPanel({ feedback, feedbackError, loading, onGenerate }: FeedbackPanelProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-zinc-800 pt-4">
      <div className="flex items-center">
        <h3 className="text-sm font-medium text-zinc-200">Feedback</h3>
        {!feedback && !feedbackError && (
          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="ml-auto rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Generating feedback...' : 'Get feedback'}
          </button>
        )}
      </div>

      {feedback && (
        <ul className="flex flex-col gap-2">
          {feedback.items.map((item, i) => (
            <li
              key={i}
              className={`rounded border p-2 text-sm ${SEVERITY_COLORS[item.severity]}`}
            >
              <span className="text-xs uppercase opacity-70 mr-2">[{CATEGORY_LABELS[item.category] ?? item.category}]</span>
              {item.text}
            </li>
          ))}
        </ul>
      )}

      {feedbackError && (
        <p className="text-sm text-red-300">{feedbackError}</p>
      )}
    </div>
  );
}
