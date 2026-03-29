import type { PlayerState } from '@/lib/types';

interface StatusIndicatorProps {
  state: PlayerState;
}

function formatBehind(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s behind`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return `${mins}m ${secs}s behind`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m behind`;
}

export function StatusIndicator({ state }: StatusIndicatorProps) {
  return (
    <div className="ts-status">
      {state.isLive ? (
        <span className="ts-status__live">LIVE</span>
      ) : (
        <span className="ts-status__behind">{formatBehind(state.latency)}</span>
      )}
    </div>
  );
}
