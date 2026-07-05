import { toggleSpotlight } from './spotlight';

// Listen for TOGGLE_SPOTLIGHT from the background service worker
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_SPOTLIGHT') {
    toggleSpotlight();
  }
});



function extractMainContent(): string {
  // Try to find the main content container
  const selectors = ['article', 'main', '.markdown-body', '.post-content', '#content', '[role="main"]'];
  let contentElement: HTMLElement | null = null;
  
  for (const selector of selectors) {
    contentElement = document.querySelector(selector);
    if (contentElement) break;
  }

  // Fallback to grabbing all paragraphs if no semantic main container is found
  if (!contentElement) {
    const paragraphs = Array.from(document.querySelectorAll('p'));
    return paragraphs.map(p => p.innerText.trim()).filter(text => text.length > 50).join('\\n\\n');
  }

  return contentElement.innerText.trim();
}

function captureContext() {
  const url = window.location.href;
  const title = document.title;
  const content = extractMainContent();
  
  if (content.length < 100) {
    console.log("[Kyro] Page content too short, skipping capture.");
    return;
  }

  const data = {
    url,
    title,
    text: content,
    domain: window.location.hostname,
    timestamp: new Date().toISOString(),
    type: "page_view"
  };

  chrome.runtime.sendMessage({
    type: "CAPTURE_CONTEXT",
    data
  });
}

// Engagement Tracking Variables
let engagementTime = 0;
let hasCaptured = false;
let lastInteraction = Date.now();

// 15 seconds of active reading required for Hackathon demo (Production would be 120s)
const REQUIRED_ENGAGEMENT_MS = 15000; 

// Privacy guard — reads blocklist from storage before firing a capture
function shouldCapture(hostname: string, blocklist: string[], mode: 'block' | 'allow'): boolean {
  const match = blocklist.some(d => hostname.includes(d));
  if (mode === 'allow') return match;   // Allowlist: capture ONLY if in list
  return !match;                         // Blocklist: capture if NOT in list
}

function checkEngagement() {
  if (hasCaptured) return;
  
  const now = Date.now();
  // If user interacted within the last 5 seconds, they are actively engaged
  if (now - lastInteraction < 5000) {
    engagementTime += 1000; // Add 1 second to total engagement time
  }

  if (engagementTime >= REQUIRED_ENGAGEMENT_MS) {
    chrome.storage.local.get(['kyro_blocklist', 'kyro_blocklist_mode'], (result: any) => {
      const bl: string[] = (result.kyro_blocklist as string[]) || [];
      const mode: 'block' | 'allow' = (result.kyro_blocklist_mode as 'block' | 'allow') || 'block';
      if (shouldCapture(window.location.hostname, bl, mode)) {
        console.log("[Kyro] User engagement threshold reached. Capturing article.");
        hasCaptured = true;
        captureContext();
      } else {
        console.log(`[Kyro] Capture suppressed by Privacy Controls for: ${window.location.hostname}`);
        hasCaptured = true; // Mark as handled so we don't retry
      }
    });
  } else {
    // Check again in 1 second
    setTimeout(checkEngagement, 1000);
  }
}

// Track user interactions to prove they are actively reading
const recordInteraction = () => { lastInteraction = Date.now(); };
document.addEventListener('scroll', recordInteraction, { passive: true });
document.addEventListener('mousemove', recordInteraction, { passive: true });
document.addEventListener('keydown', recordInteraction, { passive: true });

// Start the engagement loop
setTimeout(checkEngagement, 1000);
// Listen for text selection via custom keybind
document.addEventListener('keydown', (e) => {
  chrome.storage.local.get(['kyro_capture_keybind', 'kyro_blocklist', 'kyro_blocklist_mode'], (result: any) => {
    const hotkey = (result.kyro_capture_keybind as string) || 'Alt+C';
    const bl: string[] = (result.kyro_blocklist as string[]) || [];
    const mode: 'block' | 'allow' = (result.kyro_blocklist_mode as 'block' | 'allow') || 'block';
    
    const parts = hotkey.split('+').map((p: string) => p.trim().toLowerCase());
    const needsAlt = parts.includes('alt');
    const needsCtrl = parts.includes('ctrl');
    const needsShift = parts.includes('shift');
    const needsMeta = parts.includes('meta') || parts.includes('cmd');
    const key = parts.find((p: string) => !['alt', 'ctrl', 'shift', 'meta', 'cmd'].includes(p));
    
    // Use e.code (e.g. "KeyC") instead of e.key because when Alt is held,
    // e.key returns special chars like "©" instead of "c" on some systems.
    const pressedKey = e.code.replace('Key', '').replace('Digit', '').toLowerCase();
    
    if (
      e.altKey === needsAlt &&
      e.ctrlKey === needsCtrl &&
      e.shiftKey === needsShift &&
      e.metaKey === needsMeta &&
      key && pressedKey === key
    ) {
      // Check privacy controls before capturing
      if (!shouldCapture(window.location.hostname, bl, mode)) {
        console.log(`[Kyro] Keybind capture suppressed by Privacy Controls for: ${window.location.hostname}`);
        return;
      }

      const selection = window.getSelection()?.toString();
      if (selection && selection.length > 0) {
        chrome.runtime.sendMessage({
          type: "CAPTURE_CONTEXT",
          data: {
            text: selection,
            url: window.location.href,
            title: `Selection from: ${document.title}`,
            timestamp: new Date().toISOString(),
            type: "selection",
            domain: window.location.hostname
          }
        });
        
        // Visual feedback
        const el = document.createElement('div');
        el.innerText = '✨ Captured to Kyro!';
        el.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#a855f7;color:white;padding:8px 16px;border-radius:8px;z-index:999999;font-family:sans-serif;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition: opacity 0.3s;';
        document.body.appendChild(el);
        setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 1500);
      }
    }
  });
});
