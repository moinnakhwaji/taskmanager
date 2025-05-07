
import { Task } from "../models/Taskshema.js";
import { User } from "../models/Userschema.js";
import { logAudit } from "../utils/auditLogger.js";

import { clerkClient, requireAuth, getAuth } from '@clerk/express';




// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedTo, createdBy } = req.body;

    if (!title || !description || !createdBy) {
      return res.status(400).json({ message: 'Title, description, and Created By are required' });
    }

    const creatorUser = await User.findOne({ email: createdBy });
    if (!creatorUser) {
      return res.status(400).json({ message: 'Creator user not found' });
    }

    let assignedUser = null;
    if (assignedTo && assignedTo.trim() !== "") {
      assignedUser = await User.findOne({ email: assignedTo });
      if (!assignedUser) {
        return res.status(400).json({ message: 'Assigned user not found' });
      }
    }

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      assignedTo: assignedUser ? assignedUser._id : undefined,
      createdBy: creatorUser._id,
    });

    await task.save();
    await logAudit({
      action: "create",
      user: creatorUser._id,
      task: task._id,
      description: `Task "${title}" created by ${creatorUser.email}`,
    });
    res.status(201).json({ task });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating task" });
  }
};


// Get all tasks for a user
export const getAllTasks = async (req, res) => {
    try {
      const { userId } = getAuth(req); // Clerk provides this
    //   console.log(userId,"userId");
      const cleanUserId = userId.replace("user_", "");
  
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
  
      const user = await User.findOne({ clerkUserId: cleanUserId }); // Assuming you store Clerk's userId in your DB
    //   console.log(user,"user");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const tasks = await Task.find({
        $or: [
          { createdBy: user._id },
          { assignedTo: user._id }
        ]
      });
  
      if (tasks.length === 0) {
        return res.status(404).json({ message: "No tasks found" });
      }
  
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Error fetching tasks" });
    }
  };

//right a assign logic get data only fetch that thing where user is assigned to mean right a logic where you assign a task to other user

export const Fetchallemail = async (req, res) => {
  try {
   const email = await User.find({});
   if(email.length === 0){
    return res.status(404).json({ message: "No tasks created by you" });
   }
   res.status(200).json(email);
}
catch(error){
  console.log(error)
  res.status(500).json({ message: "Error fetching tasks" });
}


}

export const getassignTask = async (req, res) => {
  try {
    // 1) Get the userId using getAuth()
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // 2) Use clerkClient to get user information
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

    const tasks = await Task.find({ createdBy: dbUser._id });
    if (tasks.length === 0) {
      return res.status(200).json({ message: "No tasks created by you" });
    }

    return res.status(200).json(tasks);
  } catch (err) {
    console.error("getassignTask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//get task by id
export const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if(!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json(task);
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ message: "Error fetching task" });
    }
}

//update task by id
export const updateTaskById = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        await logAudit({
      action: "update",
      user: task._id,
      task: task._id,
      description: `Task "${task.title}" updated by ${task.createdBy.email}`,
    });
        res.status(200).json(task);
        
        
    }
    catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Error updating task" });
    }
}

//delete task by id
export const deleteTaskById = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if(!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Error deleting task" });
    }
}
//get task by status
export const getTaskByStatus = async (req, res) => {
    try {
        const tasks = await Task.find({ status: req.params.status });
        if(tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found" });
        }
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Error fetching tasks" });
    }
}

//get task by priority
export const getTaskByPriority = async (req, res) => {
    try {
        const tasks = await Task.find({ priority: req.params.priority });
        if(tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found" });
        }
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Error fetching tasks" });
    }
}

//get task by due date
export const getTaskByDueDate = async (req, res) => {
    try {
        const tasks = await Task.find({ dueDate: req.params.dueDate });
        if(tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found" });
        }
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Error fetching tasks" });
    }
}

//get task by assigned to
export const getTaskByAssignedTo = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.params.assignedTo });
        if(tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found" });

        }
        res.status(200).json(tasks);

        
    } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error fetching tasks" });
        
    }
}


// GET /tasks/search?query=meeting&page=1&limit=10
// GET /tasks/search?query=meeting&page=1&limit=10
export const searchTasks = async (req, res) => {
    try {
      const { query = "", page = 1, limit = 10 } = req.query;
  
      const tasks = await Task.find({
        $and: [
          {
            $or: [
              { title: { $regex: query, $options: "i" } },
              { description: { $regex: query, $options: "i" } },
              { assignedTo: { $regex: query, $options: "i" } },
              { createdBy: { $regex: query, $options: "i" } },
            ],
          },
          {
            $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
          },
        ],
      })
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error searching tasks" });
    }
  };
  
//get task by created by
export const getTaskByCreatedBy = async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.params.createdBy });
        if(tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found" });
        }
        res.status(200).json(tasks);
        
    }
    catch(error){
        console.log(error)
        res.status(500).json({ message: "Error fetching tasks" });
    }
}

