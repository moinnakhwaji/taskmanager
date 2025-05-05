"use client";

import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarCheck,
  Users,
  ClipboardList,
  Repeat,
  PlusCircle,
  Info,
} from "lucide-react";

const DashboardPage = () => {
  const { user } = useUser();
  const cleanId = user?.id?.replace("user_", "");

  useEffect(() => {
    if (user) {
      const createUser = async () => {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`,
            {
              name: user.fullName,
              email: user.emailAddresses[0].emailAddress,
              role: "user",
              clerkUserId: cleanId,
            }
          );

          const message = response.data.message;

          if (message === "User already exists") {
            console.log("✅ User already exists:", response.data.user);
          } else if (message === "User created") {
            console.log("🎉 New user created:", response.data.user);
          } else {
            console.log("ℹ️ Response:", response.data);
          }
        } catch (error: any) {
          console.error(
            "❌ Unexpected error while creating user:",
            error.message
          );
        }
      };

      createUser();
    }
  }, [user]);

  const stats = [
    {
      title: "Open Tasks",
      value: "47",
      icon: <ClipboardList className="text-white" size={22} />,
    },
    {
      title: "Upcoming Deadlines",
      value: "12",
      icon: <CalendarCheck className="text-white" size={22} />,
    },
    {
      title: "Recurring Events",
      value: "5",
      icon: <Repeat className="text-white" size={22} />,
    },
    {
      title: "Active Users",
      value: "18",
      icon: <Users className="text-white" size={22} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0c] via-[#09090b] to-[#0f0f11] p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Welcome{user?.firstName && `, ${user.firstName}`}!</h1>

      <p className="text-gray-400 mb-8">
        Heres a quick overview of your dashboard. Use the stats below to get started, or create a new task!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((item, index) => (
          <Card
            key={index}
            className="bg-[#1f1e24] hover:bg-[#2a2932] transition-all duration-300 border border-[#2a2a2e] rounded-xl shadow-xl"
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{item.title}</p>
                <p className="text-2xl font-semibold mt-1">{item.value}</p>
              </div>
              {item.icon}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1f1e24] border border-[#2a2a2e] p-5 rounded-xl shadow-lg hover:shadow-2xl transition">
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Info size={24} className="text-[#6556cd]" />
              <h2 className="text-xl font-semibold">How to Get Started</h2>
            </div>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Click the <strong>Create Task</strong> button to start a new task.</li>
              <li>View scheduled or recurring tasks for planning.</li>
              <li>Invite more team members to collaborate.</li>
              <li>Check deadlines and progress regularly.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-[#1f1e24] border border-[#2a2a2e] p-5 rounded-xl shadow-lg flex items-center justify-center hover:bg-[#26252c] transition">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <PlusCircle size={36} className="text-[#6556cd]" />
            <h2 className="text-lg font-semibold">Create a New Task</h2>
            <p className="text-gray-400">Start organizing your work by adding a task now.</p>
            <button className="mt-2 px-4 py-2 bg-[#6556cd] text-white rounded-md hover:bg-[#7a6df1] transition">
              + New Task
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
