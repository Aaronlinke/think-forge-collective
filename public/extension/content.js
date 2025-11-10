// Think Forge Browser Automation - Content Script

console.log('Think Forge Automation - Content script loaded');

// Listen for commands from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received:', message.type);
  
  try {
    switch (message.type) {
      case 'command':
        handleCommand(message).then(result => {
          sendResponse(result);
          reportResult(message, result);
        }).catch(error => {
          const errorResult = { success: false, error: error.message };
          sendResponse(errorResult);
          reportResult(message, errorResult);
        });
        return true; // Keep channel open for async response
      
      case 'screenshot':
        captureAndAnalyze().then(result => {
          sendResponse(result);
        }).catch(error => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      
      case 'get-page-info':
        sendResponse(getPageInfo());
        return false;
      
      default:
        sendResponse({ success: false, error: 'Unknown command type' });
        return false;
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
    return false;
  }
});

async function handleCommand(command) {
  const { action, selector, coordinates, text, waitFor } = command;
  
  switch (action) {
    case 'click':
      return await clickElement(selector, coordinates);
    
    case 'type':
      return await typeText(selector, text);
    
    case 'scroll':
      return await scrollPage(command.direction, command.amount);
    
    case 'wait':
      return await waitForElement(selector, waitFor);
    
    case 'extract':
      return await extractData(selector);
    
    case 'navigate':
      window.location.href = command.url;
      return { success: true, action: 'navigate', url: command.url };
    
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function clickElement(selector, coordinates) {
  let element;
  
  if (selector) {
    element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
  } else if (coordinates) {
    element = document.elementFromPoint(coordinates.x, coordinates.y);
    if (!element) {
      throw new Error(`No element at coordinates: ${coordinates.x}, ${coordinates.y}`);
    }
  } else {
    throw new Error('Either selector or coordinates must be provided');
  }
  
  // Highlight element briefly
  highlightElement(element);
  
  // Click
  element.click();
  
  return {
    success: true,
    action: 'click',
    element: getElementInfo(element)
  };
}

async function typeText(selector, text) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  
  highlightElement(element);
  
  // Focus and type
  element.focus();
  
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    element.textContent = text;
  }
  
  return {
    success: true,
    action: 'type',
    element: getElementInfo(element),
    text
  };
}

async function scrollPage(direction, amount = 500) {
  const scrollAmount = direction === 'down' ? amount : -amount;
  window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
  
  return {
    success: true,
    action: 'scroll',
    direction,
    amount: scrollAmount
  };
}

async function waitForElement(selector, waitFor = 'appear', timeout = 10000) {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const check = () => {
      const element = document.querySelector(selector);
      const exists = !!element;
      const visible = exists && element.offsetParent !== null;
      
      const condition = waitFor === 'appear' ? visible : !visible;
      
      if (condition) {
        resolve({
          success: true,
          action: 'wait',
          selector,
          waitFor,
          duration: Date.now() - startTime
        });
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for element: ${selector}`));
      } else {
        setTimeout(check, 100);
      }
    };
    
    check();
  });
}

async function extractData(selector) {
  const elements = document.querySelectorAll(selector);
  const data = Array.from(elements).map(el => ({
    tag: el.tagName.toLowerCase(),
    text: el.textContent?.trim(),
    html: el.innerHTML,
    attributes: Array.from(el.attributes).reduce((acc, attr) => {
      acc[attr.name] = attr.value;
      return acc;
    }, {})
  }));
  
  return {
    success: true,
    action: 'extract',
    selector,
    count: data.length,
    data
  };
}

function getElementInfo(element) {
  const rect = element.getBoundingClientRect();
  return {
    tag: element.tagName.toLowerCase(),
    text: element.textContent?.trim().substring(0, 100),
    className: element.className,
    id: element.id,
    position: {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    }
  };
}

function highlightElement(element) {
  const originalBorder = element.style.border;
  const originalOutline = element.style.outline;
  
  element.style.border = '3px solid #ff6b35';
  element.style.outline = '3px solid #ff6b35';
  
  setTimeout(() => {
    element.style.border = originalBorder;
    element.style.outline = originalOutline;
  }, 1000);
}

function getPageInfo() {
  return {
    success: true,
    url: window.location.href,
    title: document.title,
    dimensions: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight
    },
    interactiveElements: {
      buttons: document.querySelectorAll('button').length,
      inputs: document.querySelectorAll('input, textarea').length,
      links: document.querySelectorAll('a').length
    }
  };
}

async function captureAndAnalyze() {
  // Request screenshot from background
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'capture-screenshot' }, (response) => {
      if (response && response.screenshot) {
        resolve({
          success: true,
          screenshot: response.screenshot,
          pageInfo: getPageInfo()
        });
      } else {
        reject(new Error('Failed to capture screenshot'));
      }
    });
  });
}

function reportResult(command, result) {
  chrome.runtime.sendMessage({
    type: 'result',
    command: command.type,
    result,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });
}

// Notify that content script is ready
chrome.runtime.sendMessage({
  type: 'content-ready',
  url: window.location.href
});
