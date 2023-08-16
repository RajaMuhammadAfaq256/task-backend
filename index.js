// server/index.js
const express = require('express');
const multer = require('multer');
const cors = require('cors')
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 3001;
app.use(cors());

app.use('/images', express.static(path.join(__dirname, 'images')));

mongoose.connect('mongodb+srv://afaq:ZfQSfjMoJ87wttwk@cluster0.y9riz0x.mongodb.net');

const CommentSchema = new mongoose.Schema({
  text: String,
});

const ImageSchema = new mongoose.Schema({
  filename: String,
  comments: [CommentSchema],
});

const Image = mongoose.model('Image', ImageSchema);

app.use(express.json());


const storage = multer.diskStorage({
  destination: './images',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  const { filename } = req.file;
  const image = new Image({ filename });
  const response = await image.save();
  res.json({ success: true, data:response });
});

app.get('/images', async (req, res) => {
  const images = await Image.find();
  res.json(images);
});

app.post('/comment/:imageId', async (req, res) => {
  const { imageId } = req.params;
  const { text } = req.body;
  const image = await Image.findById(imageId);
  if (!image) {
    return res.status(404).json({ error: 'Image not found' });
  }
  image.comments.push({ text });
  await image.save();
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
