let titleObserver = null;
let originalTitle = document.title;
let isRenaming = false;

// 1. Function to force the title change
function setTabTitle(newTitle) {
  if (document.title !== newTitle) {
    isRenaming = true; // Flag to prevent infinite loop
    document.title = newTitle;
    isRenaming = false;
  }
}

// 2. Function to observe changes (Lock the title)
function lockTitle(desiredTitle) {
  // If we already have an observer, disconnect it first
  if (titleObserver) titleObserver.disconnect();

  setTabTitle(desiredTitle);

  const target = document.querySelector('title');
  
  titleObserver = new MutationObserver(() => {
    if (!isRenaming && document.title !== desiredTitle) {
      setTabTitle(desiredTitle);
    }
  });

  if (target) {
    titleObserver.observe(target, { childList: true, characterData: true, subtree: true });
  }
}

// 3. Listen for messages from Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "rename") {
    lockTitle(request.title);
  } else if (request.action === "reset") {
    if (titleObserver) titleObserver.disconnect();
    // Try to restore original title if we have it, or just let the page take over
    location.reload(); // Reload is the cleanest way to reset state
  }
});

// 4. On Page Load: Check if we have a saved name for this tab
// We need to ask the background/storage if there is a name for this specific Tab ID.
// However, since content scripts don't know their Tab ID easily, we rely on the 
// fact that 'storage' is shared. But storage is keyed by Tab ID.
// To fix this simple disconnect, we usually use message passing on load.
// But for this simple version, we will wait for user interaction OR
// if you want it to persist on Reload, we need a trick. 

// TRICK: Ask background for the current tab ID? 
// Actually, simpler approach for V3:
// We just listen. If the user refreshes, the Tab ID stays the same.
chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
    const tabId = response?.tabId;
    if(tabId) {
        chrome.storage.local.get([String(tabId)], (result) => {
            if (result[tabId]) {
                lockTitle(result[tabId]);
            }
        });
    }
});
