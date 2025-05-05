import express from "express";
import { createTask, getAllTasks, getTaskById, updateTaskById, deleteTaskById, getTaskByStatus, getTaskByPriority, getTaskByDueDate, getTaskByAssignedTo, searchTasks, getTaskByCreatedBy, getassignTask, Fetchallemail } from "../controllers/taskSchema.js";
import { requireAuth, getAuth } from '@clerk/express';



const router = express.Router();

router.post("/", createTask);
router.get("/", requireAuth(), getAllTasks);
router.get("/email", requireAuth(), Fetchallemail);
router.get("/assign", requireAuth(), getassignTask);

router.get("/:id", getTaskById);
router.put("/:id", updateTaskById);
router.delete("/:id", deleteTaskById);
router.get("/status/:status", getTaskByStatus);
router.get("/priority/:priority", getTaskByPriority);
router.get("/dueDate/:dueDate", getTaskByDueDate);
router.get("/assignedTo/:assignedTo", getTaskByAssignedTo);
router.get("/search", searchTasks);
router.get("/createdBy/:createdBy", getTaskByCreatedBy);

export default router;
