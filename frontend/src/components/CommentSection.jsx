import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Divider,
  Collapse,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

dayjs.extend(relativeTime);

const stringToColor = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 45%, 40%)`;
};

const CommentSection = ({ postId, comments: initialComments, open, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments || []);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comment`, {
        text: commentText.trim(),
      });
      setComments((prev) => [...prev, data.comment]);
      setCommentText("");
      if (onCommentAdded) onCommentAdded(data.comment);
    } catch (err) {
      console.error("Comment failed:", err.response?.data?.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Collapse in={open}>
      <Divider sx={{ mb: 1.5 }} />

      {comments.length > 0 && (
        <Box mb={1.5}>
          {comments.map((comment, idx) => (
            <Box key={comment._id || idx} display="flex" gap={1} mb={1.5}>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: "0.75rem",
                  bgcolor: stringToColor(comment.username),
                  flexShrink: 0,
                }}
              >
                {comment.username?.[0]?.toUpperCase()}
              </Avatar>
              <Box flex={1}>
                <Box
                  sx={{
                    bgcolor: "#f5f5f5",
                    borderRadius: "0 12px 12px 12px",
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Typography variant="caption" fontWeight={700} display="block">
                    {comment.username}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                    {comment.text}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ pl: 1, mt: 0.25, display: "block" }}
                >
                  {dayjs(comment.createdAt).fromNow()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {comments.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1.5, fontStyle: "italic", fontSize: "0.85rem" }}
        >
          No comments yet — be the first to say something.
        </Typography>
      )}

      {user && (
        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          gap={1}
          alignItems="center"
        >
          <Avatar
            sx={{
              width: 30,
              height: 30,
              fontSize: "0.75rem",
              bgcolor: stringToColor(user.name),
              flexShrink: 0,
            }}
          >
            {user.name?.[0]?.toUpperCase()}
          </Avatar>
          <TextField
            fullWidth
            size="small"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            inputProps={{ maxLength: 500 }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 5,
                backgroundColor: "#f5f5f5",
                "& fieldset": { border: "none" },
              },
            }}
          />
          <IconButton
            type="submit"
            size="small"
            disabled={!commentText.trim() || submitting}
            sx={{
              color: commentText.trim() ? "#1a1a2e" : "#bbb",
              transition: "color 0.2s",
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Collapse>
  );
};

export default CommentSection;
