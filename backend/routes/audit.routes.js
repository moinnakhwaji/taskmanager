import express from "express";
import { createAuditLog, getAllAuditLogs, getAuditLogById, updateAuditLogById, deleteAuditLogById, getAuditLogsByUserId, getAuditLogsByTaskId } from "../controllers/auditlogcontrollers.js";

const router = express.Router();

router.post("/", createAuditLog);
router.get("/", getAllAuditLogs);
router.get("/:id", getAuditLogById);
router.put("/:id", updateAuditLogById);
router.delete("/:id", deleteAuditLogById);
router.get("/user/:userId", getAuditLogsByUserId);
router.get("/task/:taskId", getAuditLogsByTaskId);

export default router;