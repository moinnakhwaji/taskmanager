import { AuditLog } from "../models/Auditschema.js";

//create audit log
export const createAuditLog = async (req, res) => {
    try {
        const { action, user, task, description } = req.body;
        const auditLog = await AuditLog.create({ action, user, task, description });
        res.status(201).json(auditLog);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error creating audit log" });
    }
}

//get all audit logs
export const getAllAuditLogs = async (req, res) => {
    try {
        const auditLogs = await AuditLog.find();
        res.status(200).json(auditLogs);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error getting all audit logs" });
    }
}

//get audit log by id
export const getAuditLogById = async (req, res) => {
    try {
        const auditLog = await AuditLog.findById(req.params.id);
        res.status(200).json(auditLog);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error getting audit log by id" });
    }
}

//update audit log by id
export const updateAuditLogById = async (req, res) => {
    try {
        const auditLog = await AuditLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(auditLog);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error updating audit log by id" });
    }
}

//delete audit log by id
export const deleteAuditLogById = async (req, res) => {
    try {
        const auditLog = await AuditLog.findByIdAndDelete(req.params.id);
        if(!auditLog) {
            return res.status(404).json({ message: "Audit log not found" });
        }
        res.status(200).json({ message: "Audit log deleted successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error deleting audit log by id" });
    }
}

//get audit logs by user id
export const getAuditLogsByUserId = async (req, res) => {
    try {
        const auditLogs = await AuditLog.find({ user: req.params.userId });
        res.status(200).json(auditLogs);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error getting audit logs by user id" });
    }
}

//get audit logs by task id
export const getAuditLogsByTaskId = async (req, res) => {
    try {
        const auditLogs = await AuditLog.find({ task: req.params.taskId });
        res.status(200).json(auditLogs);
        if(auditLogs.length === 0) {
            return res.status(404).json({ message: "No audit logs found for this task" });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error getting audit logs by task id" });
    }
}


