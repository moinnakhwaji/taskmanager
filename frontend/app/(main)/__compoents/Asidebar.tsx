"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Plus,
  Calendar,
  List,
  FileText,
  Bell,
  UserCircle,
  ClipboardList,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const getLinkClasses = (path: string) =>
    `flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${
      isActive(path)
        ? "bg-white text-black"
        : "text-gray-300 hover:text-white hover:bg-gray-800"
    }`;

  return (
    <Sidebar className="!bg-black border-r border-gray-800 min-h-screen w-56 flex flex-col">
      <SidebarHeader className="!bg-black border-b border-gray-800 px-4 py-3">
        <h2 className="text-xl font-bold text-white">BlackNova</h2>
      </SidebarHeader>

      <SidebarContent className="!bg-black flex-1 px-3 py-4 space-y-1">
        {/* Dashboard */}
        <Link href="/dashboard" className={getLinkClasses("/dashboard")}>
          <LayoutDashboard size={18} className="text-inherit" />
          Dashboard
        </Link>

        {/* Create Task */}
        <Link href="/create-task" className={getLinkClasses("/create-task")}>
          <Plus size={18} className="text-inherit" />
          Create Task
        </Link>

        {/* Section: Task Management */}
        <div className="mt-2 mb-1 px-3 py-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Task Management
          </p>
        </div>

        {/* Assigned Tasks */}
        <Link href="/tasks-assigned" className={getLinkClasses("/tasks-assigned")}>
          <ClipboardList size={18} className="text-inherit" />
          Assigned Tasks
        </Link>

        {/* All Tasks */}
        <Link href="/tasks" className={getLinkClasses("/tasks")}>
          <List size={18} className="text-inherit" />
          All Tasks
        </Link>

        {/* Section: System */}
        <div className="mt-2 mb-1 px-3 py-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            System
          </p>
        </div>

        {/* Audit Logs */}
        <Link href="/audit-logs" className={getLinkClasses("/audit-logs")}>
          <FileText size={18} className="text-inherit" />
          Audit Logs
        </Link>

        {/* Notifications */}
        <Link href="/notifications" className={getLinkClasses("/notifications")}>
          <Bell size={18} className="text-inherit" />
          Notifications
        </Link>

        {/* Section: Account */}
        <div className="mt-2 mb-1 px-3 py-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Account
          </p>
        </div>

   
      </SidebarContent>

      <SidebarFooter className="!bg-black border-t border-gray-800 px-4 py-3 flex items-center">
        <UserButton />
        <div className="ml-3">
          <p className="text-xs text-gray-400">Your Account</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
