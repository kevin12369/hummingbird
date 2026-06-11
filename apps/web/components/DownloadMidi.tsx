import { useMemo } from 'react';

export interface DownloadMidiProps {
  midi: Blob | null;
  filename?: string;
}

export function DownloadMidi({ midi, filename = 'hummingbird.mid' }: DownloadMidiProps) {
  const url = useMemo(() => midi ? URL.createObjectURL(midi) : null, [midi]);
  if (!url) return null;
  return (
    <a
      href={url}
      download={filename}
      className="rounded bg-primary text-black px-4 py-2 font-medium inline-block"
    >
      Download .mid
    </a>
  );
}
