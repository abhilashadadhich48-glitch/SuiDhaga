import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads/temp directory exists
const tempDir = path.join(__dirname, '..', '..', 'uploads', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimeMatch = allowedTypes.test(file.mimetype);
  const extMatch = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeMatch && extMatch) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, and WEBP image files are allowed.'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});
