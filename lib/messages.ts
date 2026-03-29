import { MSG, USHER_HLS_PATTERN } from './constants';
import type { ManifestMessage } from './types';

/**
 * Extract the channel name from a Usher HLS URL.
 * e.g. "https://usher.ttvnw.net/api/channel/hls/xqc.m3u8?sig=..." → "xqc"
 */
export function parseChannelFromUrl(url: string): string | null {
  const idx = url.indexOf(USHER_HLS_PATTERN);
  if (idx === -1) return null;
  const afterPattern = url.substring(idx + USHER_HLS_PATTERN.length);
  const dotIdx = afterPattern.indexOf('.');
  return dotIdx === -1 ? null : afterPattern.substring(0, dotIdx);
}

/** Post a manifest URL from the MAIN world to the ISOLATED content script. */
export function postManifestUrl(url: string, isRefresh: boolean): void {
  const channel = parseChannelFromUrl(url);
  if (!channel) return;

  const message: ManifestMessage = {
    type: isRefresh ? MSG.MANIFEST_REFRESHED : MSG.MANIFEST_URL,
    url,
    channel,
  };
  window.postMessage(message, '*');
}

/** Type guard for ManifestMessage received via window message events. */
export function isManifestMessage(data: unknown): data is ManifestMessage {
  if (typeof data !== 'object' || data === null) return false;
  const msg = data as Record<string, unknown>;
  return (
    (msg.type === MSG.MANIFEST_URL || msg.type === MSG.MANIFEST_REFRESHED) &&
    typeof msg.url === 'string' &&
    typeof msg.channel === 'string'
  );
}
