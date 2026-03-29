import { useState, useCallback, useEffect, useRef } from 'react';
import type { PlayerState } from '@/lib/types';
import { SeekBar } from './SeekBar';
import { ControlBar } from './ControlBar';
import { StatusIndicator } from './StatusIndicator';

interface PlayerOverlayProps {
  state: PlayerState;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onGoLive: () => void;
}

export function PlayerOverlay({
  state,
  onPlay,
  onPause,
  onSeek,
  onGoLive,
}: PlayerOverlayProps) {
  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);

  const resetHideTimer = useCallback(() => {
    setVisible(true);
    if (hideTimer.current !== null) clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (state.playing) setVisible(false);
    }, 3000);
  }, [state.playing]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimer.current !== null) clearTimeout(hideTimer.current);
    };
  }, [resetHideTimer]);

  return (
    <div
      className={`ts-overlay ${visible ? 'ts-overlay--visible' : 'ts-overlay--hidden'}`}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => state.playing && setVisible(false)}
    >
      <div className="ts-overlay__top">
        <StatusIndicator state={state} />
      </div>
      <div className="ts-overlay__bottom">
        <SeekBar state={state} onSeek={onSeek} />
        <ControlBar
          state={state}
          onPlay={onPlay}
          onPause={onPause}
          onGoLive={onGoLive}
        />
      </div>
    </div>
  );
}
