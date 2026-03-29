export default defineBackground(() => {
  // Track which tabs have Timeshift active
  const activeTabs = new Set<number>();

  chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.type === 'TIMESHIFT_STATE' && sender.tab?.id != null) {
      const tabId = sender.tab.id;

      if (message.active) {
        activeTabs.add(tabId);
      } else {
        activeTabs.delete(tabId);
      }

      updateBadge(tabId, message.active);
    }
  });

  // Clean up when a tab is closed
  chrome.tabs.onRemoved.addListener((tabId) => {
    activeTabs.delete(tabId);
  });

  function updateBadge(tabId: number, active: boolean): void {
    if (active) {
      chrome.action.setBadgeText({ text: 'DVR', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#9147ff', tabId });
    } else {
      chrome.action.setBadgeText({ text: '', tabId });
    }
  }
});
