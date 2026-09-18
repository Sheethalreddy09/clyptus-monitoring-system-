import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, FolderKanban, CheckCircle2 } from 'lucide-react';
import { CalendarEvent } from '../types';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import api from '../services/api';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalendarEvents = async () => {
    try {
      const res = await api.get<CalendarEvent[]>('/api/v1/calendar/events');
      setEvents(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner message="Loading calendar schedule..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Project Calendar Schedule</h2>
          <p className="text-xs text-slate-500 mt-1">
            Visual breakdown of active project milestones, task due dates, and completion timelines.
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="w-8 h-8 text-blue-500" />}
          title="No scheduled events."
          description="Project start/end dates and task deadlines created in the database will be displayed here."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900">Upcoming Timeline ({events.length} Events)</h3>
          </div>

          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg border ${
                    evt.type === 'TASK_DEADLINE'
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    {evt.type === 'TASK_DEADLINE' ? <Clock className="w-5 h-5" /> : <FolderKanban className="w-5 h-5" />}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                    {evt.project_name && (
                      <span className="text-xs text-slate-500">Project: {evt.project_name}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {evt.status && <Badge variant={evt.status} size="sm" />}
                  <div className="text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-2xs">
                    {formatDate(evt.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
