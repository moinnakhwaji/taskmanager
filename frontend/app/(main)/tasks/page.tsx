"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { 
  Edit2, 
  Trash2, 
  PlusCircle, 
  Filter, 
  ArrowUp, 
  ArrowDown, 
  Search,
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  Loader,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import UpdateTaskModal from "../__compoents/Updatetask";

// Define Task interface
interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  createdAt?: string;
  priority?: string;
  status?: string;
  recurring?: boolean;
  userId?: string;
}

const TasksPage: React.FC = () => {
  const { getToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state variables for enhanced functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "title" | "createdAt">("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [createTaskModal, setCreateTaskModal] = useState(false);
  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    status: "todo",
    recurring: false
  });

  // Function to fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data || []);
    } catch (error: any) {
      console.error("Error fetching tasks:", error.response?.data || error.message);
      setError("Failed to load tasks. Please try again or create a task first");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Apply filters, search, and sorting
  useEffect(() => {
    let result = [...tasks];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title?.toLowerCase().includes(query) || 
        task.description?.toLowerCase().includes(query)
      );
    }
    
    
    // yaha status se kiye hai
    if (filterStatus !== "all") {
      result = result.filter(task => task.status?.toLowerCase() === filterStatus);
    }
    
    // Apply priority filter
    // yaha prority se kiye hai
    if (filterPriority !== "all") {
      result = result.filter(task => task.priority?.toLowerCase() === filterPriority);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "dueDate" || sortBy === "createdAt") {
        const dateA = a[sortBy] ? new Date(a[sortBy]!).getTime() : 0;
        const dateB = b[sortBy] ? new Date(b[sortBy]!).getTime() : 0;
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const valueA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const valueB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      } else {
        const valueA = a[sortBy] || "";
        const valueB = b[sortBy] || "";
        return sortOrder === "asc" 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
    });
    // yaha sort kiye hai
    setFilteredTasks(result);
  }, [tasks, searchQuery, filterStatus, filterPriority, sortBy, sortOrder]);

  // Handle edit for existing task
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  // Handle delete task
  const handleDelete = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    setLoading(true);
    try {
      const token = await getToken();
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      setError(null);
    } catch (error: any) {
      console.error("Delete failed:", error);
      setError("Failed to delete task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes for editing tasks
  const handleChange = (e: React.ChangeEvent<any>) => {
    if (!editingTask) return;
    const { name, value, type, checked } = e.target;
    setEditingTask((prev) =>
      prev ? { ...prev, [name]: type === "checkbox" ? checked : value } : prev
    );
  };

  // Handle new task form changes
  const handleNewTaskChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;
    setNewTaskData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Submit handler for updating task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${editingTask._id}`,
        editingTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) =>
        prev.map((t) => (t._id === editingTask._id ? response.data : t))
      );
      setShowModal(false);
      setEditingTask(null);
      setError(null);
    } catch (error: any) {
      console.error("Update failed:", error);
      setError("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit handler for creating new task
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
        newTaskData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) => [...prev, response.data]);
      setCreateTaskModal(false);
      setNewTaskData({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        status: "todo",
        recurring: false
      });
      setError(null);
    } catch (error: any) {
      console.error("Create failed:", error);
      setError("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle status quick update
  const handleStatusChange = async (task: Task, newStatus: string) => {
    setLoading(true);
    try {
      const token = await getToken();
      const updatedTask = { ...task, status: newStatus };
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${task._id}`,
        updatedTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? response.data : t))
      );
      setError(null);
    } catch (error: any) {
      console.error("Status update failed:", error);
      setError("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle sort direction
  const handleSortChange = (column: "dueDate" | "priority" | "title" | "createdAt") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const priorityColors: Record<string, string> = {
    high: "bg-red-900 text-red-300",
    medium: "bg-yellow-900 text-yellow-300",
    low: "bg-green-900 text-green-300",
  };

  const statusColors: Record<string, string> = {
    todo: "bg-blue-900 text-blue-300",
    "in-progress": "bg-yellow-900 text-yellow-300",
    done: "bg-green-900 text-green-300",
  };

  const priorityIcons = {
    high: <AlertCircle size={16} className="text-red-400" />,
    medium: <Clock size={16} className="text-yellow-400" />,
    low: <CheckCircle size={16} className="text-green-400" />
  };

  const statusIcons = {
    todo: <XCircle size={16} className="text-blue-400" />,
    "in-progress": <Clock size={16} className="text-yellow-400" />,
    done: <CheckCircle size={16} className="text-green-400" />
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with title and add button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Task Manager</h1>
          <button
            onClick={() => setCreateTaskModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <PlusCircle size={20} />
            Add New Task
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Search, filter and sort controls */}
        <div className="mb-6 bg-[#0a0a0c] border border-gray-800 p-4 rounded-lg shadow-lg">
          <div className="flex flex-col space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#09090b] border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Filter size={16} className="text-blue-400" />
                <span className="text-gray-300">Filter by:</span>
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#09090b] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-[#09090b] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#09090b] border border-gray-800 rounded px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                  <option value="createdAt">Created</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3 py-2 bg-[#09090b] border border-gray-800 rounded hover:bg-gray-800 transition-colors"
                >
                  {sortOrder === "asc" ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading state */}
        {loading && tasks.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center">
              <Loader size={40} className="text-blue-500 animate-spin mb-4" />
              <p className="text-[#a1a1aa]">Loading your tasks...</p>
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {!loading && filteredTasks.length === 0 && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center bg-[#0a0a0c] border border-gray-800 rounded-lg p-8 max-w-md">
              {tasks.length === 0 ? (
                <>
                  <div className="bg-blue-900/30 p-4 rounded-full inline-flex mb-4">
                    <PlusCircle size={40} className="text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">No tasks found</h2>
                  <p className="text-[#a1a1aa] mb-6">You haven't created any tasks yet. Get started by adding your first task!</p>
                </>
              ) : (
                <>
                  <div className="bg-yellow-900/30 p-4 rounded-full inline-flex mb-4">
                    <Filter size={40} className="text-yellow-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">No matching tasks</h2>
                  <p className="text-[#a1a1aa] mb-6">No tasks match your current search or filters.</p>
                </>
              )}
              <button
                onClick={() => setCreateTaskModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg mx-auto transition-colors"
              >
                <PlusCircle size={20} />
                {tasks.length === 0 ? "Create First Task" : "Create New Task"}
              </button>
            </div>
          </div>
        )}
        
        {/* Task grid */}
        {filteredTasks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="bg-[#0a0a0c] border border-gray-800 rounded-lg p-4 shadow-lg transition-all duration-200 hover:shadow-xl hover:border-gray-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold line-clamp-1">{task.title || "Untitled Task"}</h2>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                      title="Edit task"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="p-1.5 rounded-full bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-red-300 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="text-[#a1a1aa] mb-4 line-clamp-3 min-h-[3rem]">
                  {task.description || "No description provided."}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {task.priority && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${priorityColors[task.priority.toLowerCase()] || "bg-gray-700"}`}>
                      {priorityIcons[task.priority.toLowerCase() as keyof typeof priorityIcons]}
                      {task.priority}
                    </div>
                  )}
                  
                  {task.recurring && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-purple-900 text-purple-300">
                      <RefreshCw size={16} className="text-purple-400" />
                      Recurring
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => handleStatusChange(task, "todo")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
                      task.status === "todo" 
                        ? statusColors.todo 
                        : "bg-gray-800 text-gray-400 hover:bg-blue-900/50 hover:text-blue-300"
                    }`}
                  >
                    <XCircle size={16} />
                    To Do
                  </button>
                  
                  <button
                    onClick={() => handleStatusChange(task, "in-progress")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
                      task.status === "in-progress" 
                        ? statusColors["in-progress"] 
                        : "bg-gray-800 text-gray-400 hover:bg-yellow-900/50 hover:text-yellow-300"
                    }`}
                  >
                    <Clock size={16} />
                    In Progress
                  </button>
                  
                  <button
                    onClick={() => handleStatusChange(task, "done")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
                      task.status === "done" 
                        ? statusColors.done 
                        : "bg-gray-800 text-gray-400 hover:bg-green-900/50 hover:text-green-300"
                    }`}
                  >
                    <CheckCircle size={16} />
                    Done
                  </button>
                </div>
                
                <div className="flex justify-between items-center text-xs text-[#a1a1aa] pt-2 border-t border-gray-800">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                  </div>
                  <div>
                    Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Edit Task Modal */}
        {editingTask && (
          <UpdateTaskModal
            showModal={showModal}
            setShowModal={setShowModal}
            formData={editingTask as any}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            loading={loading}
            isEditing={true}
          />
        )}
        
        {/* Create Task Modal */}
        {createTaskModal && (
          <UpdateTaskModal
            showModal={createTaskModal}
            setShowModal={setCreateTaskModal}
            formData={newTaskData as any}
            handleChange={handleNewTaskChange}
            handleSubmit={handleCreateSubmit}
            loading={loading}
            isEditing={false}
          />
        )}
      </div>
    </div>
  );
};

export default TasksPage;