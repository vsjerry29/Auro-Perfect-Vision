"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
  ExternalLink,
} from "lucide-react";
import { CrmTask, TaskPriority, TaskStatus } from "@/lib/types/crm";

export default function CrmTasksPage() {
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterTab, setFilterTab] = useState<"all" | "today" | "overdue" | "upcoming" | "completed">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // New Task Modal
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState<{
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    clientName: string;
  }>({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium",
    clientName: "",
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/crm/tasks");
      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err: any) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTask = async (id: string) => {
    try {
      const res = await fetch("/api/admin/crm/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "toggle" }),
      });
      if (!res.ok) throw new Error("Failed to toggle task");
      await fetchTasks();
    } catch (err: any) {
      alert(err.message || "Failed to toggle task");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/crm/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTaskForm,
          status: "pending",
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");
      setShowModal(false);
      setNewTaskForm({
        title: "",
        description: "",
        dueDate: new Date().toISOString().split("T")[0],
        priority: "medium",
        clientName: "",
      });
      await fetchTasks();
    } catch (err: any) {
      alert(err.message || "Could not save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredTasks = tasks.filter((t) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchClient = t.clientName?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchClient && !matchDesc) return false;
    }

    if (filterTab === "completed") return t.status === "completed";
    if (t.status === "completed") return false; // Other tabs show pending

    if (filterTab === "today") return t.dueDate === todayStr;
    if (filterTab === "overdue") return t.dueDate < todayStr;
    if (filterTab === "upcoming") return t.dueDate > todayStr;
    return true;
  });

  const counts = {
    all: tasks.filter((t) => t.status === "pending").length,
    today: tasks.filter((t) => t.status === "pending" && t.dueDate === todayStr).length,
    overdue: tasks.filter((t) => t.status === "pending" && t.dueDate < todayStr).length,
    upcoming: tasks.filter((t) => t.status === "pending" && t.dueDate > todayStr).length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ink-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-gold-dark uppercase tracking-wider">
              Auro Perfect Vision CRM
            </span>
            <span className="text-xs text-ink-muted">•</span>
            <span className="text-xs font-sans text-plum font-medium">Operations</span>
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-ink">
            Follow-up Tasks Queue
          </h1>
          <p className="text-xs font-sans text-ink-muted mt-0.5">
            Client follow-ups, intake form reviews, retreat prep, and administrative actions.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-plum text-white rounded-md text-xs font-sans hover:bg-plum-light transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> + Create Task
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Pending", count: counts.all },
            { id: "today", label: "Due Today", count: counts.today },
            { id: "overdue", label: "Overdue", count: counts.overdue, alert: counts.overdue > 0 },
            { id: "upcoming", label: "Upcoming", count: counts.upcoming },
            { id: "completed", label: "Completed", count: counts.completed },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                filterTab === tab.id
                  ? "bg-plum text-white"
                  : tab.alert
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-white border border-ink-border text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filterTab === tab.id ? "bg-white/20 text-white" : "bg-ink-border text-ink-muted"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks or clients..."
            className="w-full pl-9 pr-3 py-1.5 border border-ink-border rounded-lg text-xs font-sans bg-white focus:outline-none focus:border-plum"
          />
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-plum border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-ink-muted font-sans">Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink-border p-12 text-center">
          <CheckSquare className="w-10 h-10 text-ink-muted/40 mx-auto mb-3" />
          <h3 className="font-serif text-base font-medium text-ink mb-1">No Tasks in View</h3>
          <p className="text-xs font-sans text-ink-muted">
            {filterTab === "overdue"
              ? "Great job! There are no overdue tasks."
              : "No tasks found matching your active filter."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-ink-border divide-y divide-ink-border shadow-sm overflow-hidden">
          {filteredTasks.map((task) => {
            const isOverdue = task.status !== "completed" && task.dueDate < todayStr;
            const isToday = task.status !== "completed" && task.dueDate === todayStr;

            return (
              <div
                key={task.id}
                className={`p-4 flex items-start gap-3 transition-colors ${
                  task.status === "completed"
                    ? "bg-ivory/20"
                    : isOverdue
                    ? "bg-red-50/30 hover:bg-red-50/50"
                    : "hover:bg-ivory/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.status === "completed"}
                  onChange={() => handleToggleTask(task.id)}
                  className="mt-1 w-4 h-4 rounded text-plum border-ink-border focus:ring-plum cursor-pointer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-medium font-sans ${
                        task.status === "completed" ? "line-through text-ink-muted" : "text-ink"
                      }`}
                    >
                      {task.title}
                    </span>

                    <span
                      className={`text-[10px] font-sans uppercase font-medium px-1.5 py-0.2 rounded ${
                        task.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "high"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-ink-border/50 text-ink-muted"
                      }`}
                    >
                      {task.priority}
                    </span>

                    {task.clientName && (
                      <span className="text-[11px] text-plum font-sans flex items-center gap-1">
                        • {task.clientName}
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-ink-muted mt-2 pt-1 border-t border-ink-border/40">
                    <span
                      className={`flex items-center gap-1 font-mono ${
                        isOverdue
                          ? "text-red-700 font-semibold"
                          : isToday
                          ? "text-amber-700 font-semibold"
                          : ""
                      }`}
                    >
                      <Calendar className="w-3 h-3" /> Due: {task.dueDate}{" "}
                      {isOverdue && "(Overdue)"}
                      {isToday && "(Today)"}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> Assigned to: {task.assignedStaffName}
                    </span>
                    {task.clientContactId && (
                      <Link
                        href={`/admin/crm/clients/${task.clientContactId}`}
                        className="text-plum hover:underline flex items-center gap-1 ml-auto"
                      >
                        Open Client Profile <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: CREATE TASK ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-ink-border max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-border">
              <h3 className="font-serif text-lg font-medium text-ink">
                Create Action Task
              </h3>
              <button onClick={() => setShowModal(false)} className="text-ink-muted hover:text-ink text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-ink-muted mb-1 font-medium">Task Title</label>
                <input
                  type="text"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  placeholder="e.g. Call Marcus Vance regarding retreat intake form"
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Associated Client (Optional)</label>
                <input
                  type="text"
                  value={newTaskForm.clientName}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, clientName: e.target.value })}
                  placeholder="e.g. Marcus Vance or Priya Sundaram"
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Due Date</label>
                  <input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Priority</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e: any) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Description (Optional)</label>
                <textarea
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  rows={3}
                  placeholder="Notes, instructions or specific agenda..."
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ink-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-ink-border rounded text-ink hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTaskForm.title.trim()}
                  className="px-4 py-2 bg-plum text-white rounded hover:bg-plum-light disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
