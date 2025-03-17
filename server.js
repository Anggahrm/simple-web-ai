const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, '/')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.single('imageBuffer'), async (req, res) => {
    const imageBuffer = req.file.buffer;
    const prompt = req.body.prompt;

    try {
        const response = await fetch('https://luminai.my.id/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: '', imageBuffer: imageBuffer.toString('base64'), user: 'user', prompt: prompt })
        });

        const result = await response.json();
        res.json({ message: result.result });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengirim gambar.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
