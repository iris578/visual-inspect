// Popup script for VisBug extension

const activateBtn = document.getElementById('activateBtn');
const deactivateBtn = document.getElementById('deactivateBtn');
const statusEl = document.getElementById('status');

// Activate VisBug
activateBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'activate' }, (response) => {
    if (response.success) {
      updateStatus(true);
      // Close popup after activation
      setTimeout(() => window.close(), 500);
    }
  });
});

// Deactivate VisBug
deactivateBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'deactivate' }, (response) => {
    if (response.success) {
      updateStatus(false);
    }
  });
});

// Update status UI
function updateStatus(active) {
  if (active) {
    statusEl.textContent = 'Status: Active ✓';
    statusEl.className = 'status active';
  } else {
    statusEl.textContent = 'Status: Inactive';
    statusEl.className = 'status inactive';
  }
}

// Check current status on popup open
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'checkStatus' }, (response) => {
      if (response && response.active) {
        updateStatus(true);
      }
    });
  }
});
