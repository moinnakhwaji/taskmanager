"use client";
import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const API_NOTIFICATIONS_URL = `${API_BASE_URL}/api/notifications`;

interface Notification {
  _id: string;
  message: string;
  // add other fields if necessary
}

const NotificationsPage = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const socketConnection = io(API_BASE_URL, {
      withCredentials: true,
      auth: {
        token: async () => await getToken(),
      },
    });
    //@ts-ignore
    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;

    //@ts-ignore
    socket.emit("join", user.id);

    //@ts-ignore
    socket.on("notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      //@ts-ignore
      socket.off("notification");
    };
  }, [socket, user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.get(API_NOTIFICATIONS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      //@ts-ignore
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async () => {
    if (!newMessage.trim() || !selectedEmail) return;

    try {
      const token = await getToken();
      const { data } = await axios.post(
        API_NOTIFICATIONS_URL,
        {
          message: newMessage,
          email: selectedEmail,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewMessage("");
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = await getToken();
      await axios.delete(`${API_NOTIFICATIONS_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUsers();
    }
  }, [user]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-md shadow-lg max-w-xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Send Notification</h2>

      <div className="flex mb-4 space-x-2">
        <select
          value={selectedEmail}
          onChange={(e) => setSelectedEmail(e.target.value)}
          className="bg-gray-800 text-white px-2 py-2 rounded-md w-1/2"
        >
          <option value="">Select user</option>
          {users.map((u: any) => (
            <option key={u._id} value={u.email}>
              {u.email}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newMessage}
          onChange={(e: any) => setNewMessage(e.target.value)}
          placeholder="Message"
          className="flex-1 bg-gray-800 p-2 rounded-md text-white"
          onKeyDown={(e: any) => e.key === "Enter" && createNotification()}
        />
        <button
          onClick={createNotification}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md"
        >
          Send
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4">Your Notifications</h2>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-gray-400">No notifications</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n._id}
              className="bg-gray-800 p-3 rounded flex justify-between items-center"
            >
              <span>{n.message}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => deleteNotification(n._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
