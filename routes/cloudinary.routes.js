// routes/storeRoutes.js
const express = require("express");
const router = express.Router();
const cloudinary = require("../cloudinary/cloudinary.config");
const upload = require("../cloudinary/multer.config");
const fs = require("fs");


// POST /store/upload-image
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Wrap upload_stream in Promise
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "store_photos" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    return res.json({
      success: true,
      message: "Photo uploaded successfully",
      url: result.secure_url,
    });
  } catch (err) {
    console.error("Upload route error:", err);
    res.status(500).json({ success: false, message: "Image upload failed" });
  }
});



module.exports = router;
