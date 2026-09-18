import React, { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle2, Clock, Filter } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskTable } from '../components/tasks/TaskTable';
import { TaskCommentsModal } from '../components/tasks/TaskCommentsModal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Select } from '../components/common/Select';
import api from '../services/api';

export const MyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTaskForComments, setSelectedTaskForComments] = useState<Task | null>(null);

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      let url = '/api/v1/tasks?mine_only=true';
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get<Task[]>(url);
      setTasks(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [statusFilter]);

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await api.patch(`/api/v1/tasks/${taskId}/status?status=${newStatus}`);
      fetchMyTasks();
    } catch (err) {
      // silent
    }
  };

  if (loading) return <LoadingSpinner message="Loading your assigned tasks..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Tasks</h2>
          <p className="text-xs text-slate-500 mt-1">
            View your personal todo list, update task status, add comments, and complete assignments.
          </p>
        </div>

        <div className="w-48">
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
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-8 h-8 text-blue-500" />}
          title="No tasks assigned yet"
          description="You currently have no tasks assigned in the system. Tasks assigned by your Team Lead will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onOpenComments={(t) => setSelectedTaskForComments(t)}
            />
          ))}
        </div>
      )}

      <TaskCommentsModal
        isOpen={!!selectedTaskForComments}
        onClose={() => setSelectedTaskForComments(null)}
        task={selectedTaskForComments}
      />
    </div>
  );
};
