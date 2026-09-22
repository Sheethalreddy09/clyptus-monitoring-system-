import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  FolderKanban,
  CheckCircle2,
  Filter,
  Search,
  X,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { CalendarEvent } from '../types';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import api from '../services/api';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Date & Time picker state
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'on_date' | 'on_or_after'>('on_date');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'TASK_DEADLINE' | 'PROJECT'>('ALL');

  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const hasTime = dateStr.includes('T') && !dateStr.endsWith('T00:00:00');
    return d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
  };

  // Filter events based on selected date-time, search query, and type
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Type filter
      if (typeFilter === 'TASK_DEADLINE' && evt.type !== 'TASK_DEADLINE') return false;
      if (typeFilter === 'PROJECT' && evt.type === 'TASK_DEADLINE') return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(q);
        const matchesProject = evt.project_name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesProject) return false;
      }

      // Date & Time filter
      if (selectedDateTime) {
        const filterDate = new Date(selectedDateTime);
        const eventDate = new Date(evt.date);

        if (filterMode === 'on_date') {
          // Compare YYYY-MM-DD
          const filterYMD = `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, '0')}-${String(filterDate.getDate()).padStart(2, '0')}`;
          const eventYMD = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
          if (filterYMD !== eventYMD) return false;

          // If a time other than 00:00 was explicitly specified, check if event is at or after that time
          const filterHours = filterDate.getHours();
          const filterMinutes = filterDate.getMinutes();
          if (filterHours !== 0 || filterMinutes !== 0) {
            const filterTimeVal = filterHours * 60 + filterMinutes;
            const eventTimeVal = eventDate.getHours() * 60 + eventDate.getMinutes();
            if (eventTimeVal < filterTimeVal) return false;
          }
        } else {
          // 'on_or_after' mode
          if (eventDate.getTime() < filterDate.getTime()) return false;
        }
      }

      return true;
    });
  }, [events, selectedDateTime, filterMode, searchQuery, typeFilter]);

  const handleClearFilter = () => {
    setSelectedDateTime('');
    setSearchQuery('');
    setTypeFilter('ALL');
  };

  if (loading) return <LoadingSpinner message="Loading calendar schedule..." />;

  const formattedSelected = selectedDateTime
    ? new Date(selectedDateTime).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Project Calendar Schedule</h2>
            <p className="text-xs text-slate-500 mt-1">
              Visual breakdown of active project milestones, task due dates, and completion timelines.
            </p>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  typeFilter === 'ALL'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({events.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('TASK_DEADLINE')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  typeFilter === 'TASK_DEADLINE'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tasks
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('PROJECT')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  typeFilter === 'PROJECT'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Projects
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Row: Search & Calendar Date-Picker Trigger */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search schedule by task or project name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Calendar Icon Date-Picker Popover Trigger */}
          <div className="relative w-full sm:w-auto">
            <button
              ref={triggerRef}
              type="button"
              id="calendar-date-picker-trigger"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedDateTime
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs ring-2 ring-blue-500/10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <span>
                  {selectedDateTime ? `Filtered: ${formattedSelected}` : 'Select Date & Time'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Date-Picker Popover Dialog */}
            {isDatePickerOpen && (
              <div
                ref={popoverRef}
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 space-y-3.5 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                    <span>Filter by Date & Time</span>
                  </div>
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Native Date & Time Input */}
                <div className="space-y-1.5">
                  <label htmlFor="calendar-datetime-input" className="block text-[11px] font-bold text-slate-600">
                    Choose Date & Time:
                  </label>
                  <input
                    id="calendar-datetime-input"
                    type="datetime-local"
                    value={selectedDateTime}
                    onChange={(e) => setSelectedDateTime(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Filter Mode Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-600">
                    Filter Range:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFilterMode('on_date')}
                      className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-all text-center ${
                        filterMode === 'on_date'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      On this Date
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('on_or_after')}
                      className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-all text-center ${
                        filterMode === 'on_or_after'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      On or After
                    </button>
                  </div>
                </div>

                {/* Quick Date Presets */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const year = now.getFullYear();
                      const month = String(now.getMonth() + 1).padStart(2, '0');
                      const day = String(now.getDate()).padStart(2, '0');
                      const hours = String(now.getHours()).padStart(2, '0');
                      const minutes = String(now.getMinutes()).padStart(2, '0');
                      setSelectedDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Set to Now
                  </button>

                  {selectedDateTime && (
                    <button
                      type="button"
                      onClick={() => setSelectedDateTime('')}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear Date</span>
                    </button>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-xs"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset All Filters Button */}
          {(selectedDateTime || searchQuery || typeFilter !== 'ALL') && (
            <button
              onClick={handleClearFilter}
              title="Reset all filters"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Pill Bar */}
      {selectedDateTime && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-900 font-medium">
              Schedule filtered for{' '}
              <strong className="font-bold">{formattedSelected}</strong>{' '}
              ({filterMode === 'on_date' ? 'events on this date' : 'events on or after this date & time'}) •{' '}
              <strong className="font-bold">{filteredEvents.length}</strong> matching{' '}
              {filteredEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>
          <button
            onClick={() => setSelectedDateTime('')}
            className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Clear Date Filter</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Events Timeline List */}
      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="w-8 h-8 text-blue-500" />}
          title="No scheduled events."
          description="Project start/end dates and task deadlines created in the database will be displayed here."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Schedule Timeline ({filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'})
            </h3>
            {filteredEvents.length < events.length && (
              <span className="text-xs text-slate-400">
                (filtered from {events.length} total events)
              </span>
            )}
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No events found</p>
              <p className="text-xs text-slate-400 mt-1">
                No project milestones or task deadlines match the selected date/time or search filter.
              </p>
              <button
                onClick={handleClearFilter}
                className="mt-3 text-xs text-blue-600 font-semibold hover:underline"
              >
                Clear all filters and show all events
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg border ${
                        evt.type === 'TASK_DEADLINE'
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}
                    >
                      {evt.type === 'TASK_DEADLINE' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <FolderKanban className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                      {evt.project_name && (
                        <span className="text-xs text-slate-500">Project: {evt.project_name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {evt.priority && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          evt.priority === 'HIGH'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : evt.priority === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {evt.priority}
                      </span>
                    )}

                    {evt.status && <Badge variant={evt.status} size="sm" />}

                    <div className="text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDateTime(evt.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
