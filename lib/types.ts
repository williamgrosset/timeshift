import type { MSG } from './constants';

/** Message posted from the MAIN world interceptor to the ISOLATED world. */
export interface ManifestMessage {
  type: typeof MSG.MANIFEST_URL | typeof MSG.MANIFEST_REFRESHED;
  url: string;
  channel: string;
}

/** Persisted extension settings. */
export interface TimeshiftSettings {
  enabled: boolean;
  autoActivate: boolean;
  backBufferSeconds: number;
  preferredQuality: string;
}

/** Player state exposed to the UI layer. */
export interface PlayerState {
  playing: boolean;
  currentTime: number;
  /** Earliest seekable time in the buffer (seconds from epoch or relative). */
  bufferStart: number;
  /** Latest seekable time (live edge). */
  bufferEnd: number;
  /** How far behind the live edge, in seconds. */
  latency: number;
  /** Whether we're at (or very near) the live edge. */
  isLive: boolean;
  /** Available quality levels from the master playlist. */
  qualityLevels: QualityLevel[];
  /** Index of the active quality level (-1 = auto). */
  activeQuality: number;
}

export interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
  label: string;
}
