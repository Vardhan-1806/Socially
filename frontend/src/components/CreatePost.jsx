import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  IconButton,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// Generates consistent avatar color from a string
const stringToColor = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 45%, 40%)`;
};

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!text.trim() && !imageFile) {
      setError("Please add some text or an image to post");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (imageFile) formData.append("image", imageFile);

      const { data } = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Reset form
      setText("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Notify parent to prepend new post to feed
      if (onPostCreated) onPostCreated(data.post);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e8e8e8",
        borderRadius: 3,
        p: 2,
        mb: 2,
        backgroundColor: "#fff",
      }}
    >
      <Box display="flex" gap={1.5}>
        <Avatar
          src={user?.avatar || ""}
          sx={{
            width: 40,
            height: 40,
            bgcolor: stringToColor(user?.name),
            fontSize: "0.85rem",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>

        <Box flex={1}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            placeholder={`What's on your mind, ${user?.name?.split(" ")[0]}?`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="standard"
            inputProps={{ maxLength: 1000 }}
            sx={{
              "& .MuiInput-root": { fontSize: "0.95rem" },
              "& .MuiInput-underline:before": { borderColor: "transparent" },
              "& .MuiInput-underline:hover:before": { borderColor: "#e0e0e0" },
            }}
          />

          {/* Image preview */}
          {imagePreview && (
            <Box mt={1.5} position="relative" display="inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: 260,
                  borderRadius: 8,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <IconButton
                size="small"
                onClick={handleRemoveImage}
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  bgcolor: "rgba(0,0,0,0.55)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Character counter */}
          {text.length > 800 && (
            <Typography variant="caption" color={text.length > 950 ? "error" : "text.secondary"}>
              {text.length}/1000
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 1, py: 0 }}>
              {error}
            </Alert>
          )}

          {/* Action bar */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mt={1.5}>
            <Box>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageSelect}
                style={{ display: "none" }}
              />
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                title="Add image"
                sx={{ color: "#555", "&:hover": { color: "#1a1a2e" } }}
              >
                <ImageIcon fontSize="small" />
              </IconButton>
            </Box>

            <Button
              variant="contained"
              size="small"
              onClick={handleSubmit}
              disabled={loading || (!text.trim() && !imageFile)}
              sx={{
                bgcolor: "#1a1a2e",
                textTransform: "none",
                borderRadius: 5,
                px: 2.5,
                fontWeight: 600,
                "&:hover": { bgcolor: "#2d2d4e" },
                "&:disabled": { bgcolor: "#ccc" },
              }}
            >
              {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Post"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default CreatePost;
