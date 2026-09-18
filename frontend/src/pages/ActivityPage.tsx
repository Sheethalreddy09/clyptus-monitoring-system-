import React, { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';
import { ActivityLog } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import api from '../services/api';

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      const res = await api.get<ActivityLog[]>('/api/v1/activity?limit=50');
      setLogs(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  if (loading) return <LoadingSpinner message="Loading activity feed..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Activity Log</h2>
          <p className="text-xs text-slate-500 mt-1">
            Audit trail of user actions, task completions, project updates, and group operations.
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-8 h-8 text-blue-500" />}
          title="No activity recorded yet"
          description="Actions performed by team members and team leads will appear here."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center text-xs mt-0.5">
                    {log.user?.name ? log.user.name.charAt(0).toUpperCase() : 'A'}
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-slate-900">{log.action}</div>
                    <div className="text-xs text-slate-500">
                      By <span className="font-semibold text-slate-700">{log.user?.name || 'User'}</span> ({log.entity_type})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {new Date(log.created_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
