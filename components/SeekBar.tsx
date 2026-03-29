import { useRef, useCallback } from 'react';
import type { PlayerState } from '@/lib/types';

interface SeekBarProps {
  state: PlayerState;
  onSeek: (time: number) => void;
}

export function SeekBar({ state, onSeek }: SeekBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const { bufferStart, bufferEnd, currentTime } = state;
  const duration = bufferEnd - bufferStart;
  const progress = duration > 0 ? (currentTime - bufferStart) / duration : 0;
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = barRef.current;
      if (!bar || duration <= 0) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(bufferStart + ratio * duration);
    },
    [bufferStart, duration, onSeek],
  );

  return (
    <div className="ts-seekbar" ref={barRef} onClick={handleClick}>
      <div className="ts-seekbar__track">
        {/* Buffered region (full width since the bar represents the buffer) */}
        <div className="ts-seekbar__buffered" />
        {/* Playback progress */}
        <div
          className="ts-seekbar__progress"
          style={{ width: `${clampedProgress * 100}%` }}
        />
        {/* Thumb */}
        <div
          className="ts-seekbar__thumb"
          style={{ left: `${clampedProgress * 100}%` }}
        />
      </div>
    </div>
  );
}
