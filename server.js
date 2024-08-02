const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Настройка хранения файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));

// Маршрут для загрузки KML-файлов
app.post('/uploadKML', upload.array('kmlFiles'), (req, res) => {
    res.send('KML Files uploaded successfully.');
});

// Маршрут для загрузки изображений
app.post('/uploadImages', upload.array('imageFiles'), (req, res) => {
    res.send('Images uploaded successfully.');
});

// Маршрут для получения списка фотографий
app.get('/photos', (req, res) => {
    const dir = './uploads';
    fs.readdir(dir, (err, files) => {
        if (err) {
            res.status(500).send('Server error');
            return;
        }
        const photos = files.map(file => ({
            src: `uploads/${file}`,
            // Замените это на реальные координаты
            lat: 55.751244,
            lon: 37.618423,
            direction: 45
        }));
        res.json(photos);
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
