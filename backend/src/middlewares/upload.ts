import multer from "multer";
import path from "path";

// Dossier où les images seront stockées
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/rooms");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + "-" + Date.now() + ext;
    cb(null, name);
  },
});

export const upload = multer({ storage });
