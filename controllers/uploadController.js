const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const { createWorker } = require('tesseract.js');
const Document = require('../models/Document');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const extractTextFromPdf = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse(new Uint8Array(dataBuffer));
  const data = await parser.getText();
  return data.text || '';
};

const extractTextFromImage = async (filePath) => {
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(filePath);
    return data.text || '';
  } finally {
    await worker.terminate();
  }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    upload.single('file')(req, res, async (error) => {
      if (error) {
        return res.status(400).json({ message: error.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      let extractedText = '';
      if (req.file.mimetype === 'application/pdf') {
        extractedText = await extractTextFromPdf(req.file.path);
      } else {
        extractedText = await extractTextFromImage(req.file.path);
      }

      const document = await Document.create({
        userId: req.user._id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        path: req.file.path,
        documentType: req.body.documentType || 'Other',
        extractedText,
      });

      res.status(201).json({
        documentId: document._id,
        extractedText,
      });
    });
  } catch (error) {
    next(error);
  }
};
