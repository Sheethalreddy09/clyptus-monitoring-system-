import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  BarChart3,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { MemberDashboardData, Task, TaskStatus } from '../types';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskCommentsModal } from '../components/tasks/TaskCommentsModal';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const DashboardMember: React.FC = () => {
  const [data, setData] = useState<MemberDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState<Task | null>(null);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const res = await api.get<MemberDashboardData>('/api/v1/analytics/member-dashboard');
      setData(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await api.patch(`/api/v1/tasks/${taskId}/status?status=${newStatus}`);
      fetchDashboardData();
    } catch (err) {
      // silent
    }
  };

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{data?.welcome_message || 'Welcome back!'}</h2>
          <p className="text-xs text-blue-100 mt-1">
            Track your assigned work, update task status, and collaborate with your team.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/my-tasks')}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          My Task List
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Tasks"
          value={data?.assigned_tasks_count || 0}
          icon={<ListTodo className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Completed Tasks"
          value={data?.completed_tasks_count || 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="In-Progress"
          value={data?.in_progress_tasks_count || 0}
          subtitle={`${data?.pending_tasks_count || 0} pending`}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Notifications"
          value={data?.unread_notifications_count || 0}
          subtitle="Unread notifications"
          icon={<Bell className="w-5 h-5" />}
          color="indigo"
        />
      </div>

      {/* Personal Progress Gauge */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Personal Progress Percentage</h3>
          </div>
          {data?.assigned_tasks_count === 0 ? (
            <span className="text-xs font-semibold text-slate-400">No tasks yet</span>
          ) : (
            <span className="text-base font-extrabold text-emerald-600">
              {data?.personal_progress || 0}%
            </span>
          )}
        </div>
        <ProgressBar progress={data?.personal_progress || 0} showLabel={false} size="lg" />
      </div>

      {/* Main Grid: Today's Tasks & Upcoming Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Active Tasks</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/my-tasks')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              View All
            </Button>
          </div>

          {!data?.todays_tasks || data.todays_tasks.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              title="All caught up!"
              description="You have no pending tasks assigned right now."
            />
          ) : (
            <div className="space-y-3">
              {data.todays_tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onOpenComments={(t) => setSelectedTaskForComments(t)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h3>

          {!data?.upcoming_deadlines || data.upcoming_deadlines.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-6 h-6" />}
              title="No upcoming deadlines"
              description="No tasks assigned to you have upcoming deadlines."
            />
          ) : (
            <div className="space-y-3">
              {data.upcoming_deadlines.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onOpenComments={(t) => setSelectedTaskForComments(t)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Comments Modal */}
      <TaskCommentsModal
        isOpen={!!selectedTaskForComments}
        onClose={() => setSelectedTaskForComments(null)}
        task={selectedTaskForComments}
      />
    </div>
  );
};
