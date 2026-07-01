// Kyro: Lightweight ChatGPT Interceptor
// Adapted from mem0 reference selectors

function getPromptTextArea(): HTMLTextAreaElement | HTMLDivElement | null {
  return (
    (document.querySelector('#prompt-textarea') as HTMLTextAreaElement | HTMLDivElement) ||
    (document.querySelector('div[contenteditable="true"]') as HTMLDivElement) ||
    (document.querySelector('textarea') as HTMLTextAreaElement)
  );
}

function getSendButton(): HTMLButtonElement | null {
  return document.querySelector('#composer-submit-button') || document.querySelector('[data-testid="send-button"]');
}

function sendToKyro(text: string) {
  if (!text || text.trim().length < 5) return;

  const data = {
    url: window.location.href,
    title: `ChatGPT Prompt`,
    text: `User Prompt: ${text.trim()}`,
    domain: 'chatgpt.com',
    timestamp: new Date().toISOString(),
    type: "chat_prompt"
  };

  chrome.runtime.sendMessage({
    type: "CAPTURE_CONTEXT",
    data
  });
  console.log("[Kyro] Intercepted ChatGPT prompt and sent to memory pipeline.");
}

function interceptChatGPT() {
  console.log("[Kyro] Initializing ChatGPT Interceptor...");

  // Intercept via Enter key on textarea
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const activeEl = document.activeElement;
      const textArea = getPromptTextArea();
      if (activeEl === textArea || textArea?.contains(activeEl)) {
        // Send a slight delay to ensure we grab the final text before it clears
        let text = "";
        if (textArea instanceof HTMLTextAreaElement) {
          text = textArea.value;
        } else if (textArea) {
          text = textArea.innerText;
        }
        sendToKyro(text);
      }
    }
  }, true);

  // Intercept via Click on Send button
  document.addEventListener('click', (e) => {
    const sendBtn = getSendButton();
    const target = e.target as HTMLElement;
    if (sendBtn && (target === sendBtn || sendBtn.contains(target))) {
      const textArea = getPromptTextArea();
      let text = "";
      if (textArea instanceof HTMLTextAreaElement) {
        text = textArea.value;
      } else if (textArea) {
        text = textArea.innerText;
      }
      sendToKyro(text);
    }
  }, true);
}

// Start interceptor
interceptChatGPT();

import { setupOverlay } from './overlay';

setupOverlay(getPromptTextArea);
