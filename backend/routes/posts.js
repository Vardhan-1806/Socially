const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const Post = require("../models/Post");
const { protect } = require("../middleware/auth");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @route   GET /api/posts
// @desc    Get all posts (public feed), newest first, with pagination
// @access  Public
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .lean(); // lean for better performance

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    });
  } catch (error) {
    console.error("Feed error:", error.message);
    res.status(500).json({ message: "Failed to load posts" });
  }
});

// @route   POST /api/posts
// @desc    Create a new post (text, image, or both)
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { text } = req.body;
    let imageUrl = "";
    let imagePublicId = "";

    // Validate: at least text or image required
    const hasImage = req.files && req.files.image;
    if (!text && !hasImage) {
      return res.status(400).json({ message: "Post must have text or an image" });
    }

    // Upload image to Cloudinary if provided
    if (hasImage) {
      const file = req.files.image;

      // Validate file type
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Only image files are allowed" });
      }

      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ message: "Image must be under 5MB" });
      }

      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "socialapp/posts",
        transformation: [{ width: 800, crop: "limit" }],
      });

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const post = await Post.create({
      author: req.user._id,
      authorName: req.user.name,
      authorAvatar: req.user.avatar || "",
      text: text ? text.trim() : "",
      imageUrl,
      imagePublicId,
      likes: [],
      comments: [],
    });

    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    console.error("Create post error:", error.message);
    res.status(500).json({ message: "Failed to create post" });
  }
});

// @route   PATCH /api/posts/:id/like
// @desc    Toggle like on a post
// @access  Private
router.patch("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id;
    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      likes: post.likes,
      liked: !alreadyLiked,
      likeCount: post.likes.length,
    });
  } catch (error) {
    console.error("Like error:", error.message);
    res.status(500).json({ message: "Failed to update like" });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    if (text.trim().length > 500) {
      return res.status(400).json({ message: "Comment cannot exceed 500 characters" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      user: req.user._id,
      username: req.user.name,
      text: text.trim(),
    };

    post.comments.push(newComment);
    await post.save();

    // Return only the newly added comment
    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      message: "Comment added",
      comment: addedComment,
      commentCount: post.comments.length,
    });
  } catch (error) {
    console.error("Comment error:", error.message);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post (only by author)
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only the author can delete their post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    // Delete image from Cloudinary if it exists
    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId);
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error.message);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

module.exports = router;
