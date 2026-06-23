import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  // Generate initials avatar background color from name
  const stringToColor = (str = "") => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 45%, 40%)`;
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e8e8e8",
      }}
    >
      <Toolbar sx={{ maxWidth: 680, width: "100%", mx: "auto", px: 2 }}>
        {/* App Name */}
        <Typography
          variant="h6"
          onClick={() => navigate("/feed")}
          sx={{
            fontWeight: 700,
            color: "#1a1a2e",
            cursor: "pointer",
            letterSpacing: "-0.5px",
            flexGrow: 1,
            fontFamily: "'Georgia', serif",
          }}
        >
          Socially
        </Typography>

        {user ? (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="body2"
              sx={{ color: "#555", display: { xs: "none", sm: "block" } }}
            >
              {user.name}
            </Typography>
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar
                src={user.avatar || ""}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: stringToColor(user.name),
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                {user.name ? user.name[0].toUpperCase() : "U"}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{ elevation: 2, sx: { minWidth: 160, mt: 1 } }}
            >
              <MenuItem disabled sx={{ opacity: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Signed in as
                </Typography>
              </MenuItem>
              <MenuItem disabled sx={{ opacity: 1, pt: 0 }}>
                <Typography variant="body2" fontWeight={600}>
                  {user.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: "#d32f2f" }}>
                Sign out
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box display="flex" gap={1}>
            <Button
              variant="text"
              onClick={() => navigate("/login")}
              sx={{ color: "#1a1a2e", textTransform: "none" }}
            >
              Log in
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/signup")}
              sx={{
                bgcolor: "#1a1a2e",
                textTransform: "none",
                borderRadius: 2,
                "&:hover": { bgcolor: "#2d2d4e" },
              }}
            >
              Sign up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
