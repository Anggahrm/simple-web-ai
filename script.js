const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const themeToggle = document.getElementById('theme-toggle');
const typingIndicator = document.getElementById('typing-indicator');

const perintah = "Kamu adalah assisten AI yang diberi nama ZumyNext, pembuatmu adalah Angga a.k.a iZumy, umurnya 19 tahun, dia lulusan teknik komputer dan jaringan, dia memiliki kepribadian baik, perhatian, lucu, bertanggung jawab, dan ganteng, dia sedang mengembangkan projek bot WhatsApp, dia berasal dari Yogyakarta, webnya adalah zumynext.tech";

// Function to display a system welcome message
function displayWelcomeMessage() {
    const welcomeMessage = "Hi, I'm ZumyNext AI! How can I help you today?";
    appendMessage('ai', welcomeMessage);
}

// Function to append a message to the chat
function appendMessage(sender, message, isImage = false) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = `message-wrapper ${sender}`;
    
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
        messageContent.innerHTML = `<img src="${message}" alt="Image" style="max-width: 100%; border-radius: 5px;">`;
    } else {
        // Convert line breaks to <br> tags and handle markdown-style code blocks
        const formattedMessage = message
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/\n/g, '<br>');
        messageContent.innerHTML = formattedMessage;
    }
    
    messageWrapper.appendChild(avatar);
    messageWrapper.appendChild(messageContent);
    chatBox.appendChild(messageWrapper);
    
    // Auto-scroll to the latest message
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to send a text message
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    messageInput.value = '';
    
    // Disable the send button while processing
    sendButton.disabled = true;

    // Show typing indicator
    typingIndicator.style.display = "block";

    try {
        const response = await fetch('https://luminai.my.id/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: text, user: 'user', prompt: perintah })
        });

        const result = await response.json();
        appendMessage('ai', result.result);
    } catch (error) {
        appendMessage('ai', "Maaf, terjadi kesalahan saat menghubungi server.");
    } finally {
        typingIndicator.style.display = "none"; // Hide typing indicator after response
        sendButton.disabled = false; // Re-enable the send button
    }
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Toggle dark mode
themeToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// Auto-focus input field when page loads
window.addEventListener('load', function() {
    messageInput.focus();
    displayWelcomeMessage();
});
