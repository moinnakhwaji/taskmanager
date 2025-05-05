import { AuditLog } from "../models/Auditschema.js";

export const logAudit = async ({ action, user, task, description }) => {
    try {
      console.log("Saving audit log:", { action, user, task, description });
  
      const log = new AuditLog({ action, user, task, description });
      await log.save();
  
      console.log("Audit log saved!");
    } catch (err) {
      console.error("Audit logging failed:", err);
    }
  };
  