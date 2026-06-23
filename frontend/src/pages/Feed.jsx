import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Skeleton,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// Skeleton loader for a single post card
const PostSkeleton = () => (
  <Box
    sx={{
      border: "1px solid #e8e8e8",
      borderRadius: 3,
      p: 2,
      mb: 2,
      bgcolor: "#fff",
    }}
  >
    <Box display="flex" gap={1.5} mb={1.5}>
      <Skeleton variant="circular" width={40} height={40} />
      <Box flex={1}>
        <Skeleton width="40%" height={16} />
        <Skeleton width="25%" height={13} sx={{ mt: 0.5 }} />
      </Box>
    </Box>
    <Skeleton width="90%" height={16} />
    <Skeleton width="70%" height={16} sx={{ mt: 0.5 }} />
    <Skeleton variant="rectangular" height={200} sx={{ mt: 1.5, borderRadius: 2 }} />
  </Box>
);

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      const { data } = await api.get(`/posts?page=${pageNum}&limit=10`);
      if (append) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Failed to load posts. Please refresh.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    setPage(nextPage);
    await fetchPosts(nextPage, true);
  };

  // Prepend newly created post to the top of the feed
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Remove deleted post from feed
  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <Box sx={{ backgroundColor: "#f7f7f8", minHeight: "100vh", pb: 6 }}>
      <Box sx={{ maxWidth: 600, mx: "auto", px: 2, pt: 3 }}>

        {/* Create Post — only for logged-in users */}
        {user && <CreatePost onPostCreated={handlePostCreated} />}

        {/* Not logged in nudge */}
        {!user && (
          <Box
            sx={{
              border: "1px solid #e8e8e8",
              borderRadius: 3,
              p: 2,
              mb: 2,
              bgcolor: "#fff",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>Log in</strong> to post, like, and comment.
            </Typography>
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading skeletons */}
        {loading && (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}

        {/* Posts */}
        {!loading && posts.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" fontWeight={400}>
              No posts yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {user
                ? "Be the first to share something!"
                : "Sign up to start posting."}
            </Typography>
          </Box>
        )}

        {!loading &&
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handlePostDeleted}
            />
          ))}

        {/* Load more */}
        {!loading && page < totalPages && (
          <Box textAlign="center" mt={1} mb={4}>
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outlined"
              sx={{
                textTransform: "none",
                borderColor: "#ddd",
                color: "#555",
                borderRadius: 5,
                px: 4,
                "&:hover": { borderColor: "#1a1a2e", color: "#1a1a2e" },
              }}
            >
              {loadingMore ? (
                <CircularProgress size={18} sx={{ color: "#555" }} />
              ) : (
                "Load more"
              )}
            </Button>
          </Box>
        )}

        {/* End of feed */}
        {!loading && posts.length > 0 && page >= totalPages && (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mt={2}
            mb={4}
          >
            You've seen all posts.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Feed;
