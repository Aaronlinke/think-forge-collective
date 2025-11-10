// Think Forge Browser Automation - Background Service Worker

let wsConnection = null;
let isConnected = false;
let reconnectTimeout = null;

// Load settings from storage
chrome.storage.local.get(['serverUrl', 'autoConnect'], (result) => {
  const serverUrl = result.serverUrl || 'wss://cyzgmlgbpbcyomlkvrrm.supabase.co/functions/v1/browser-bridge';
  
  if (result.autoConnect !== false) {
    connectWebSocket(serverUrl);
  }
});

function connectWebSocket(url) {
  console.log('Connecting to WebSocket:', url);
  
  try {
    wsConnection = new WebSocket(url);
    
    wsConnection.onopen = () => {
      console.log('WebSocket connected');
      isConnected = true;
      
      // Notify popup
      chrome.runtime.sendMessage({
        type: 'connection-status',
        connected: true
      }).catch(() => {}); // Ignore if popup is closed
      
      // Clear reconnect timeout
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };
    
    wsConnection.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received message:', message.type);
        
        // Forward to content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, message).catch(console.error);
          }
        });
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnected = false;
    };
    
    wsConnection.onclose = () => {
      console.log('WebSocket disconnected');
      isConnected = false;
      
      // Notify popup
      chrome.runtime.sendMessage({
        type: 'connection-status',
        connected: false
      }).catch(() => {});
      
      // Reconnect after 5 seconds
      reconnectTimeout = setTimeout(() => {
        console.log('Attempting to reconnect...');
        chrome.storage.local.get(['serverUrl'], (result) => {
          const serverUrl = result.serverUrl || 'wss://cyzgmlgbpbcyomlkvrrm.supabase.co/functions/v1/browser-bridge';
          connectWebSocket(serverUrl);
        });
      }, 5000);
    };
  } catch (error) {
    console.error('Error creating WebSocket:', error);
    isConnected = false;
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received:', message.type);
  
  if (message.type === 'connect') {
    chrome.storage.local.get(['serverUrl'], (result) => {
      const serverUrl = result.serverUrl || message.url || 'wss://cyzgmlgbpbcyomlkvrrm.supabase.co/functions/v1/browser-bridge';
      connectWebSocket(serverUrl);
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (message.type === 'disconnect') {
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
    }
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'get-status') {
    sendResponse({ connected: isConnected });
    return true;
  }
  
  // Forward to WebSocket
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    wsConnection.send(JSON.stringify(message));
    sendResponse({ success: true });
  } else {
    sendResponse({ success: false, error: 'Not connected' });
  }
  
  return true;
});

// Take screenshot
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'capture-screenshot') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      sendResponse({ screenshot: dataUrl });
      
      // Send to WebSocket
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({
          type: 'screenshot',
          data: dataUrl,
          url: sender.tab?.url,
          timestamp: new Date().toISOString()
        }));
      }
    });
    return true;
  }
});

console.log('Think Forge Browser Automation - Background script loaded');
