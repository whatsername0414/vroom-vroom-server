import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(' ', '-')}`);
  },
});
export const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 },
}).single('image');
