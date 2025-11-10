// Think Forge Browser Automation - Popup Script

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const sessionInfo = document.getElementById('sessionInfo');
const serverUrlInput = document.getElementById('serverUrl');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const screenshotBtn = document.getElementById('screenshotBtn');
const pageInfoBtn = document.getElementById('pageInfoBtn');

// Load saved server URL
chrome.storage.local.get(['serverUrl'], (result) => {
  if (result.serverUrl) {
    serverUrlInput.value = result.serverUrl;
  }
});

// Update status
function updateStatus(connected) {
  if (connected) {
    statusDot.classList.add('connected');
    statusText.textContent = 'Verbunden';
  } else {
    statusDot.classList.remove('connected');
    statusText.textContent = 'Getrennt';
    sessionInfo.textContent = '';
  }
}

// Check initial status
chrome.runtime.sendMessage({ type: 'get-status' }, (response) => {
  updateStatus(response?.connected || false);
});

// Listen for status updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'connection-status') {
    updateStatus(message.connected);
    if (message.sessionId) {
      sessionInfo.textContent = `Session: ${message.sessionId.slice(0, 8)}...`;
    }
  }
});

// Connect button
connectBtn.addEventListener('click', () => {
  const url = serverUrlInput.value.trim();
  if (url) {
    chrome.storage.local.set({ serverUrl: url }, () => {
      chrome.runtime.sendMessage({ 
        type: 'connect',
        url 
      }, (response) => {
        if (response?.success) {
          statusText.textContent = 'Verbinde...';
        }
      });
    });
  }
});

// Disconnect button
disconnectBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'disconnect' }, (response) => {
    if (response?.success) {
      updateStatus(false);
    }
  });
});

// Screenshot button
screenshotBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'screenshot' }, (response) => {
      console.log('Screenshot response:', response);
    });
  });
});

// Page info button
pageInfoBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'get-page-info' }, (response) => {
      console.log('Page info:', response);
      alert(JSON.stringify(response, null, 2));
    });
  });
});
