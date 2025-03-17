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

app.post('/upload', upload.single('imageBuffer'), (req, res) => {
    const imageBuffer = req.file.buffer;
    // Process the imageBuffer here

    res.json({ message: 'Image received and processed' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
