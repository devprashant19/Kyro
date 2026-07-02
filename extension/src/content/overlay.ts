// Kyro Retrieval UI Overlay Module

let lookupTimeout: number | null = null;
let overlayContainer: HTMLElement | null = null;

export function createOverlay() {
  if (overlayContainer) return overlayContainer;

  overlayContainer = document.createElement('div');
  overlayContainer.id = 'kyro-memory-overlay';
  overlayContainer.style.cssText = `
    position: fixed;
    width: 100%;
    max-height: 250px;
    overflow-y: auto;
    background: #1e1e2e;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    margin-bottom: 8px;
    z-index: 10000;
    display: none;
    flex-direction: column;
    box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 600;
    color: #a855f7;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `;
  header.innerText = "✨ Kyro Context Retrieved";

  const contentList = document.createElement('div');
  contentList.id = 'kyro-memory-list';
  contentList.style.cssText = `
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  `;

  overlayContainer.appendChild(header);
  overlayContainer.appendChild(contentList);

  return overlayContainer;
}

export function showMemories(memories: any[], textArea: HTMLElement) {
  const container = createOverlay();
  const list = container.querySelector('#kyro-memory-list') as HTMLElement;
  list.innerHTML = ''; // clear old

  if (memories.length === 0) {
    container.style.display = 'none';
    return;
  }

  memories.forEach(mem => {
    let memoryText = "";
    let memoryId = "";
    
    if (typeof mem === 'string') {
      memoryText = mem;
      memoryId = mem;
    } else if (mem && typeof mem === 'object') {
      memoryText = mem.text || JSON.stringify(mem);
      memoryId = mem.id || memoryText;
    }

    const item = document.createElement('div');
    item.style.cssText = `
      padding: 10px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 13px;
      line-height: 1.4;
      cursor: pointer;
      transition: all 0.2s;
    `;
        // Container for the memory text and buttons
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    `;
    
    const textNode = document.createElement('div');
    textNode.style.flex = "1";
    textNode.innerText = memoryText;
    
    // Thumbs up / down container
    const actions = document.createElement('div');
    actions.style.cssText = `
      display: flex;
      gap: 4px;
      flex-direction: column;
    `;
    
    const upBtn = document.createElement('button');
    upBtn.innerText = "👍";
    upBtn.style.cssText = "background: none; border: none; cursor: pointer; filter: grayscale(100%); transition: all 0.2s; font-size: 14px;";
    
    const downBtn = document.createElement('button');
    downBtn.innerText = "👎";
    downBtn.style.cssText = "background: none; border: none; cursor: pointer; filter: grayscale(100%); transition: all 0.2s; font-size: 14px;";
    
    // Feedback handlers
    const sendFeedback = (rating: number, btn: HTMLButtonElement) => {
      chrome.runtime.sendMessage({ type: "SEND_FEEDBACK", memory_id: memoryId, rating });
      btn.style.filter = "grayscale(0%)";
      btn.style.transform = "scale(1.2)";
      setTimeout(() => btn.style.transform = "scale(1)", 200);
    };
    
    upBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent injecting text
      sendFeedback(1, upBtn);
      downBtn.style.filter = "grayscale(100%)";
    });
    
    downBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sendFeedback(-1, downBtn);
      upBtn.style.filter = "grayscale(100%)";
    });
    
    actions.appendChild(upBtn);
    actions.appendChild(downBtn);
    
    contentWrapper.appendChild(textNode);
    contentWrapper.appendChild(actions);
    
    item.appendChild(contentWrapper);


    // Hover effects
    item.addEventListener('mouseenter', () => {
      item.style.background = 'rgba(168,85,247,0.1)';
      item.style.borderColor = 'rgba(168,85,247,0.3)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.background = 'rgba(255,255,255,0.03)';
      item.style.borderColor = 'rgba(255,255,255,0.05)';
    });

    // Manual Injection Click Handler
    item.addEventListener('click', () => {
      const injectionText = '\\n\\n[Kyro Context: ' + memoryText + ']\\n';
      if (textArea instanceof HTMLTextAreaElement) {
        textArea.value = textArea.value + injectionText;
        textArea.dispatchEvent(new Event('input', { bubbles: true })); // trigger react
      } else {
        textArea.innerText = textArea.innerText + injectionText;
        textArea.dispatchEvent(new Event('input', { bubbles: true }));
      }
      container.style.display = 'none';
    });

    list.appendChild(item);
  });

  // Mount overlay to body to avoid overflow issues
  document.body.appendChild(container);
  
  // Position it above the textarea
  const rect = textArea.getBoundingClientRect();
  container.style.bottom = `${window.innerHeight - rect.top + 10}px`;
  container.style.left = `${rect.left}px`;
  container.style.width = `${rect.width}px`;
  container.style.display = 'flex';
}

export function setupOverlay(getTextAreaFn: () => HTMLElement | null) {
  document.addEventListener('input', (e) => {
    console.log("[Kyro] Input event fired!", e.target);
    const target = e.target as HTMLElement;
    const textArea = getTextAreaFn();

    if (textArea && (target === textArea || textArea.contains(target))) {
      let text = "";
      if (textArea instanceof HTMLTextAreaElement) text = textArea.value;
      else text = textArea.innerText;

      if (lookupTimeout) clearTimeout(lookupTimeout);

      if (text.trim().length > 2) { // Only lookup if they typed a decent amount
        lookupTimeout = window.setTimeout(() => {
          chrome.runtime.sendMessage(
            { type: "RETRIEVE_CONTEXT", query: text },
            (response) => {
              if (response && response.status === "success" && response.memories) {
                showMemories(response.memories, textArea);
              }
            }
          );
        }, 800); // 800ms debounce
      } else {
        if (overlayContainer) overlayContainer.style.display = 'none';
      }
    }
  }, true);
}
