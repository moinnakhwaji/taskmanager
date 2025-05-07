import { User } from "../models/Userschema.js";
import { logAudit } from "../utils/auditLogger.js";

//create a new user in db 
export const createUser = async (req, res) => {
    try {
      const { name, email, role, clerkUserId } = req.body;
  
      if (!name || !email || !role || !clerkUserId) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const existingUser = await User.findOne({ clerkUserId });
  
      if (existingUser) {
        return res.status(200).json({ message: "User already exists", user: existingUser });
      }
  
      const user = await User.create({ name, email, role, clerkUserId });
      await logAudit({
        action: "create",
        user: req.user?._id || "system", // fallback if not authenticated
        task: user._id, // treat created user as "task/entity"
        description: `User "${user.name}" created with email ${user.email}`,
      });
      res.status(201).json(user);
  
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  };
  

//get all users from db
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
        
        } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users" });
    }
}

//get user by id
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
        
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Error fetching user" });
    }
}


