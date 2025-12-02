// Background service worker for VisBug extension

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  // Inject VisBug into the current tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['visbug.js']
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'activate') {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // Inject VisBug into the active tab
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['visbug.js']
        });
      }
    });
  } else if (request.action === 'deactivate') {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // Execute deactivation script
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            if (window.visbug) {
              window.visbug.deactivate();
            }
          }
        });
      }
    });
  }

  sendResponse({ success: true });
  return true;
});
