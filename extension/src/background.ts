chrome.runtime.onInstalled.addListener(() => {
  console.log("Kyro Context Tracker installed.");
});

chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.type === "CAPTURE_CONTEXT") {
    console.log("Received context from content script, sending to Kyro backend:", message.data);
    
    fetch('http://localhost:8000/api/capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message.data)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      sendResponse({ status: "success", data });
    })
    .catch((error) => {
      console.error('Error:', error);
      sendResponse({ status: "error", error: error.toString() });
    });
    
    return true; // Keep the message channel open for async response
  }
});
