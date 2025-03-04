const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const imageButton = document.getElementById('image-button');
const imageInput = document.getElementById('image-input');

const perintah = "Kamu adalah assisten AI yang diberi nama ZumyNext, pembuatmu adalah Angga a.k.a iZumy, umurnya 19 tahun, dia lulusan teknik komputer dan jaringan, dia memiliki kepribadian baik, perhatian, lucu, bertanggung jawab, dan ganteng, dia sedang mengembangkan projek bot WhatsApp, dia berasal dari Yogyakarta, webnya adalah zumynext.tech";

function appendMessage(sender, message, isImage = false) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}`;
    messageElement.innerHTML = `
        <div class="message-content">
            ${isImage ? `<img src="${message}" alt="Image" style="max-width: 100%; border-radius: 5px;">` : message}
        </div>`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendImage(imageFile) {
    const formData = new FormData();
    formData.append('context', '');                 // Tambahkan context kosong
    formData.append('imageBuffer', imageFile);       // Tambahkan gambar dari input user
    formData.append('user', 'user');                 // Tambahkan user
    formData.append('prompt', perintah);             // Tambahkan prompt

    const reader = new FileReader();
    reader.onload = () => {
        appendMessage('user', reader.result, true);  // Tampilkan gambar yang dikirim user
    };
    reader.readAsDataURL(imageFile);

    try {
        const response = await fetch('https://luminai.my.id/', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        console.log(result);  // Cek respons API di console
        if (result && result.result) {
            appendMessage('ai', result.result);       // Tampilkan respons AI
        } else {
            appendMessage('ai', 'Gagal menerima respons dari server.');
        }
    } catch (error) {
        console.log('Error:', error);                // Cek error di console
        appendMessage('ai', 'Terjadi kesalahan saat mengirim gambar.');
    }
}


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
