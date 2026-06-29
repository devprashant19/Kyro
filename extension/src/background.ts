chrome.runtime.onInstalled.addListener(() => {
  console.log("Kyro Context Tracker installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CAPTURE_CONTEXT") {
    console.log("Received context from content script:", message.data);
    
    // In the future: Send this data to our local Python backend
    // fetch('http://localhost:8000/api/capture', { ... })
    
    sendResponse({ status: "success" });
  }
  return true;
});
