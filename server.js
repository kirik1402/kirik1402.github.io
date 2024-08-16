const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/myproject', { useNewUrlParser: true, useUnifiedTopology: true });

const PostSchema = new mongoose.Schema({
    text: String,
    time: String,
    image: String
});

const Post = mongoose.model('Post', PostSchema);

// Routes
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ _id: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/posts', async (req, res) => {
    const post = new Post({
        text: req.body.text,
        time: req.body.time,
        image: req.body.image
    });

    try {
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        await post.remove();
        res.json({ message: "Deleted post" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
