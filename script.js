async function sendMessage() {
    const input = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    const message = input.value.trim();

    if (message) {
        appendMessage("user-message", message);
        input.value = "";

        try {
            const response = await fetch(`https://api.mistra.top/ai/llm/claude-3-haiku?prompt=${encodeURIComponent(message)}`);
            const data = await response.json();

            if (data.status === 200) {
                appendMessage("ai-message", data.result);
            } else {
                appendMessage("ai-message", "Terjadi kesalahan, coba lagi.");
            }
        } catch (error) {
            appendMessage("ai-message", "Gagal terhubung ke server." + error);
        }
    }
}

function appendMessage(className, text) {
    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("div");
    messageElement.className = `message ${className}`;
    messageElement.textContent = text;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

