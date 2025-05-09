import express from 'express';
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";
import { dbconnect } from "./db/db.js";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import { rateLimit } from 'express-rate-limit';
import fetch from 'node-fetch';

// Ensure global fetch is defined
globalThis.fetch = fetch;

dotenv.config();
dbconnect();

const app = express();
const server = http.createServer(app);

// Allowed origins
const allowedOrigins = [
  "https://taskmanager-taupe-six.vercel.app", // Production frontend
  "http://localhost:3000",                    // Local dev frontend
  "http://127.0.0.1:3000"                     // Alternative local dev
];

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

// Apply middlewares
app.use(limiter);
app.use(ClerkExpressWithAuth());
app.use(express.json()); // Body parser

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Root route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
