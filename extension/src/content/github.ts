function extractGitHubContent(): string {
  let contentChunks: string[] = [];
  
  // 1. Extract Issue/PR Title
  const titleEl = document.querySelector('.js-issue-title');
  if (titleEl) {
    contentChunks.push(`Title: ${titleEl.textContent?.trim()}`);
  }

  // 2. Extract Main Description (first comment body)
  const descriptionEl = document.querySelector('.comment-body');
  if (descriptionEl) {
    contentChunks.push(`Description: ${descriptionEl.textContent?.trim()}`);
  }

  // 3. Extract Diffs (if on a /files page)
  const diffTables = document.querySelectorAll('table.diff-table');
  if (diffTables.length > 0) {
    contentChunks.push(`Code Changes:`);
    // Limit to first 5 files to prevent overwhelming memory
    const tablesToParse = Array.from(diffTables).slice(0, 5);
    
    tablesToParse.forEach(table => {
      // Try to get filename from previous sibling header
      const header = table.parentElement?.previousElementSibling;
      const filename = header?.textContent?.trim().replace(/\s+/g, ' ') || 'Unknown File';
      contentChunks.push(`File: ${filename}`);
      
      const additions = table.querySelectorAll('.blob-code-addition');
      const deletions = table.querySelectorAll('.blob-code-deletion');
      
      if (additions.length > 0) {
        let addedText = Array.from(additions).map(el => el.textContent?.trim().replace(/^\+/, '')).join('\n');
        // Cap massive diffs
        if (addedText.length > 500) addedText = addedText.substring(0, 500) + '... (truncated)';
        contentChunks.push(`Additions:\n${addedText}`);
      }
      
      if (deletions.length > 0) {
        let deletedText = Array.from(deletions).map(el => el.textContent?.trim().replace(/^-/, '')).join('\n');
        if (deletedText.length > 500) deletedText = deletedText.substring(0, 500) + '... (truncated)';
        contentChunks.push(`Deletions:\n${deletedText}`);
      }
    });
  }

  return contentChunks.join('\n\n');
}

function captureGitHubContext() {
  const url = window.location.href;
  const title = document.title;
  const content = extractGitHubContent();
  
  if (content.length < 50) {
    console.log("[Kyro GitHub] Not enough semantic content found, skipping capture.");
    return;
  }

  // Final safety cap on entire payload
  const safeContent = content.length > 3000 ? content.substring(0, 3000) + '\n... (truncated for memory limits)' : content;

  const data = {
    url,
    title,
    text: `[GitHub Source] ${safeContent}`,
    domain: window.location.hostname,
    timestamp: new Date().toISOString(),
    type: "github_context"
  };

  chrome.runtime.sendMessage({
    type: "CAPTURE_CONTEXT",
    data
  });
  console.log(`[Kyro] Successfully captured specialized GitHub context (${safeContent.length} chars)`);
}

// Initial capture on page load with slight delay to allow GitHub's PJAX to render
setTimeout(() => {
  captureGitHubContext();
  
  // Phase 4.3: Context Collision Detection
  // Silently query the Kyro backend for similar context while the user reads
  const titleEl = document.querySelector('.js-issue-title');
  if (titleEl && titleEl.textContent) {
    const query = titleEl.textContent.trim();
    chrome.runtime.sendMessage({
      type: "RETRIEVE_CONTEXT",
      query: query
    }, (response) => {
      // For Hackathon MVP: Any returned memory triggers the collision detector
      if (response && response.status === "success" && response.memories && response.memories.length > 0) {
        injectCollisionNotification(query, response.memories.length);
      }
    });
  }
}, 2000);

function injectCollisionNotification(query: string, matchCount: number) {
  // Check if already injected
  if (document.getElementById('kyro-collision-alert')) return;

  const alert = document.createElement('div');
  alert.id = 'kyro-collision-alert';
  alert.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 24px;
    background: #09090b;
    border: 1px solid rgba(168, 85, 247, 0.4);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.2);
    border-radius: 12px;
    padding: 16px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: white;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 300px;
    animation: kyroSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  `;

  alert.innerHTML = `
    <style>
      @keyframes kyroSlideIn {
        from { transform: translateY(100px) scale(0.9); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }
      .kyro-dismiss:hover { background: rgba(255,255,255,0.1); }
    </style>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 8px; color: #a855f7; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
        <span>✨ Kyro Collision</span>
      </div>
      <button class="kyro-dismiss" style="background: transparent; border: none; color: #71717a; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
    <div style="font-size: 14px; color: #e4e4e7; line-height: 1.5;">
      Found <strong>${matchCount}</strong> related memories for <span style="color: #60a5fa;">"${query}"</span> in your Kyro Graph.
    </div>
  `;

  document.body.appendChild(alert);

  // Dismiss logic
  alert.querySelector('.kyro-dismiss')?.addEventListener('click', () => {
    alert.style.animation = 'none';
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(20px)';
    alert.style.transition = 'all 0.3s ease';
    setTimeout(() => alert.remove(), 300);
  });
}

// Listen for text selection via custom keybind
document.addEventListener('keydown', (e) => {
  chrome.storage.local.get(['kyro_capture_keybind'], (result: any) => {
    const hotkey = (result.kyro_capture_keybind as string) || 'Alt+C';
    
    const parts = hotkey.split('+').map((p: string) => p.trim().toLowerCase());
    const needsAlt = parts.includes('alt');
    const needsCtrl = parts.includes('ctrl');
    const needsShift = parts.includes('shift');
    const needsMeta = parts.includes('meta');
    const key = parts.find((p: string) => !['alt', 'ctrl', 'shift', 'meta'].includes(p));
    
    if (
      e.altKey === needsAlt &&
      e.ctrlKey === needsCtrl &&
      e.shiftKey === needsShift &&
      e.metaKey === needsMeta &&
      key && e.key.toLowerCase() === key
    ) {
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
