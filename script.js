// DOM Elements
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const themeToggle = document.getElementById('theme-toggle');
const typingIndicator = document.getElementById('typing-indicator');
const emptyState = document.getElementById('empty-state');
const clearChatButton = document.getElementById('clear-chat');
const suggestionChips = document.querySelectorAll('.suggestion-chip');

// ZumyNext configuration
const perintah = "Kamu adalah assisten AI yang diberi nama ZumyNext, pembuatmu adalah Angga a.k.a iZumy, umurnya 19 tahun, dia lulusan teknik komputer dan jaringan, dia memiliki kepribadian baik, perhatian, lucu, bertanggung jawab, dan ganteng, dia sedang mengembangkan projek bot WhatsApp, dia berasal dari Yogyakarta, webnya adalah zumynext.tech";

// Track conversation state
let conversationStarted = false;

// Initialize chat
function initChat() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('zumyTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        updateThemeIcon(true);
    }
    
    // Focus the input field
    messageInput.focus();
    
    // Set up suggestion chips
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            messageInput.value = chip.textContent;
            sendMessage();
        });
    });
}

// Helper function to format messages with markdown-like syntax
function formatMessage(text) {
    // Handle code blocks with syntax highlighting
    text = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    
    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle bold text
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Handle links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Handle line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

// Function to append a message to the chat
function appendMessage(sender, message, isImage = false) {
    // Hide empty state if visible
    if (emptyState && emptyState.style.display !== 'none') {
        emptyState.style.display = 'none';
        conversationStarted = true;
    }
    
    const messageWrapper = document.createElement('div');
    messageWrapper.className = `message-wrapper ${sender}`;
    
    const messageInner = document.createElement('div');
    messageInner.className = 'message-inner';
    
    const avatar = document.createElement('div');
    avatar.className = `avatar ${sender}`;
    
    if (sender === 'ai') {
        avatar.textContent = 'Z';
    } else {
        avatar.textContent = 'U';
    }
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (isImage) {
        messageContent.innerHTML = `<img src="${message}" alt="Image" style="max-width: 100%; border-radius: 8px;">`;
    } else {
        messageContent.innerHTML = formatMessage(message);
    }
    
    messageInner.appendChild(avatar);
    messageInner.appendChild(messageContent);
    messageWrapper.appendChild(messageInner);
    chatBox.appendChild(messageWrapper);
    
    // Apply entry animation
    messageWrapper.style.animation = 'slideUp 0.3s ease forwards';
    
    // Auto-scroll to the latest message with smooth animation
    setTimeout(() => {
        chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
}

// Function to send a text message
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    messageInput.value = '';
    
    // Disable the send button while processing
    sendButton.disabled = true;
    sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    // Show typing indicator
    typingIndicator.style.display = "block";

    try {
        const response = await fetch('https://luminai.my.id/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: text, user: 'user', prompt: perintah })
        });

        const result = await response.json();
        
        // Simulate a slight delay for more natural feeling
        setTimeout(() => {
            appendMessage('ai', result.result);
        }, 500);
    } catch (error) {
        appendMessage('ai', "Maaf, terjadi kesalahan saat menghubungi server. Silakan coba lagi setelah beberapa saat.");
    } finally {
        typingIndicator.style.display = "none"; // Hide typing indicator after response
        sendButton.disabled = false; // Re-enable the send button
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        
        // Focus the input field after sending
        messageInput.focus();
    }
}

// Clear chat conversation
function clearChat() {
    // Confirm before clearing
    if (conversationStarted && confirm('Are you sure you want to clear this conversation?')) {
        while (chatBox.firstChild) {
            chatBox.removeChild(chatBox.firstChild);
        }
        
        // Show empty state again
        emptyState.style.display = 'flex';
        conversationStarted = false;
    }
}

// Update theme toggle icon
function updateThemeIcon(isDark) {
    const icon = themeToggle.querySelector('i');
    if (isDark) {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Toggle dark mode
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark');
    updateThemeIcon(isDarkMode);
    
    // Save preference
    localStorage.setItem('zumyTheme', isDarkMode ? 'dark' : 'light');
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
themeToggle.addEventListener('click', toggleTheme);
clearChatButton.addEventListener('click', clearChat);

// Initialize when everything is loaded
window.addEventListener('load', initChat);
