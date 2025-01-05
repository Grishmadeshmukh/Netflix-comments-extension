console.log("Netflix extension content script loaded!");
console.log("[MyNetflixExtension] Netflix extension content script loaded!");


const testBanner = document.createElement("div");
testBanner.style.position = "fixed";
testBanner.style.top = "10px";
testBanner.style.left = "10px";
testBanner.style.padding = "10px";
testBanner.style.backgroundColor = "red";
testBanner.style.color = "white";
testBanner.textContent = "Netflix Extension Active!";
document.body.appendChild(testBanner);

// Create comments container
function createCommentsUI() {
    const commentsContainer = document.createElement('div');
    commentsContainer.id = 'netflix-comments-container';
    commentsContainer.style.position = 'fixed';
    commentsContainer.style.right = '20px';
    commentsContainer.style.top = '100px';
    commentsContainer.style.width = '250px';
    commentsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    commentsContainer.style.color = 'white';
    commentsContainer.style.padding = '10px';
    commentsContainer.style.borderRadius = '5px';
    commentsContainer.style.zIndex = '9999';
    
    // Add title
    const title = document.createElement('div');
    title.textContent = 'Timestamps & Comments';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '10px';
    commentsContainer.appendChild(title);
    
    // Add button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Comment at Current Time';
    addButton.style.backgroundColor = '#e50914';
    addButton.style.color = 'white';
    addButton.style.border = 'none';
    addButton.style.padding = '8px 15px';
    addButton.style.borderRadius = '3px';
    addButton.style.cursor = 'pointer';
    addButton.style.marginBottom = '10px';
    addButton.style.width = '100%';
    commentsContainer.appendChild(addButton);
    
    // Add comments list container
    const commentsList = document.createElement('div');
    commentsList.id = 'netflix-comments-list';
    commentsContainer.appendChild(commentsList);
    
    // Add button click handler
    addButton.addEventListener('click', () => {
        const videoPlayer = document.querySelector('video');
        if (!videoPlayer) {
            alert('No video playing. Please play a video first.');
            return;
        }
        
        const currentTime = Math.floor(videoPlayer.currentTime);
        
        const commentForm = document.createElement('div');
        commentForm.style.marginTop = '10px';
        
        const commentInput = document.createElement('textarea');
        commentInput.style.width = '100%';
        commentInput.style.marginBottom = '5px';
        commentInput.style.padding = '5px';
        commentInput.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
        commentInput.style.color = 'white';
        commentInput.style.border = '1px solid #666';
        commentInput.rows = 3;

        // Add this event listener to prevent Netflix shortcuts while typing
        commentInput.addEventListener('keydown', (event) => {
            event.stopPropagation();
        });
                
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.style.backgroundColor = '#e50914';
        saveButton.style.color = 'white';
        saveButton.style.border = 'none';
        saveButton.style.padding = '5px 10px';
        saveButton.style.borderRadius = '3px';
        saveButton.style.marginRight = '5px';
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.backgroundColor = '#333';
        cancelButton.style.color = 'white';
        cancelButton.style.border = 'none';
        cancelButton.style.padding = '5px 10px';
        cancelButton.style.borderRadius = '3px';
        
        commentForm.appendChild(commentInput);
        commentForm.appendChild(saveButton);
        commentForm.appendChild(cancelButton);
        
        // Insert at the top of the comments list
        const commentsList = document.getElementById('netflix-comments-list');
        if (commentsList) {
            commentsList.insertBefore(commentForm, commentsList.firstChild);
        }
        
        // Save button handler
        saveButton.addEventListener('click', () => {
            const commentText = commentInput.value.trim();
            if (commentText) {
                addComment(currentTime, commentText);
                commentInput.value = ''; // Clear input
                commentForm.remove();
            }
        });
        
        // Cancel button handler
        cancelButton.addEventListener('click', () => {
            commentForm.remove();
        });
        
        commentInput.focus();
    });
    
    document.body.appendChild(commentsContainer);
    loadComments(); // Load saved comments after UI is created
    
    return { commentsContainer, addButton, commentsList };
}


function getNetflixId() {
    const match = window.location.pathname.match(/watch\/(\d+)/);
    return match ? match[1] : null;
}

