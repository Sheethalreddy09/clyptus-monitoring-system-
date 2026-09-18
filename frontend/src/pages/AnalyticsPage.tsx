import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle2, Clock, AlertCircle, PieChart, Users } from 'lucide-react';
import { AnalyticsData } from '../types';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import api from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get<AnalyticsData>('/api/v1/analytics/metrics');
      setData(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating analytics..." />;

  if (!data || !data.has_data) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Project Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Visual statistics derived dynamically from database tasks, priorities, and completions.
          </p>
        </div>

        <EmptyState
          icon={<BarChart3 className="w-8 h-8 text-blue-500" />}
          title="Not enough data for analytics."
          description="Analytics will appear once projects and tasks are created in the database."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Project Analytics</h2>
        <p className="text-xs text-slate-500 mt-1">
          Real-time metrics computed directly from database tasks and completions.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Completion"
          value={`${data.overall_progress}%`}
          icon={<BarChart3 className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Completed Tasks"
          value={data.completed_vs_pending.completed}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Pending Tasks"
          value={data.completed_vs_pending.pending}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Overdue Tasks"
          value={data.overdue_count}
          icon={<AlertCircle className="w-5 h-5" />}
          color={data.overdue_count > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Charts / Distribution Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            <span>Tasks by Status</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(data.tasks_by_status).map(([status, count]) => {
              const total = data.completed_vs_pending.completed + data.completed_vs_pending.pending;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{status}</span>
                    <span className="text-slate-500">{count} tasks ({pct}%)</span>
                  </div>
                  <ProgressBar progress={pct} showLabel={false} size="sm" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks by Priority Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Tasks by Priority</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(data.tasks_by_priority).map(([priority, count]) => {
              const total = data.completed_vs_pending.completed + data.completed_vs_pending.pending;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={priority} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{priority} Priority</span>
                    <span className="text-slate-500">{count} tasks ({pct}%)</span>
                  </div>
                  <ProgressBar progress={pct} showLabel={false} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Member Task Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Member Task Distribution</span>
        </h3>

        {data.member_task_distribution.length === 0 ? (
          <p className="text-xs text-slate-400">No member distribution available.</p>
        ) : (
          <div className="space-y-3">
            {data.member_task_distribution.map((m) => (
              <div key={m.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <span className="font-semibold text-slate-900">{m.name}</span>
                <span className="font-bold text-blue-600 bg-white px-2.5 py-1 border border-slate-200 rounded-md">
                  {m.task_count} Tasks Assigned
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
