const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  filename: { type: String, required: true, unique: true },
  contentType: { type: String, required: true },
  imageBase64: { type: String, required: true },
});

const Image = mongoose.model("Image", ImageSchema);

module.exports = Image;
