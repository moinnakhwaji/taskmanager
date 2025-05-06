"use client";
import React, { type ReactElement } from "react";
import { XCircle, Calendar, AlertCircle, CheckCircle, Clock, RefreshCw, Save } from "lucide-react";

// Define the valid types for priority and status
type Priority = "high" | "medium" | "low";
type Status = "todo" | "in-progress" | "done";

interface UpdateTaskProps {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: Priority; // Use the Priority type here
    status: Status;     // Use the Status type here
    recurring: boolean;
    assignedTo: string;
    createdBy: string;
  };
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  isEditing?: boolean;
}

const UpdateTaskModal = ({
  showModal,
  setShowModal,
  formData,
  handleChange,
  handleSubmit,
  loading,
  isEditing = true,
}: UpdateTaskProps) => {
  if (!showModal) return null;

  // Priority configuration with colors and icons
  const priorityConfig: Record<Priority, { color: string; bg: string; icon: ReactElement }> = {
    high: {
      color: "border-red-600 focus:ring-red-900",
      bg: "bg-red-600/20",
      icon: <AlertCircle size={18} className="text-red-500" />
    },
    medium: {
      color: "border-yellow-500 focus:ring-yellow-900",
      bg: "bg-yellow-500/20",
      icon: <Clock size={18} className="text-yellow-500" />
    },
    low: {
      color: "border-green-600 focus:ring-green-900",
      bg: "bg-green-600/20",
      icon: <CheckCircle size={18} className="text-green-500" />
    }
  };

  // Status configuration with colors and icons
  const statusConfig: Record<Status, { color: string; bg: string; icon: ReactElement }> = {
    todo: {
      color: "border-blue-600 focus:ring-blue-900",
      bg: "bg-blue-600/20",
      icon: <XCircle size={18} className="text-blue-500" />
    },
    "in-progress": {
      color: "border-yellow-500 focus:ring-yellow-900",
      bg: "bg-yellow-500/20",
      icon: <Clock size={18} className="text-yellow-500" />
    },
    done: {
      color: "border-green-600 focus:ring-green-900",
      bg: "bg-green-600/20",
      icon: <CheckCircle size={18} className="text-green-500" />
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="bg-[#0a0a0c] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#09090b] px-6 py-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isEditing ? (
              <>
                <div className="bg-blue-900/50 p-2 rounded-lg">
                  <Clock size={20} className="text-blue-400" />
                </div>
                Edit Task
              </>
            ) : (
              <>
                <div className="bg-green-900/50 p-2 rounded-lg">
                  <CheckCircle size={20} className="text-green-400" />
                </div>
                Create New Task
              </>
            )}
          </h2>
          
          <button
            onClick={() => setShowModal(false)}
            className="rounded-full p-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <XCircle size={20} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1 ml-1">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-[#09090b] border border-gray-800 text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1 ml-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Add details about this task..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-[#09090b] border border-gray-800 text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all resize-none"
              />
            </div>
            
            {/* Date & Priority - 2 column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Due Date */}
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1 ml-1">
                  Due Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="dueDate"
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full bg-[#09090b] border border-gray-800 text-white p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1 ml-1">
                  Priority
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    {/* @ts-ignore */}
                    {priorityConfig[formData.priority]?.icon || <AlertCircle size={18} className="text-gray-400" />}
                  </div>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className={`w-full bg-[#09090b] border ${priorityConfig[formData.priority]?.color || "border-gray-800"} text-white p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all appearance-none ${priorityConfig[formData.priority]?.bg || ""}`}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1 ml-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full bg-[#09090b] border ${statusConfig[formData.status]?.color || "border-gray-800"} text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all`}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Recurring */}
            <div className="flex items-center space-x-2">
              <input
                id="recurring"
                type="checkbox"
                name="recurring"
                checked={formData.recurring}
                onChange={handleChange}
                className="w-4 h-4 border border-gray-600 rounded-sm text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-300">
                Recurring
              </label>
            </div>

            {/* Assigned To */}
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-300 mb-1 ml-1">
                Assigned To
              </label>
              <input
                id="assignedTo"
                type="text"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full bg-[#09090b] border border-gray-800 text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Submit button */}
            <div className="mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all"
              >
                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTaskModal;
