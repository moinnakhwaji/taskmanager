import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ["create", "update", "delete", "assign"],
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },

  description: {
    type: String,
  },
});

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
