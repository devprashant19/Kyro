let socket: WebSocket | null = null;
let reconnectInterval = 5000;
let isConnecting = false;

function connectWebSocket() {
  if (isConnecting || (socket && socket.readyState === WebSocket.OPEN)) return;
  
  isConnecting = true;
  console.log("Kyro: Attempting to connect to backend via WebSocket...");
  
  socket = new WebSocket('ws://localhost:8000/api/ws/capture');

  socket.onopen = () => {
    console.log("Kyro: WebSocket connection established.");
    isConnecting = false;
  };

  socket.onmessage = (event) => {
    console.log("Kyro: Received message from server:", event.data);
  };

  socket.onclose = () => {
    console.log("Kyro: WebSocket connection closed. Reconnecting in 5s...");
    isConnecting = false;
    socket = null;
    setTimeout(connectWebSocket, reconnectInterval);
  };

  socket.onerror = (error) => {
    console.error("Kyro: WebSocket error:", error);
    socket?.close();
  };
}

let captureQueue: any[] = [];
const STORAGE_KEY = "kyro_offline_queue";

// Load from storage on boot
chrome.storage.local.get([STORAGE_KEY], (result) => {
  if (result[STORAGE_KEY] && Array.isArray(result[STORAGE_KEY])) {
    captureQueue = result[STORAGE_KEY];
    console.log(`Kyro: Loaded ${captureQueue.length} offline captures from storage.`);
  }
});

function saveQueueToStorage() {
  chrome.storage.local.set({ [STORAGE_KEY]: captureQueue });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("Kyro Context Tracker installed.");
  connectWebSocket();
  
  // Start the batch processor
  setInterval(() => {
    if (captureQueue.length > 0 && socket && socket.readyState === WebSocket.OPEN) {
      console.log(`Kyro: Flushing batch of ${captureQueue.length} items to backend...`);
      socket.send(JSON.stringify({
        type: "BATCH",
        payloads: captureQueue
      }));
      captureQueue = []; // Clear the queue after sending
      saveQueueToStorage(); // Clear storage as well
    }
  }, 3000);
});

function summarizePayload(payload: any) {
  if (payload && payload.text && payload.text.length > 1000) {
    const rawText = payload.text;
    // Find the nearest period before 1000 chars to slice cleanly
    let sliceIndex = rawText.lastIndexOf('.', 1000);
    if (sliceIndex === -1) sliceIndex = 1000;
    
    payload.text = rawText.substring(0, sliceIndex + 1) + "\n\n[...truncated for bandwidth optimization]";
    console.log(`Kyro: Summarized massive payload down to ${payload.text.length} chars.`);
  }
  return payload;
}

chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.type === "CAPTURE_CONTEXT") {
    console.log("Kyro: Queueing context capture.");
    const optimizedData = summarizePayload(message.data);
    captureQueue.push(optimizedData);
    saveQueueToStorage(); // Persist immediately for offline mode
    
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not open. Trying to reconnect...");
      connectWebSocket();
    }
    
    sendResponse({ status: "success", message: "Queued for batch transmission" });
    return true;
  }
});

// Listen for the hotkey command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "kyro-manual-capture") {
    console.log("Kyro: Manual capture hotkey triggered!");
    
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id || !tab.url) return;

      // Execute script to get highlighted text
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString()
      });

      const selectedText = results[0]?.result;
      if (selectedText && selectedText.trim().length > 0) {
        const payload = {
          url: tab.url,
          title: tab.title || "Manual Capture",
          text: `Highlighted Selection: ${selectedText.trim()}`,
          domain: new URL(tab.url).hostname,
          timestamp: new Date().toISOString(),
          type: "selection"
        };
        
        console.log("Kyro: Queueing manual capture:", payload);
        const optimizedPayload = summarizePayload(payload);
        captureQueue.push(optimizedPayload);
        saveQueueToStorage();
        
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          connectWebSocket();
        }
      } else {
        console.log("Kyro: No text was highlighted.");
      }
    } catch (err) {
      console.error("Kyro: Failed to execute manual capture script:", err);
    }
  }
});

// Try connecting immediately when background script wakes up
connectWebSocket();
