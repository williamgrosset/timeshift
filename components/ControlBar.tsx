import type { PlayerState } from '@/lib/types';

interface ControlBarProps {
  state: PlayerState;
  onPlay: () => void;
  onPause: () => void;
  onGoLive: () => void;
}

function formatTime(seconds: number): string {
  const s = Math.round(Math.max(0, seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

export function ControlBar({ state, onPlay, onPause, onGoLive }: ControlBarProps) {
  const bufferedDuration = state.bufferEnd - state.bufferStart;
  const playbackPosition = state.currentTime - state.bufferStart;

  return (
    <div className="ts-controls">
      <button
        className="ts-controls__btn"
        onClick={state.playing ? onPause : onPlay}
        title={state.playing ? 'Pause' : 'Play'}
      >
        {state.playing ? PauseIcon() : PlayIcon()}
      </button>

      <span className="ts-controls__time">
        {formatTime(playbackPosition)} / {formatTime(bufferedDuration)}
      </span>

      <div className="ts-controls__spacer" />

      <button
        className={`ts-controls__go-live ${state.isLive ? 'ts-controls__go-live--live' : ''}`}
        onClick={onGoLive}
        title="Jump to live"
      >
        <span className="ts-controls__go-live-dot" />
        Go Live
      </button>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6 4l10 6-10 6V4z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <rect x="5" y="4" width="3" height="12" />
      <rect x="12" y="4" width="3" height="12" />
    </svg>
  );
}
