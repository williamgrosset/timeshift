/** URL pattern for Twitch HLS master playlists served by Usher. */
export const USHER_HLS_PATTERN = 'usher.ttvnw.net/api/channel/hls/';

/** Message types for communication between MAIN world and ISOLATED world. */
export const MSG = {
  MANIFEST_URL: 'TIMESHIFT_MANIFEST_URL',
  MANIFEST_REFRESHED: 'TIMESHIFT_MANIFEST_REFRESHED',
} as const;

/**
 * Twitch DOM selectors. Subject to breakage on Twitch site updates.
 * Twitch uses CSS modules so class names get hashed prefixes (e.g. "XAC.player-controls__right-control-group").
 * We use [class*=] substring selectors to match regardless of the prefix.
 */
export const SELECTORS = {
  /** Outer video player wrapper. */
  VIDEO_PLAYER: '[class*="video-player"]',
  /** Inner player container — fallback to the first match with a video child. */
  VIDEO_PLAYER_CONTAINER: '[class*="video-player__container"]',
  /** The native <video> element inside the player. */
  VIDEO_ELEMENT: 'video',
  /** Right-side control group where we inject the Timeshift toggle. */
  CONTROLS_RIGHT: '[class*="player-controls__right-control-group"]',
  /** Data attribute Twitch uses for targeting — more stable than class names. */
  PLAYER_OVERLAY: '[data-a-target="player-overlay-click-handler"]',
} as const;

/** Default extension settings. */
export const DEFAULTS = {
  enabled: true,
  autoActivate: false,
  /** Back-buffer duration in seconds (30 minutes). */
  backBufferSeconds: 1800,
  /** Preferred quality label (e.g. "720p60", "1080p60", "auto"). */
  preferredQuality: 'auto',
} as const;
