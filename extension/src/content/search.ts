function captureSearchIntent() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');
  
  if (!query || query.trim() === '') {
    return;
  }

  const cleanQuery = query.trim();

  // Deduplication check: Avoid capturing the exact same search multiple times if the user is just navigating pagination
  const lastSearch = sessionStorage.getItem('kyro_last_search');
  if (lastSearch === cleanQuery) {
    return;
  }
  sessionStorage.setItem('kyro_last_search', cleanQuery);

  const data = {
    url: window.location.href,
    title: `Search: ${cleanQuery}`,
    text: `[Search Intent] User is researching: ${cleanQuery}`,
    domain: window.location.hostname,
    timestamp: new Date().toISOString(),
    type: "search_intent"
  };

  chrome.runtime.sendMessage({
    type: "CAPTURE_CONTEXT",
    data
  });
  
  console.log(`[Kyro] Captured Search Intent: "${cleanQuery}"`);
}

// Execute immediately
captureSearchIntent();
