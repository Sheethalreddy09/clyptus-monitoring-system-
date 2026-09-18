import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  ListTodo,
  Plus,
  ArrowRight,
  FolderKanban,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { LeadDashboardData, Task } from '../types';
import { TaskCard } from '../components/tasks/TaskCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { TaskModal } from '../components/tasks/TaskModal';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const DashboardLead: React.FC = () => {
  const [data, setData] = useState<LeadDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const res = await api.get<LeadDashboardData>('/api/v1/analytics/lead-dashboard');
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

  if (loading) return <LoadingSpinner message="Loading Team Lead Dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Team Lead Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">
            Overview of team progress, task completion metrics, and activity feeds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsProjectModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            New Project
          </Button>
          <Button
            size="sm"
            onClick={() => setIsTaskModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Team Members"
          value={data?.total_team_members || 0}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Total Tasks"
          value={data?.total_tasks || 0}
          subtitle={`${data?.completed_tasks || 0} completed`}
          icon={<ListTodo className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          title="In-Progress"
          value={data?.in_progress_tasks || 0}
          subtitle={`${data?.pending_tasks || 0} pending`}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Overdue Tasks"
          value={data?.overdue_tasks || 0}
          icon={<AlertCircle className="w-5 h-5" />}
          color={data?.overdue_tasks ? 'rose' : 'emerald'}
        />
      </div>

      {/* Overall Progress Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Overall Project Progress</h3>
          </div>
          {data?.total_tasks === 0 ? (
            <span className="text-xs font-semibold text-slate-400">No tasks yet</span>
          ) : (
            <span className="text-base font-extrabold text-blue-600">
              {data?.overall_project_progress || 0}%
            </span>
          )}
        </div>
        <ProgressBar progress={data?.overall_project_progress || 0} showLabel={false} size="lg" />
      </div>

      {/* Main Grid: Team Progress Table & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Member Progress (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Team Member Progress</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/team')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              View Team
            </Button>
          </div>

          {!data?.team_member_progress || data.team_member_progress.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="No team members yet"
              description="Create team members to start assigning work and monitoring individual progress."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Member</th>
                    <th className="py-2.5 px-3">Project Role</th>
                    <th className="py-2.5 px-3">Tasks</th>
                    <th className="py-2.5 px-3">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data.team_member_progress.map((m) => (
                    <tr key={m.user_id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-semibold text-slate-900">{m.user_name}</td>
                      <td className="py-3 px-3 text-slate-500">{m.assigned_role}</td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {m.completed_tasks}/{m.total_tasks}
                      </td>
                      <td className="py-3 px-3 w-40">
                        <ProgressBar progress={m.progress_percentage} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity Feed (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Activity Feed</h3>
          {!data?.recent_activity || data.recent_activity.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-5 h-5" />}
              title="No activity recorded yet"
              description="Actions performed by team members will automatically appear in this feed."
            />
          ) : (
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {data.recent_activity.map((act) => (
                <div key={act.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-700 font-semibold">
                    <span>{act.user?.name || 'User'}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600">{act.action}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deadlines & Overdue Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Overdue Tasks ({data?.overdue_tasks_list.length || 0})</span>
          </h3>

          {!data?.overdue_tasks_list || data.overdue_tasks_list.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              title="No overdue tasks"
              description="All tasks are currently within schedule."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {data.overdue_tasks_list.map((task) => (
                <TaskCard key={task.id} task={task} isLead={true} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Upcoming Deadlines</span>
          </h3>

          {!data?.upcoming_deadlines || data.upcoming_deadlines.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-5 h-5" />}
              title="No upcoming deadlines"
              description="No tasks are due in the immediate schedule."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {data.upcoming_deadlines.map((task) => (
                <TaskCard key={task.id} task={task} isLead={true} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};
