export interface KeyDisplayProps {
  keyName: string | null;
  mode: 'major' | 'minor' | null;
  bpm: number | null;
  confidence: number | null;
}

export function KeyDisplay({ keyName, mode, bpm, confidence }: KeyDisplayProps) {
  if (!keyName || !mode || bpm == null) return null;
  return (
    <div className="flex items-center gap-4 text-sm">
      <span><strong>Key:</strong> {keyName} {mode}</span>
      <span><strong>BPM:</strong> {bpm}</span>
      {confidence != null && confidence < 0.5 && (
        <span className="text-amber-300">! Low confidence ({(confidence * 100).toFixed(0)}%)</span>
      )}
    </div>
  );
}
