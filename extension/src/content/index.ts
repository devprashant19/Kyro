function captureContext() {
  const url = window.location.href;
  const title = document.title;
  
  // Basic context extraction
  const data = {
    url,
    title,
    domain: window.location.hostname,
    timestamp: new Date().toISOString()
  };

  chrome.runtime.sendMessage({
    type: "CAPTURE_CONTEXT",
    data
  });
}

// Initial capture on page load
captureContext();

// Optional: listen for text selection or navigation events later
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection()?.toString();
  if (selection && selection.length > 20) {
    chrome.runtime.sendMessage({
      type: "CAPTURE_CONTEXT",
      data: {
        type: "selection",
        text: selection,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    });
  }
});
