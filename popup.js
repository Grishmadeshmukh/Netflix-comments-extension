document.addEventListener('DOMContentLoaded', function() {
    // Get toggle elements
    const bannerToggle = document.getElementById('bannerToggle');
    const autoSkipToggle = document.getElementById('autoSkipToggle');

    // Load saved settings
    chrome.storage.sync.get(['showBanner', 'autoSkip'], function(result) {
        bannerToggle.checked = result.showBanner ?? false;
        autoSkipToggle.checked = result.autoSkip ?? false;
    });

    // Save settings when changed
    bannerToggle.addEventListener('change', function() {
        chrome.storage.sync.set({ showBanner: this.checked });
        
        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleBanner',
                show: bannerToggle.checked
            });
        });
    });

    autoSkipToggle.addEventListener('change', function() {
        chrome.storage.sync.set({ autoSkip: this.checked });
        
        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleAutoSkip',
                enabled: autoSkipToggle.checked
            });
        });
    });
});