import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  role: {
    type: String,
    enum: ["admin", "manager", "user"],
    default: "user",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  clerkUserId: {
    type: String,  // Store Clerk's user ID
    required: true,
    unique: true,  // Ensure no duplicates
  },
});

export const User = mongoose.model("User", userSchema);
