import mammoth from "mammoth";
import multer from "multer";
import pdfParse from "pdf-parse";
import { HttpError } from "../utils/http.js";

const PDF_MIME = "application/pdf";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const isPdf = file.mimetype === PDF_MIME || file.originalname.toLowerCase().endsWith(".pdf");
    const isDocx = file.mimetype === DOCX_MIME || file.originalname.toLowerCase().endsWith(".docx");
    if (!isPdf && !isDocx) {
      cb(new HttpError(400, "Only PDF and DOCX files are supported"));
      return;
    }
    cb(null, true);
  }
});

export async function parseResumeFile(file: Express.Multer.File) {
  const lowerName = file.originalname.toLowerCase();

  try {
    if (file.mimetype === PDF_MIME || lowerName.endsWith(".pdf")) {
      const parsed = await pdfParse(file.buffer);
      return parsed.text.trim();
    }

    if (file.mimetype === DOCX_MIME || lowerName.endsWith(".docx")) {
      const parsed = await mammoth.extractRawText({ buffer: file.buffer });
      return parsed.value.trim();
    }
  } catch {
    throw new HttpError(400, "Could not parse resume file");
  }

  throw new HttpError(400, "Unsupported file type");
}
