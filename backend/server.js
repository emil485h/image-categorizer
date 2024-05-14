// backend/server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { sequelize, Image } = require("./db"); // Import the Sequelize instance and model

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route to upload image and store data
app.post("/upload", upload.single("image"), async (req, res) => {
  const { categories } = req.body;

  try {
    const newImage = await Image.create({
      filename: req.file.filename,
      categories: JSON.parse(categories),
    });

    res.status(200).json({ message: "Image uploaded and data stored" });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to search images by category
app.get("/search", async (req, res) => {
  const { category } = req.query;

  try {
    const images = await Image.findAll({
      where: {
        categories: sequelize.literal(
          `JSON_CONTAINS(categories, '"${category}"', '$')`
        ),
      },
    });

    res.status(200).json(images);
  } catch (error) {
    console.error("Error searching images:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to fetch all images
app.get("/images", async (req, res) => {
  try {
    const images = await Image.findAll();
    res.status(200).json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to delete an image by ID
app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const image = await Image.findByPk(id);
    if (image) {
      await Image.destroy({ where: { id } });
      fs.unlinkSync(path.join(uploadsDir, image.filename)); // Delete file from filesystem
      res.status(200).json({ message: "Image deleted" });
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
