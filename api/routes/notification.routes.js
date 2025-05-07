import express from "express";
import {createNotification,getAllNotificationsByUserId,updateNotificationById,deleteNotificationById}
 from "../controllers/notificationcontroller.js"
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.post("/", requireAuth(), createNotification);
router.get("/", requireAuth(), getAllNotificationsByUserId);
router.put("/:id", requireAuth(), updateNotificationById);
router.delete("/:id", requireAuth(), deleteNotificationById);

export default router;
