import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, CheckCircle2, Clock } from 'lucide-react';
import { Notification } from '../types';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import api from '../services/api';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get<Notification[]>('/api/v1/notifications');
      setNotifications(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.patch(`/api/v1/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/api/v1/notifications/mark-all-read');
      fetchNotifications();
    } catch (err) {
      // silent
    }
  };

  if (loading) return <LoadingSpinner message="Loading notifications..." />;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Notifications</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time notifications generated from task assignments, completions, and messages.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            icon={<CheckCheck className="w-4 h-4" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          title="You're all caught up."
          description="Notifications will automatically trigger when tasks are assigned, completed, or messages arrive."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                notif.is_read
                  ? 'bg-white border-slate-100 text-slate-600'
                  : 'bg-blue-50/50 border-blue-100 text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg border mt-0.5 ${
                    notif.is_read
                      ? 'bg-slate-100 text-slate-400 border-slate-200'
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>

                <div>
                  <h4 className="text-sm font-bold">{notif.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 inline-block">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex-shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
