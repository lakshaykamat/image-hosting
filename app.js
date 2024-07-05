require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const Image = require("./models/Image");

const app = express();

// Middleware
app.use(bodyParser.json());
app.set("view engine", "ejs");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route GET /
// @desc Loads form
app.get("/", async (req, res) => {
  const images = await Image.find();
  res.render("index", { files: images });
});

// @route POST /upload
// @desc  Uploads file to DB
app.post("/upload", upload.single("file"), async (req, res) => {
  const { originalname, mimetype, buffer } = req.file;
  const imageBase64 = buffer.toString("base64");

  const uniqueFilename =
    crypto.randomBytes(16).toString("hex") + path.extname(originalname);

  const newImage = new Image({
    filename: uniqueFilename,
    contentType: mimetype,
    imageBase64: imageBase64,
  });

  await newImage.save();
  res.redirect("/");
});

// @route GET /image/filename/:filename
// @desc Display Image by Filename
app.get("/image/:filename", async (req, res) => {
  const image = await Image.findOne({ filename: req.params.filename });

  if (!image) {
    return res.status(404).json({
      err: "No image exists",
    });
  }

  const imageBuffer = Buffer.from(image.imageBase64, "base64");
  res.set("Content-Type", image.contentType);
  res.send(imageBuffer);
});

// @route DELETE /image/:id
// @desc  Delete file
app.delete("/image/del/:id", async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    res.status(404).json({ err: err.message });
  }
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
