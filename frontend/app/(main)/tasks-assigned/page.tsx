"use client";
import { useEffect, useState } from "react";
import { Calendar, Filter, ChevronDown, ChevronUp, Search, Loader2, X, Edit, CheckCircle, Edit2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import UpdateTaskModal from "../__compoents/Updatetask";

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: string | null;
  status: string;
  priority: string;
  dueDate: string;
  recurring: boolean;
}

export default function TaskAssignmentPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    status: "todo",
    recurring: false,
    assignedTo: "",
    createdBy: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await axios.get("http://localhost:5000/api/tasks/assign", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const fetchedTasks = Array.isArray(response.data) ? response.data : [];
      setTasks(fetchedTasks);

      if (fetchedTasks.length === 0) {
        setError("No tasks created by you.");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const titleMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const assigneeMatch = (task.assignedTo || "").toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === "All" || task.status === statusFilter.toLowerCase();
    return (titleMatch || assigneeMatch) && statusMatch;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = await getToken();
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${id}`,
        { status: newStatus.toLowerCase() },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setTasks(
        tasks.map((task) =>
          task._id === id ? { ...task, status: newStatus.toLowerCase() } : task
        )
      );
    } catch (error: any) {
      console.error("Error updating task status:", error);
    }
  };

  const handleEdit = (task: Task) => {
    // Convert API status format to modal format (if needed)
    const statusMapping: {[key: string]: string} = {
      "pending": "todo",
      "in progress": "in-progress",
      "completed": "done"
    };

    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate || "",
      priority: task.priority.toLowerCase() || "medium",
      status: statusMapping[task.status.toLowerCase()] || task.status.toLowerCase(),
      recurring: task.recurring || false,
      assignedTo: task.assignedTo || "",
      createdBy: "", // This field might need to be populated if used in your form
    });
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTask) return;
    
    setUpdateLoading(true);
    
    try {
      // Convert modal status format back to API format (if needed)
      const statusMapping: {[key: string]: string} = {
        "todo": "pending",
        "in-progress": "in progress",
        "done": "completed"
      };
      
      const updatedTaskData = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: statusMapping[formData.status] || formData.status,
        recurring: formData.recurring
      };
      
      const token = await getToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${editingTask._id}`,
        updatedTaskData,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      // Update the tasks list
      setTasks(
        tasks.map((task) =>
          task._id === editingTask._id 
            ? { ...task, ...updatedTaskData } 
            : task
        )
      );
      
      setShowModal(false);
      setEditingTask(null);
    } catch (error: any) {
      console.error("Error updating task:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/10 text-green-400 border border-green-500/30";
      case "in progress":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border border-gray-500/30";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-400 border border-red-500/30";
      case "medium":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/30";
      case "low":
        return "bg-green-500/10 text-green-400 border border-green-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Task Assignments</h1>
          <p className="text-gray-400 mt-1">Manage and review tasks assigned to you</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by title or assignee..."
                className="w-full pl-10 pr-10 py-2 text-sm rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Link href="/create-task">
              <button
                className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-[#6556cd] text-white hover:bg-[#4e45a5] transition-all shadow-md"
              >
                <span className="mr-1 text-lg">+</span> Add New Task
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-3" />
              <p className="text-gray-400">Loading tasks...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-red-800/20 rounded-full p-3 mb-4">
                <X className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-red-400 mb-2">{error}</p>
              <button
                onClick={fetchTasks}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <ul className="divide-y divide-gray-700">
              {filteredTasks.length === 0 ? (
                <li className="p-4 text-center text-gray-400">No tasks available</li>
              ) : (
                filteredTasks.map((task) => (
                  <li key={task._id} className="p-4 hover:bg-gray-700/40 transition-colors">
                    <div className="grid grid-cols-12 gap-2 md:items-center">
                      <div className="col-span-12 md:col-span-5">
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        <p className="text-sm text-gray-400">{task.assignedTo || "Not Assigned"}</p>
                      </div>

                      <div className="col-span-6 md:col-span-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </div>

                      <div className="col-span-6 md:col-span-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>

                      <div className="col-span-12 md:col-span-2 flex gap-2 md:justify-end">
                        <button
                          onClick={() => handleEdit(task)}
                          className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                          title="Edit task"
                        >
                          <Edit2 size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(task._id, "Completed")}
                          className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                          title="Mark as completed"
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>

      {/* UpdateTaskModal integration */}
      {showModal && (
        <UpdateTaskModal
          showModal={showModal}
          setShowModal={setShowModal}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={updateLoading}
          isEditing={true}
        />
      )}
    </div>
  );
}