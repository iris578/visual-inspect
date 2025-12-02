// Content script - runs on all pages
// This is a lightweight script that listens for activation commands

// Listen for keyboard shortcut (Ctrl+Shift+V or Cmd+Shift+V)
document.addEventListener('keydown', (e) => {
  // Check for Ctrl+Shift+V (Windows/Linux) or Cmd+Shift+V (Mac)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
    e.preventDefault();

    // Toggle VisBug
    if (window.visbug) {
      window.visbug.deactivate();
    } else {
      // Load and activate VisBug
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('visbug.js');
      document.head.appendChild(script);
    }
  }
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    if (window.visbug) {
      window.visbug.deactivate();
      sendResponse({ active: false });
    } else {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('visbug.js');
      document.head.appendChild(script);
      sendResponse({ active: true });
    }
  }
  return true;
});
