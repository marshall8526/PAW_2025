// upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// дозволяє безпечну обробку запитів без файла
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!file) return cb(null, false); // нічого не зберігати
    const dir = `./uploads/${req.params.taskId}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

module.exports = upload;
