import React, { useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Paper,
  Divider,
  Tooltip,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import CommentSection from "./CommentSection";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

dayjs.extend(relativeTime);

const stringToColor = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 45%, 40%)`;
};

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const isLiked = user ? likes.some((id) => id === user._id || id?._id === user._id) : false;
  const isAuthor = user && post.author === user._id;

  const handleLike = async () => {
    if (!user || likeLoading) return;
    setLikeLoading(true);

    // Optimistic update
    const alreadyLiked = likes.some((id) => id === user._id || id?._id === user._id);
    if (alreadyLiked) {
      setLikes((prev) => prev.filter((id) => (id?._id || id) !== user._id));
    } else {
      setLikes((prev) => [...prev, user._id]);
    }

    try {
      const { data } = await api.patch(`/posts/${post._id}/like`);
      setLikes(data.likes);
    } catch (err) {
      // Revert on failure
      setLikes(post.likes || []);
      console.error("Like failed:", err.message);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleToggleComments = () => setShowComments((prev) => !prev);

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e8e8e8",
        borderRadius: 3,
        mb: 2,
        backgroundColor: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Post Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" px={2} pt={2} pb={1}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            src={post.authorAvatar || ""}
            sx={{
              width: 40,
              height: 40,
              bgcolor: stringToColor(post.authorName),
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            {post.authorName?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {post.authorName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dayjs(post.createdAt).fromNow()}
            </Typography>
          </Box>
        </Box>

        {isAuthor && (
          <Tooltip title="Delete post">
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{ color: "#bbb", "&:hover": { color: "#d32f2f" } }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Post Text */}
      {post.text && (
        <Typography
          variant="body2"
          sx={{
            px: 2,
            pb: post.imageUrl ? 1.5 : 0,
            lineHeight: 1.6,
            fontSize: "0.95rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {post.text}
        </Typography>
      )}

      {/* Post Image */}
      {post.imageUrl && (
        <Box mt={post.text ? 0 : 1}>
          <img
            src={post.imageUrl}
            alt="Post"
            style={{
              width: "100%",
              maxHeight: 400,
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>
      )}

      {/* Like & Comment counts */}
      <Box px={2} pt={1} pb={0.5} display="flex" alignItems="center" gap={2}>
        {likes.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            {likes.length} {likes.length === 1 ? "like" : "likes"}
          </Typography>
        )}
        {commentCount > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
            onClick={handleToggleComments}
          >
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </Typography>
        )}
      </Box>

      <Divider sx={{ mx: 2, mt: 0.5 }} />

      {/* Action Buttons */}
      <Box display="flex" px={1} py={0.5}>
        <Tooltip title={user ? (isLiked ? "Unlike" : "Like") : "Log in to like"}>
          <Box
            component="span"
            sx={{ flex: 1, display: "flex", justifyContent: "center" }}
          >
            <IconButton
              onClick={handleLike}
              disabled={!user}
              size="small"
              sx={{
                gap: 0.75,
                px: 2,
                py: 0.75,
                borderRadius: 2,
                color: isLiked ? "#e53935" : "#555",
                width: "100%",
                justifyContent: "center",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "#fff0f0", color: "#e53935" },
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              {isLiked ? (
                <FavoriteIcon sx={{ fontSize: 18 }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: 18 }} />
              )}
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.85rem" }}>
                Like
              </Typography>
            </IconButton>
          </Box>
        </Tooltip>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <IconButton
            onClick={handleToggleComments}
            size="small"
            sx={{
              gap: 0.75,
              px: 2,
              py: 0.75,
              borderRadius: 2,
              color: showComments ? "#1a1a2e" : "#555",
              width: "100%",
              justifyContent: "center",
              "&:hover": { bgcolor: "#f0f0ff", color: "#1a1a2e" },
            }}
          >
            <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.85rem" }}>
              Comment
            </Typography>
          </IconButton>
        </Box>
      </Box>

      {/* Comments Section */}
      <Box px={2} pb={showComments ? 2 : 0}>
        <CommentSection
          postId={post._id}
          comments={comments}
          open={showComments}
          onCommentAdded={(newComment) => {
            setComments((prev) => [...prev, newComment]);
            setCommentCount((prev) => prev + 1);
          }}
        />
      </Box>
    </Paper>
  );
};

export default PostCard;
