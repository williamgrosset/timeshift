// The interceptor is no longer needed — channel detection is done via URL parsing
// in player.content.ts and VOD fetching uses the public Twitch GQL API.
//
// This file is kept as a minimal stub in case we need MAIN world access later
// (e.g., for hooking into Twitch's player API).

export default defineContentScript({
  matches: ['*://*.twitch.tv/*'],
  world: 'MAIN',
  runAt: 'document_start',

  main() {
    // Reserved for future MAIN world hooks if needed.
  },
});