// Function to format time (converts seconds to MM:SS format)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Function to add a comment
function addComment(timestamp, text) {
    // Create comment element
    const commentElement = document.createElement('div');
    commentElement.style.marginBottom = '10px';
    commentElement.style.padding = '5px';
    commentElement.style.backgroundColor = 'rgba(50, 50, 50, 0.5)';
    commentElement.style.borderRadius = '3px';
    
    const timeLink = document.createElement('a');
    timeLink.textContent = formatTime(timestamp);
    timeLink.style.color = '#e50914';
    timeLink.style.cursor = 'pointer';
    timeLink.style.textDecoration = 'underline';
    
    const commentText = document.createElement('div');
    commentText.textContent = text;
    commentText.style.marginTop = '3px';
    
    commentElement.appendChild(timeLink);
    commentElement.appendChild(commentText);
    
    // Add click handler to jump to timestamp
    timeLink.addEventListener('click', () => {
        const videoPlayer = document.querySelector('video');
        if (videoPlayer) {
            videoPlayer.currentTime = timestamp;
            // Force play if paused
            if (videoPlayer.paused) {
                videoPlayer.play().catch(err => {
                    console.log('Could not play video:', err);
                    alert('Please start the video first');
                });
            }
        } else {
            alert('Please start playing the video first');
        }
    });
    
    // Add to comments list
    const commentsList = document.getElementById('netflix-comments-list');
    if (commentsList) {
        commentsList.appendChild(commentElement);
        saveComments();
    }
    
    // Save to storage (you can add this later)
    saveComments();
}


function saveComments() {
    const commentsList = document.getElementById('netflix-comments-list');
    if (!commentsList) return;

    const netflixId = getNetflixId();
    if (!netflixId) return;

    const comments = Array.from(commentsList.children)
        .filter(comment => comment.querySelector('a'))
        .map(comment => ({
            timestamp: parseInt(comment.querySelector('a').textContent.split(':').reduce((acc, time) => (60 * acc) + parseInt(time), 0)),
            text: comment.querySelector('div').textContent
        }));
    
    // Save comments with Netflix ID as key
    chrome.storage.local.get(['all_netflix_comments'], (result) => {
        const allComments = result.all_netflix_comments || {};
        allComments[netflixId] = comments;
        chrome.storage.local.set({ 'all_netflix_comments': allComments }, () => {
            console.log('Comments saved for Netflix ID:', netflixId);
        });
    });
}

function loadComments() {
    const netflixId = getNetflixId();
    if (!netflixId) return;

    chrome.storage.local.get(['all_netflix_comments'], (result) => {
        const allComments = result.all_netflix_comments || {};
        const comments = allComments[netflixId] || [];
        
        // Clear existing comments first
        const commentsList = document.getElementById('netflix-comments-list');
        if (commentsList) {
            commentsList.innerHTML = '';
            comments.forEach(comment => {
                addComment(comment.timestamp, comment.text);
            });
        }
    });
}


// Add video detection code
function detectNetflixPlayer() {
    // Find the video player
    const videoPlayer = document.querySelector('video');
    
    if (videoPlayer) {
        console.log("[Netflix Extension] Video player found!");
        
        // Get video title
        const titleElement = document.querySelector('.video-title h4');
        if (titleElement) {
            console.log("[Netflix Extension] Currently playing:", titleElement.textContent);
        }

        // Listen for play/pause
        videoPlayer.addEventListener('play', () => {
            console.log("[Netflix Extension] Video started playing");
            updateBanner("Playing: " + (titleElement ? titleElement.textContent : "Unknown"));
        });

        videoPlayer.addEventListener('pause', () => {
            console.log("[Netflix Extension] Video paused");
            updateBanner("Paused");
        });

        videoPlayer.addEventListener('loadeddata', () => {
            updateBanner(videoPlayer.paused ? "Paused" : "Playing");
        });
    }
}

// Add this to your content.js
function detectSkipButton() {
    const skipButton = document.querySelector('button[data-uia="player-skip-intro"]');
    if (skipButton) {
        console.log("[Netflix Extension] Skip intro button found!");
        // skipButton.click(); 
    }
}

// Add this to your interval check
const skipCheckInterval = setInterval(() => {
    detectSkipButton();
}, 1000);


// Helper function to update banner text
function updateBanner(text) {
    testBanner.textContent = text;
}

// Check periodically for video player (Netflix loads it dynamically)
const checkInterval = setInterval(() => {
    if (document.querySelector('video')) {
        detectNetflixPlayer();
        clearInterval(checkInterval);
    }
}, 1000);


// Add URL change detection to reload comments when switching shows
function detectNetflixNavigation() {
    let lastUrl = window.location.href;
    
    // Create an observer instance
    const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            console.log('Netflix navigation detected, reloading comments');
            loadComments();
        }
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function initExtension() {
    createCommentsUI();
    detectNetflixNavigation();

}

// Start the extension when the page is ready
if (document.readyState === 'complete') {
    initExtension();
} else {
    window.addEventListener('load', initExtension);
}

