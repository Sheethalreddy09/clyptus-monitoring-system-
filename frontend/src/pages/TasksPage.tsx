import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { Task, Project, User, TaskStatus, TaskPriority } from '../types';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskTable } from '../components/tasks/TaskTable';
import { TaskModal } from '../components/tasks/TaskModal';
import { TaskCommentsModal } from '../components/tasks/TaskCommentsModal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState<Task | null>(null);

  const { user } = useAuth();
  const isLead = user?.role === 'TEAM_LEAD';

  const fetchInitialData = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        api.get<Project[]>('/api/v1/projects'),
        api.get<User[]>('/api/v1/users'),
      ]);
      setProjects(projRes.data);
      setMembers(userRes.data);
    } catch (err) {
      // silent
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (projectId) params.append('project_id', projectId);
      if (assignedTo) params.append('assigned_to', assignedTo);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const res = await api.get<Task[]>(`/api/v1/tasks?${params.toString()}`);
      setTasks(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [search, projectId, assignedTo, statusFilter, priorityFilter]);

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await api.patch(`/api/v1/tasks/${taskId}/status?status=${newStatus}`);
      fetchTasks();
    } catch (err) {
      // silent
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/api/v1/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Task Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, assign, and manage all tasks across your organization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'board' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Table</span>
            </button>
          </div>

          {isLead && (
            <Button
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Create Task
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
            />
          </div>

          <Select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={[
              { value: '', label: 'All Projects' },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />

          <Select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            options={[
              { value: '', label: 'All Members' },
              ...members.map((m) => ({ value: m.id, label: m.name })),
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'TODO', label: 'TODO' },
              { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
              { value: 'REVIEW', label: 'REVIEW' },
              { value: 'COMPLETED', label: 'COMPLETED' },
            ]}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: '', label: 'All Priorities' },
              { value: 'LOW', label: 'LOW' },
              { value: 'MEDIUM', label: 'MEDIUM' },
              { value: 'HIGH', label: 'HIGH' },
            ]}
          />
        </div>
      </div>

      {/* Task Content Area */}
      {loading ? (
        <LoadingSpinner message="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-8 h-8 text-blue-500" />}
          title="No tasks available"
          description="No tasks match the active filters or database is currently empty."
          action={
            isLead ? (
              <Button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                icon={<Plus className="w-4 h-4" />}
              >
                Create Task
              </Button>
            ) : undefined
          }
        />
      ) : viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onOpenComments={(t) => setSelectedTaskForComments(t)}
              onEditTask={(t) => {
                setTaskToEdit(t);
                setIsTaskModalOpen(true);
              }}
              isLead={isLead}
            />
          ))}
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onOpenComments={(t) => setSelectedTaskForComments(t)}
          onEditTask={(t) => {
            setTaskToEdit(t);
            setIsTaskModalOpen(true);
          }}
          onDeleteTask={handleDeleteTask}
          isLead={isLead}
        />
      )}

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchTasks}
        taskToEdit={taskToEdit}
      />

      <TaskCommentsModal
        isOpen={!!selectedTaskForComments}
        onClose={() => setSelectedTaskForComments(null)}
        task={selectedTaskForComments}
      />
    </div>
  );
};
