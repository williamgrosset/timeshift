// Injected into MAIN world to relay any already-captured manifest URL
// to the ISOLATED world content script via postMessage.
if (window.__TIMESHIFT_MANIFEST__) {
  window.postMessage(window.__TIMESHIFT_MANIFEST__, '*');
}
