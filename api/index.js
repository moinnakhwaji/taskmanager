import express from "express";
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


globalThis.fetch = fetch;
dotenv.config();
dbconnect();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
   cors: {
    origin: "http://localhost:3000", // Frontend origin
    credentials: true, // Allow cookies/auth headers
  }, } // Allow all origins for Socket.IO. In production, change this.
);

const PORT = process.env.PORT || 5000;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Allow 100 requests per 15 minutes
  standardHeaders: 'draft-8', // Provide RateLimit-* headers
  legacyHeaders: false, // Disable legacy headers
});

// Apply rate limit globally
// app.use(limiter);
app.use(ClerkExpressWithAuth()); // Clerk authentication middleware
app.use(cors({
  origin: "http://localhost:3000", // Frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json()); // JSON parser middleware

// Route handlers
app.use("/api/users", limiter, userRoutes);
app.use("/api/tasks", limiter, taskRoutes);
app.use("/api/notifications", limiter, notificationRoutes);
app.use("/api/audit", limiter, auditRoutes);

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
