"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  UserCircle,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";

const TaskForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();

  // Fetch users' emails
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUsers(response.data); // Assuming the response contains an array of users
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (user && user.emailAddresses?.length > 0) {
      setCreatedBy(user.emailAddresses[0].emailAddress);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError("Title is required");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    const formData = {
      title,
      description,
      dueDate,
      priority,
      assignedTo,
      createdBy,
    };

    try {
      const token = await getToken();

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success("Task created successfully!");
      setFormSuccess("Task created successfully!");
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("");
      setAssignedTo("");
    } catch (error) {
      setFormError("There was an error creating the task. Please try again.");
      toast.error("There was an error creating the task. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0a0a0c] p-8 rounded-3xl shadow-lg max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Create New Task</h1>
        <p className="text-[#a1a1aa]">Fill in the details to create a new task</p>
      </div>

      {formError && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg mb-6 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="bg-green-900/30 border border-green-500 text-green-200 p-4 rounded-lg mb-6 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {formSuccess}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white border-b border-[#1f1f1f] pb-2">
            Task Information
          </h2>

          <div>
            <Label htmlFor="title" className="text-white">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              className="mt-1 bg-[#09090b] border-[#1f1f1f] text-white placeholder:text-[#a1a1aa]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the task details..."
              className="mt-1 bg-[#09090b] border-[#1f1f1f] text-white placeholder:text-[#a1a1aa] min-h-32"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white border-b border-[#1f1f1f] pb-2">
            Task Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate" className="text-white flex items-center">
                <Calendar className="h-4 w-4 mr-2" /> Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                className="mt-1 bg-[#09090b] border-[#1f1f1f] text-white"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="priority" className="text-white flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" /> Priority
              </Label>
              <Select onValueChange={(value) => setPriority(value)} value={priority}>
                <SelectTrigger className="mt-1 bg-[#09090b] border-[#1f1f1f] text-white">
                  <SelectValue placeholder="Select priority" className="text-[#a1a1aa]" />
                </SelectTrigger>
                <SelectContent className="bg-[#09090b] border-[#1f1f1f] text-white">
                  <SelectItem value="low" className="text-green-400">Low</SelectItem>
                  <SelectItem value="medium" className="text-yellow-400">Medium</SelectItem>
                  <SelectItem value="high" className="text-red-400">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assignedTo" className="text-white flex items-center">
              <UserCircle className="h-4 w-4 mr-2" /> Assigned To
            </Label>
            <Select
              onValueChange={(value) => setAssignedTo(value)}
              value={assignedTo}
            >
              <SelectTrigger className="mt-1 bg-[#09090b] border-[#1f1f1f] text-white">
                <SelectValue placeholder="Select a user" className="text-[#a1a1aa]" />
              </SelectTrigger>
              <SelectContent className="bg-[#09090b] border-[#1f1f1f] text-white">
                {users.map((user: any,index:number) => (
                  <SelectItem key={index} value={user.email} className="text-[#a1a1aa]">
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {createdBy && (
            <div className="mt-4 p-3 bg-[#1f1f1f] rounded-lg">
              <p className="text-[#a1a1aa] text-sm">
                Creating task as: <span className="text-white font-medium">{createdBy}</span>
              </p>
            </div>
          )}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Clock className="animate-spin h-4 w-4 mr-2" />
                Submitting...
              </span>
            ) : (
              "Create Task"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
