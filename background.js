// Listen for request from content script to get its own Tab ID
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getTabId") {
        sendResponse({ tabId: sender.tab.id });
    }
});

// Clean up storage when a tab is closed so it doesn't fill up
chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.storage.local.remove(String(tabId));
});
