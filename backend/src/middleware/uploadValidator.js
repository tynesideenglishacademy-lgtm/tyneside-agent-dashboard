import multer from 'multer';
import path from 'path';

// Memory storage for server-side processing & direct upload to Supabase storage
const storage = multer.memoryStorage();

// Allowed file types (Images, PDFs, Invoices, CSVs)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Megabytes

/**
 * Multer middleware with strict 5MB size limit and server-side MIME type validation
 */
export const uploadValidator = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      const err = new Error(`Unsupported file type: ${file.mimetype}. Allowed types: JPG, PNG, WEBP, PDF, CSV, XLSX.`);
      err.status = 400;
      return cb(err, false);
    }
    cb(null, true);
  }
});
