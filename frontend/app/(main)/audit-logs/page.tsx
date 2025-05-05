"use client";
import { useEffect, useState } from "react";
import { Search, Filter, Calendar, ArrowDownUp, Loader2, X, Download, RefreshCw, User, FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

// Updated interface to match your actual API response
interface AuditLog {
  _id: string;
  action: string;
  user: string;  // This is the userId reference
  description: string;
  task?: string;  // The entity ID (may be task ID or other entity types)
  timestamp: string;
  entityType?: string; // We'll derive this from the data
  userName?: string;   // We'll derive this or use placeholder
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: ""
  });
  const [filters, setFilters] = useState({
    action: "all",
    entityType: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "timestamp",
    direction: "desc"
  });
  
  const { getToken } = useAuth();

  // Actions and entity types for filtering - keep these the same
  const actionTypes = ["all", "create", "update", "delete", "login", "logout", "assign"];
  const entityTypes = ["all", "task", "user", "project", "setting"];

  // Process log data to fit the expected format
  const processLogs = (logs: any[]) => {
    return logs.map(log => {
      // Determine entity type from description or other fields
      let entityType = "unknown";
      let entityId = "";
      
      if (log.task) {
        entityType = "task";
        entityId = log.task;
      } else if (log.description && log.description.toLowerCase().includes("task")) {
        entityType = "task";
      } else if (log.description && log.description.toLowerCase().includes("user")) {
        entityType = "user";
      } else if (log.description && log.description.toLowerCase().includes("project")) {
        entityType = "project";
      }
      
      // Extract username if available in description
      let userName = "Unknown User";
      if (log.description) {
        const emailMatch = log.description.match(/by\s+([^\s]+@[^\s]+)/);
        if (emailMatch && emailMatch[1]) {
          userName = emailMatch[1];
        }
      }
      
      return {
        ...log,
        entityType,
        entityId: entityId || log.task || "unknown",
        userName
      };
    });
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/audit`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      // Process the logs to fit our component's expected format
      const processedLogs = processLogs(response.data);
      
      // Sort by timestamp descending by default
      const sortedLogs = Array.isArray(processedLogs) 
        ? processedLogs.sort((a: AuditLog, b: AuditLog) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        : [];
      
      setLogs(sortedLogs);
      setFilteredLogs(sortedLogs);
      
      if (sortedLogs.length === 0) {
        setError("No audit logs available.");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load audit logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs on component mount
  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...logs];
    
    // Apply action filter
    if (filters.action !== "all") {
      result = result.filter(log => log.action.toLowerCase() === filters.action.toLowerCase());
    }
    
    // Apply entity type filter
    if (filters.entityType !== "all") {
      result = result.filter(log => log.entityType?.toLowerCase() === filters.entityType.toLowerCase());
    }
    
    // Apply date range filter
    if (dateRange.from) {
      result = result.filter(log => new Date(log.timestamp) >= new Date(dateRange.from));
    }
    
    if (dateRange.to) {
      // Add one day to include the end date fully
      const endDate = new Date(dateRange.to);
      endDate.setDate(endDate.getDate() + 1);
      result = result.filter(log => new Date(log.timestamp) < endDate);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log => 
        (log.userName && log.userName.toLowerCase().includes(query)) ||
        log.action.toLowerCase().includes(query) ||
        (log.entityType && log.entityType.toLowerCase().includes(query)) ||
        (log.description && log.description.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === "timestamp") {
        return sortConfig.direction === "asc"
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      
      if (sortConfig.key === "action") {
        return sortConfig.direction === "asc"
          ? a.action.localeCompare(b.action)
          : b.action.localeCompare(a.action);
      }
      
      if (sortConfig.key === "user") {
        return sortConfig.direction === "asc"
          ? (a.userName || "").localeCompare(b.userName || "")
          : (b.userName || "").localeCompare(a.userName || "");
      }
      
      return 0;
    });
    
    setFilteredLogs(result);
  }, [logs, filters, searchQuery, dateRange, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc"
    }));
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateRange({ from: "", to: "" });
    setFilters({ action: "all", entityType: "all" });
  };

  const exportLogs = () => {
    // Create a CSV string from the filtered logs
    const headers = ["Timestamp", "Action", "Entity Type", "Entity ID", "User", "Description"];
    const csvData = [
      headers.join(","),
      ...filteredLogs.map(log => {
        return [
          new Date(log.timestamp).toLocaleString(),
          log.action,
          log.entityType || "unknown",
          log.task || "N/A",
          log.userName || "Unknown User",
          `"${log.description?.replace(/"/g, '""') || ""}"`
        ].join(",");
      })
    ].join("\n");
    
    // Create a download link and trigger it
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `audit-logs-${new Date().toISOString().split("T")[0]}.csv`);
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return <FileText size={16} className="text-emerald-400" />;
      case "update":
        return <RefreshCw size={16} className="text-blue-400" />;
      case "delete":
        return <X size={16} className="text-red-400" />;
      case "login":
        return <User size={16} className="text-purple-400" />;
      case "logout":
        return <User size={16} className="text-gray-400" />;
      case "assign":
        return <CheckCircle size={16} className="text-yellow-400" />;
      case "complete":
        return <CheckCircle size={16} className="text-green-400" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "update":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "delete":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "login":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "logout":
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
      case "assign":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "complete":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Audit Logs</h1>
          <p className="text-gray-400 mt-1">Track all system activities and changes</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search logs..."
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

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-all shadow-md border border-gray-700"
              >
                <Filter size={16} className="mr-2" />
                Filters
              </button>
              
              <button
                onClick={exportLogs}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-all shadow-md border border-gray-700"
                title="Export logs as CSV"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
              
              <button
                onClick={fetchAuditLogs}
                className="inline-flex items-center justify-center p-2 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-all shadow-md border border-gray-700"
                title="Refresh logs"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-900/80 border border-gray-700 rounded-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <label htmlFor="action" className="text-sm font-medium text-gray-300">
                    Action Type
                  </label>
                  <select
                    id="action"
                    name="action"
                    value={filters.action}
                    onChange={handleFilterChange}
                    className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {actionTypes.map(action => (
                      <option key={action} value={action}>
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-2 flex-1">
                  <label htmlFor="entityType" className="text-sm font-medium text-gray-300">
                    Entity Type
                  </label>
                  <select
                    id="entityType"
                    name="entityType"
                    value={filters.entityType}
                    onChange={handleFilterChange}
                    className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {entityTypes.map(entity => (
                      <option key={entity} value={entity}>
                        {entity.charAt(0).toUpperCase() + entity.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-2 flex-1">
                  <label htmlFor="dateFrom" className="text-sm font-medium text-gray-300">
                    From Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      id="dateFrom"
                      name="from"
                      value={dateRange.from}
                      onChange={handleDateRangeChange}
                      className="w-full pl-10 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 flex-1">
                  <label htmlFor="dateTo" className="text-sm font-medium text-gray-300">
                    To Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      id="dateTo"
                      name="to"
                      value={dateRange.to}
                      onChange={handleDateRangeChange}
                      className="w-full pl-10 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm bg-gray-800 text-gray-300 hover:text-white rounded-md border border-gray-700 hover:bg-gray-700 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-3" />
              <p className="text-gray-400">Loading audit logs...</p>
            </div>
          )}

          {error && !loading && filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-red-800/20 rounded-full p-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-yellow-400 mb-2">{error}</p>
              <button
                onClick={fetchAuditLogs}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && filteredLogs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/70">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort("timestamp")}
                    >
                      <div className="flex items-center">
                        Timestamp
                        {sortConfig.key === "timestamp" && (
                          <ArrowDownUp size={14} className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort("action")}
                    >
                      <div className="flex items-center">
                        Action
                        {sortConfig.key === "action" && (
                          <ArrowDownUp size={14} className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Entity
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort("user")}
                    >
                      <div className="flex items-center">
                        User
                        {sortConfig.key === "user" && (
                          <ArrowDownUp size={14} className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/20 divide-y divide-gray-700">
                  {filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {log.timestamp ? formatTimestamp(log.timestamp) : "—"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {getActionIcon(log.action)}
                            {log.action?.charAt(0).toUpperCase() + log.action?.slice(1)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div>
                          <span className="font-medium text-gray-200">
                            {log.entityType ? log.entityType.charAt(0).toUpperCase() + log.entityType.slice(1) : "Unknown"}
                          </span>
                          <span className="block text-xs text-gray-400 mt-0.5">
                            ID: {log.task ? log.task.slice(0, 8) + "..." : "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center">
                          <div className="h-7 w-7 rounded-full bg-purple-800/30 flex items-center justify-center mr-2 text-purple-300 font-bold text-xs">
                            {log.userName ? log.userName.charAt(0).toUpperCase() : "?"}
                          </div>
                          <span>{log.userName || "Unknown User"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                        {log.description || "No details provided"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && filteredLogs.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-gray-800/50 rounded-full p-3 mb-4">
                <Search className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-400 mb-2">No logs match your filters</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}