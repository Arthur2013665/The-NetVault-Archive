const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const category = req.body.category;
        const uploadPath = path.join(__dirname, 'uploads', category);
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route for uploading files
app.post('/upload', upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    res.json({ message: 'Files uploaded successfully', files: req.files });
});

// Route for getting the files
app.get('/files', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve files' });
        }
        const fileList = files.map(file => file.name);
        res.json({ files: fileList });
    });
});

// Route for downloading files
app.get('/download', (req, res) => {
    const fileName = req.query.file;
    const filePath = path.join(__dirname, 'uploads', fileName);
    res.download(filePath, fileName, err => {
        if (err) {
            res.status(500).json({ message: 'Error downloading file' });
        }
    });
});

// Route for deleting files
app.delete('/delete', (req, res) => {
    const fileName = req.query.file;
    const filePath = path.join(__dirname, 'uploads', fileName);
    fs.unlink(filePath, err => {
        if (err) {
            return res.status(500).json({ message: 'Failed to delete file' });
        }
        res.json({ message: 'File deleted successfully' });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
