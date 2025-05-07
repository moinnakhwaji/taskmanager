import { Notification } from "../models/Notification.js";
import { io } from "../index.js";

import { clerkClient, requireAuth, getAuth } from '@clerk/express';
import { User } from "../models/Userschema.js";
// Create notification

export const createNotification = async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ message: "Email and message are required" });
    }

    // Find user in DB by email
    const dbUser = await User.findOne({ email });

    if (!dbUser) {
      return res.status(404).json({ message: "User not found in DB" });
    }

    const userId = dbUser._id;

    // Create the notification
    const notification = await Notification.create({ message, user: userId });

    // Emit the notification to user's socket room
    io.to(userId.toString()).emit("notification", notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error("Notification Error:", error);
    res.status(500).json({ message: "Error creating notification" });
  }
};


// Get all notifications for a user
export const getAllNotificationsByUserId = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      return res.status(400).json({ message: "Email not found" });
    }

    // Rest of your code remains the same
    const dbUser = await User.findOne({ email });
    if (!dbUser) {
      return res.status(404).json({ message: "User not found in DB" });
    }

    const tasks = await Notification.find({user:dbUser._id});
    if (tasks.length === 0) {
      return res.status(200).json({ message: "No tasks created by you" });
    }

    return res.status(200).json(tasks);

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// Update notification
export const updateNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating notification" });
  }
};

// Delete notification
export const deleteNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting notification" });
  }
};
