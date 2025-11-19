import express from "express";
import multer from "multer";
import cors from "cors"; // ⭐ เพิ่มอันนี้
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ⭐ เปิด CORS ให้ frontend เข้าถึงได้
app.use(
  cors({
    origin: "*", // หรือ "http://localhost:5173"
    methods: "GET,POST",
  })
);

// ให้ public ใช้ไฟล์ได้
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public", "upload"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    filename: req.file.filename,
    url: `/upload/${req.file.filename}`,
  });
});

app.listen(4000, () => console.log("SERVER RUNNING ON PORT 4000"));
