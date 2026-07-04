// Kyro Retrieval UI Overlay Module

let lookupTimeout: number | null = null;
let overlayContainer: HTMLElement | null = null;
let selectedIndex: number = -1; // NEW for keyboard nav

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
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  const contentList = document.createElement('div');
  contentList.id = 'kyro-memory-list';
  contentList.style.cssText = `
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  `;

  overlayContainer.appendChild(contentList);

  return overlayContainer;
}

export function showMemories(memories: any[], textArea: HTMLElement) {
  const container = createOverlay();
  const list = container.querySelector('#kyro-memory-list') as HTMLElement;
  list.innerHTML = ''; // clear old
  selectedIndex = -1; // reset selection

  if (memories.length === 0) {
    container.style.opacity = '0';
    setTimeout(() => container.style.display = 'none', 300);
    return;
  }

  memories.forEach((mem, index) => {
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
    item.className = 'kyro-memory-item';
    item.dataset.index = index.toString();
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
      if (selectedIndex !== index) {
        item.style.background = 'rgba(168,85,247,0.1)';
        item.style.borderColor = 'rgba(168,85,247,0.3)';
      }
    });
    item.addEventListener('mouseleave', () => {
      if (selectedIndex !== index) {
        item.style.background = 'rgba(255,255,255,0.03)';
        item.style.borderColor = 'rgba(255,255,255,0.05)';
      }
    });

    // Manual Injection Click Handler
    item.addEventListener('click', () => {
      injectContext(memoryText, textArea);
    });

    list.appendChild(item);
  });

  // Mount overlay to body to avoid overflow issues
  if (!document.body.contains(container)) {
    document.body.appendChild(container);
  }
  
  // Position it above the textarea
  const rect = textArea.getBoundingClientRect();
  container.style.bottom = `${window.innerHeight - rect.top + 10}px`;
  container.style.left = `${rect.left}px`;
  container.style.width = `${rect.width}px`;
  container.style.display = 'flex';
  
  // Trigger fade in
  requestAnimationFrame(() => {
    container.style.opacity = '1';
  });
}

function injectContext(memoryText: string, textArea: HTMLElement) {
  if (textArea instanceof HTMLTextAreaElement) {
    textArea.value = memoryText;
    textArea.dispatchEvent(new Event('input', { bubbles: true })); // trigger react
  } else {
    textArea.innerText = memoryText;
    textArea.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  if (overlayContainer) {
    overlayContainer.style.opacity = '0';
    setTimeout(() => overlayContainer!.style.display = 'none', 300);
  }
}

export function setupOverlay(getTextAreaFn: () => HTMLElement | null) {
  // Input event for fetching
  document.addEventListener('input', (e) => {
    const target = e.target as HTMLElement;
    const textArea = getTextAreaFn();

    if (textArea && (target === textArea || textArea.contains(target))) {
      let text = "";
      if (textArea instanceof HTMLTextAreaElement) text = textArea.value;
      else text = textArea.innerText;

      if (lookupTimeout) clearTimeout(lookupTimeout);

      if (text.trim().length > 10) { // Increased threshold to > 10 chars
        lookupTimeout = window.setTimeout(() => {
          chrome.runtime.sendMessage(
            { type: "RETRIEVE_CONTEXT", query: text },
            (response) => {
              let currentText = "";
              if (textArea instanceof HTMLTextAreaElement) currentText = textArea.value;
              else currentText = textArea.innerText;
              
              if (currentText.trim().length > 10) {
                if (response && response.status === "success" && response.memories) {
                  showMemories(response.memories, textArea);
                }
              }
            }
          );
        }, 1200); // 1200ms debounce
      } else {
        if (overlayContainer) {
          overlayContainer.style.opacity = '0';
          setTimeout(() => { if (overlayContainer) overlayContainer.style.display = 'none'; }, 300);
        }
      }
    }
  }, true);

  // Keydown event for keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!overlayContainer || overlayContainer.style.display === 'none') return;
    
    const textArea = getTextAreaFn();
    const activeEl = document.activeElement;
    if (!textArea || (activeEl !== textArea && !textArea.contains(activeEl))) return;

    const items = Array.from(overlayContainer.querySelectorAll('.kyro-memory-item')) as HTMLElement[];
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      updateSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateSelection(items);
    } else if (e.key === 'Tab') { // Use Tab to inject (Enter is used to send message in ChatGPT)
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        const textNode = items[selectedIndex].querySelector('div > div') as HTMLElement;
        if (textNode) injectContext(textNode.innerText, textArea);
      } else if (items.length > 0) {
        // Inject first item if none selected
        const textNode = items[0].querySelector('div > div') as HTMLElement;
        if (textNode) injectContext(textNode.innerText, textArea);
      }
    } else if (e.key === 'Escape') {
      overlayContainer.style.opacity = '0';
      setTimeout(() => { if (overlayContainer) overlayContainer.style.display = 'none'; }, 300);
    }
  }, true);
}

function updateSelection(items: HTMLElement[]) {
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.style.background = 'rgba(168,85,247,0.2)';
      item.style.borderColor = 'rgba(168,85,247,0.5)';
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.style.background = 'rgba(255,255,255,0.03)';
      item.style.borderColor = 'rgba(255,255,255,0.05)';
    }
  });
}
