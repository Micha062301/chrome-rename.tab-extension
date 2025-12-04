document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const nameInput = document.getElementById('nameInput');
  
  // 1. Load existing name from storage if it exists
  chrome.storage.local.get([String(tab.id)], (result) => {
    if (result[tab.id]) {
      nameInput.value = result[tab.id];
    }
  });

  // 2. Handle Rename Click
  document.getElementById('renameBtn').addEventListener('click', () => {
    const newName = nameInput.value;
    if (!newName) return;

    // Save to storage (so it persists on reload)
    chrome.storage.local.set({ [tab.id]: newName });

    // Send message to content script to update DOM immediately
    chrome.tabs.sendMessage(tab.id, { action: "rename", title: newName });
    window.close();
  });

  // 3. Handle Reset Click
  document.getElementById('resetBtn').addEventListener('click', () => {
    // Remove from storage
    chrome.storage.local.remove(String(tab.id));
    
    // Tell content script to stop forcing the name
    chrome.tabs.sendMessage(tab.id, { action: "reset" });
    window.close();
  });
});
