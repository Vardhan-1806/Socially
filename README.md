# Socially — Mini Social Post App

A full-stack social media app built with React, Node.js, Express, and MongoDB.

---

## Project Structure

```
socialapp/
├── backend/          # Node.js + Express API
└── frontend/         # React + Material UI
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

**Required .env values:**
| Key | Where to get it |
|---|---|
| `MONGO_URI` | MongoDB Atlas → Connect → Drivers |
| `JWT_SECRET` | Any long random string |
| `CLOUDINARY_CLOUD_NAME` | cloudinary.com → Dashboard |
| `CLOUDINARY_API_KEY` | cloudinary.com → Dashboard |
| `CLOUDINARY_API_SECRET` | cloudinary.com → Dashboard |

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api for local dev
npm start
```

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/posts?page=1&limit=10` | ❌ | Public feed |
| POST | `/api/posts` | ✅ | Create post (text/image) |
| PATCH | `/api/posts/:id/like` | ✅ | Toggle like |
| POST | `/api/posts/:id/comment` | ✅ | Add comment |
| DELETE | `/api/posts/:id` | ✅ | Delete own post |

---

## Deployment

### Backend → Render
1. Push backend folder to GitHub
2. New Web Service on Render → connect repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables from `.env`

### Frontend → Vercel
1. Push frontend folder to GitHub
2. Import project on Vercel
3. Set environment variable: `REACT_APP_API_URL=https://your-render-url.onrender.com/api`
4. Deploy

### Database → MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Create database user
3. Whitelist IP: `0.0.0.0/0` (for Render)
4. Copy connection string to `MONGO_URI`

### Images → Cloudinary
1. Sign up at cloudinary.com (free tier is enough)
2. Copy Cloud Name, API Key, API Secret to `.env`

---

## Features

- Signup / Login with JWT authentication
- Create posts with text, image, or both
- Public feed (newest first) with pagination
- Like / unlike posts (optimistic UI)
- Comment on posts (Enter to submit)
- Delete your own posts
- Relative timestamps ("2 hours ago")
- Skeleton loading state
- Responsive layout (mobile-friendly)
