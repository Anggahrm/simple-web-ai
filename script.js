const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const imageButton = document.getElementById('image-button');
const imageInput = document.getElementById('image-input');
const chatToggle = document.getElementById('chat-toggle');
const themeToggle = document.getElementById('theme-toggle');
const typingIndicator = document.getElementById('typing-indicator');

const perintah = "Kamu adalah assisten AI yang diberi nama ZumyNext, pembuatmu adalah Angga a.k.a iZumy, umurnya 19 tahun, dia lulusan teknik komputer dan jaringan, dia memiliki kepribadian baik, perhatian, lucu, bertanggung jawab, dan ganteng, dia sedang mengembangkan projek bot WhatsApp, dia berasal dari Yogyakarta, webnya adalah zumynext.tech";

// Function to append a message to the chat
function appendMessage(sender, message, isImage = false) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}`;
    messageElement.innerHTML = `
        <div class="message-content">
            ${isImage ? `<img src="${message}" alt="Image" style="max-width: 100%; border-radius: 5px;">` : message}
        </div>`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
}

// Function to send a text message
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    messageInput.value = '';

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
    }
}

// Function to send an image
async function sendImage(imageFile) {
    const formData = new FormData();
    formData.append('content', '');
    formData.append('imageBuffer', imageFile);
    formData.append('user', 'user');
    formData.append('prompt', perintah);

    const reader = new FileReader();
    reader.onload = () => {
        appendMessage('user', reader.result, true);
    };
    reader.readAsDataURL(imageFile);

    typingIndicator.style.display = "block";

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        appendMessage('ai', result.message);
    } catch (error) {
        appendMessage('ai', "Gagal mengirim gambar.");
    } finally {
        typingIndicator.style.display = "none";
    }
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
imageButton.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', () => {
    if (imageInput.files.length > 0) {
        sendImage(imageInput.files[0]);
        imageInput.value = ''; // Reset input file
    }
});

// Toggle chat visibility
chatToggle.addEventListener('click', function () {
    const chatContainer = document.querySelector(".chat-container");
    chatContainer.style.display = chatContainer.style.display === "flex" ? "none" : "flex";
});

// Toggle dark mode
themeToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});
