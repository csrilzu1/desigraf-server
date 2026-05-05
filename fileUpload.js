// ================================
// DESIGRAF FILE UPLOAD SYSTEM
// ================================

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// =========================
// STORAGE CONFIG
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// =========================
// UPLOAD FILE
// =========================
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.json({
    success: true,
    fileUrl,
    originalName: req.file.originalname,
    type: req.file.mimetype
  });
});

// =========================
// GET FILE
// =========================
router.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.sendFile(filePath);
});

// =========================
// DELETE FILE
// =========================
router.post("/delete-file", (req, res) => {
  const { filename } = req.body;

  const filePath = path.join(__dirname, "uploads", filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  res.json({ success: true });
});

module.exports = router;