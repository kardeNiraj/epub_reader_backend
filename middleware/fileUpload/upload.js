import fs from "fs-extra";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { CustomError } from "../../helpers/custom_error.js";
import epubCheck from "epub-check";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const dirPath = `files/${req?.user?.created_at}_${req?.user?.name?.replace(
      / /g,
      "_"
    )}/`;
    fs.mkdirSync(dirPath, { recursive: true });
    callback(null, dirPath);
  },
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    callback(null, filename);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    if (file.mimetype !== "application/epub+zip") {
      return callback(
        new CustomError("Error, Only epub file is allowed"),
        false
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
});

export { upload };

export const validateEpub = (req, res, next) => {
  const file = req.file;
  if (!file) {
    return next(new CustomError("Error, No file uploaded"));
  }

  const tempPath = path.join(__dirname, "temp", file.filename);
  const writeStream = fs.createWriteStream(tempPath);

  fs.createReadStream(file.path).pipe(writeStream);

  writeStream.on("finish", () => {
    epubCheck(tempPath, (err, result) => {
      fs.unlinkSync(tempPath); // Remove the temporary file

      if (err || result.messages.length > 0) {
        return next(new CustomError("Error, EPUB file is corrupted"));
      }

      next();
    });
  });

  writeStream.on("error", (err) => {
    next(new CustomError("Error, Failed to process the file"));
  });
};
