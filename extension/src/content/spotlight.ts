// Kyro Spotlight — In-Browser Memory Search Overlay
// Triggered by Ctrl+Shift+Space (registered as "kyro-spotlight" command)

let spotlightEl: HTMLDivElement | null = null;
let debounceTimer: number | null = null;
let isVisible = false;

function buildSpotlight(): HTMLDivElement {
  const backdrop = document.createElement('div');
  backdrop.id = 'kyro-spotlight-root';
  backdrop.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.72);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 2147483646;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 14vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    opacity: 0;
    transition: opacity 0.2s ease;
  `;

  const card = document.createElement('div');
  card.style.cssText = `
    width: 640px;
    max-width: calc(100vw - 32px);
    background: #0d0d14;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 18px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(139,92,246,0.15);
    overflow: hidden;
    transform: translateY(-8px) scale(0.98);
    transition: transform 0.2s ease;
  `;

  // Header / Input row
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  `;

  const icon = document.createElement('span');
  icon.style.cssText = 'font-size: 18px; flex-shrink: 0;';
  icon.textContent = '🔮';

  const input = document.createElement('input');
  input.id = 'kyro-spotlight-input';
  input.placeholder = 'Ask Kyro anything about your memory…';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.style.cssText = `
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #f1f5f9;
    font-size: 16px;
    line-height: 1;
    caret-color: #a78bfa;
    min-width: 0;
  `;

  const kbdEsc = document.createElement('kbd');
  kbdEsc.textContent = 'Esc';
  kbdEsc.style.cssText = `
    background: rgba(255,255,255,0.07);
    color: #6b7280;
    border: 1px solid rgba(255,255,255,0.1);
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-family: inherit;
    flex-shrink: 0;
  `;

  header.appendChild(icon);
  header.appendChild(input);
  header.appendChild(kbdEsc);

  // Results area
  const results = document.createElement('div');
  results.id = 'kyro-spotlight-results';
  results.style.cssText = `
    min-height: 72px;
    max-height: 320px;
    overflow-y: auto;
    padding: 8px;
  `;
  results.innerHTML = '<p style="color:#4b5563; font-size:13px; padding:16px 12px; text-align:center; margin:0;">Start typing to search your memory graph…</p>';

  // Footer hint
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 8px 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    gap: 16px;
  `;
  footer.innerHTML = `
    <span style="font-size:11px; color:#374151;">
      <kbd style="background:rgba(255,255,255,0.07);padding:1px 6px;border-radius:4px;color:#9ca3af;font-family:inherit;">Esc</kbd>
      close
    </span>
    <span style="margin-left:auto; font-size:11px; color:#4b5563;">Powered by <span style="color:#a78bfa;">Kyro Brain</span></span>
  `;

  card.appendChild(header);
  card.appendChild(results);
  card.appendChild(footer);
  backdrop.appendChild(card);

  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) hideSpotlight();
  });

  // Search on input with debounce
  input.addEventListener('input', () => {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    const query = input.value.trim();
    if (query.length < 2) {
      results.innerHTML = '<p style="color:#4b5563; font-size:13px; padding:16px 12px; text-align:center; margin:0;">Start typing to search your memory graph…</p>';
      return;
    }
    results.innerHTML = '<p style="color:#6b7280; font-size:13px; padding:16px 12px; text-align:center; margin:0;">Searching…</p>';
    debounceTimer = window.setTimeout(() => queryMemories(query, results), 450);
  });

  return backdrop as HTMLDivElement;
}

function queryMemories(query: string, resultsEl: HTMLElement) {
  chrome.runtime.sendMessage({ type: 'RETRIEVE_CONTEXT', query }, (response) => {
    const memories: any[] = response?.memories || [];

    if (!memories.length) {
      resultsEl.innerHTML = `<p style="color:#6b7280; font-size:13px; padding:20px 12px; text-align:center; margin:0;">No memories found for "<strong style="color:#9ca3af;">${query}</strong>"</p>`;
      return;
    }

    resultsEl.innerHTML = '';
    memories.forEach((mem: any) => {
      const text = typeof mem === 'string' ? mem : (mem.text || JSON.stringify(mem));
      const trimmed = text.length > 220 ? text.slice(0, 220) + '…' : text;

      const item = document.createElement('div');
      item.style.cssText = `
        padding: 12px 16px;
        border-radius: 10px;
        margin: 3px 0;
        cursor: default;
        border: 1px solid transparent;
        transition: background 0.12s, border-color 0.12s;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      `;

      const dot = document.createElement('span');
      dot.style.cssText = 'width: 6px; height: 6px; border-radius: 50%; background: #7c3aed; flex-shrink: 0; margin-top: 6px;';

      const textNode = document.createElement('span');
      textNode.style.cssText = 'color: #d1d5db; font-size: 13px; line-height: 1.55;';
      textNode.textContent = trimmed;

      item.appendChild(dot);
      item.appendChild(textNode);

      item.addEventListener('mouseenter', () => {
        item.style.background = 'rgba(139,92,246,0.08)';
        item.style.borderColor = 'rgba(139,92,246,0.25)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = '';
        item.style.borderColor = 'transparent';
      });

      resultsEl.appendChild(item);
    });
  });
}

export function showSpotlight() {
  if (!spotlightEl || !document.body.contains(spotlightEl)) {
    spotlightEl = buildSpotlight();
    document.body.appendChild(spotlightEl);
  }
  spotlightEl.style.display = 'flex';
  requestAnimationFrame(() => {
    if (!spotlightEl) return;
    spotlightEl.style.opacity = '1';
    const card = spotlightEl.querySelector('div') as HTMLElement | null;
    if (card) card.style.transform = 'translateY(0) scale(1)';
  });
  const input = spotlightEl.querySelector('#kyro-spotlight-input') as HTMLInputElement | null;
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 80);
  }
  const results = spotlightEl.querySelector('#kyro-spotlight-results') as HTMLElement | null;
  if (results) {
    results.innerHTML = '<p style="color:#4b5563; font-size:13px; padding:16px 12px; text-align:center; margin:0;">Start typing to search your memory graph…</p>';
  }
  isVisible = true;
}

export function hideSpotlight() {
  if (!spotlightEl) return;
  spotlightEl.style.opacity = '0';
  const card = spotlightEl.querySelector('div') as HTMLElement | null;
  if (card) card.style.transform = 'translateY(-8px) scale(0.98)';
  setTimeout(() => { if (spotlightEl) spotlightEl.style.display = 'none'; }, 200);
  isVisible = false;
}

export function toggleSpotlight() {
  if (isVisible) hideSpotlight();
  else showSpotlight();
}

// Persistent Esc listener
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isVisible) {
    e.preventDefault();
    hideSpotlight();
  }
}, true);
