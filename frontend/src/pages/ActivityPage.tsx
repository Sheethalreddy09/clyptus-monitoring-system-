import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Clock,
  User,
  Users,
  Search,
  Filter,
  Layers,
  List,
  RefreshCw,
  X,
} from 'lucide-react';
import { ActivityLog } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import api from '../services/api';

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'feed' | 'sections'>('feed');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const res = await api.get<ActivityLog[]>('/api/v1/activity?limit=100');
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

  // Compute unique team members from activity logs
  const members = useMemo(() => {
    const map = new Map<
      number,
      { id: number; name: string; email?: string; role?: string; count: number }
    >();

    logs.forEach((log) => {
      const uId = log.user_id;
      const uName = log.user?.name || `User #${uId}`;
      const uEmail = log.user?.email;
      const uRole = log.user?.role;

      if (!map.has(uId)) {
        map.set(uId, {
          id: uId,
          name: uName,
          email: uEmail,
          role: uRole,
          count: 1,
        });
      } else {
        map.get(uId)!.count += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [logs]);

  // Filter logs based on selected member & search query
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesMember =
        selectedMemberId === 'ALL' || log.user_id === Number(selectedMemberId);

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        log.action.toLowerCase().includes(query) ||
        (log.user?.name && log.user.name.toLowerCase().includes(query)) ||
        log.entity_type.toLowerCase().includes(query);

      return matchesMember && matchesSearch;
    });
  }, [logs, selectedMemberId, searchQuery]);

  if (loading) return <LoadingSpinner message="Loading activity feed..." />;

  const activeMember = members.find((m) => String(m.id) === selectedMemberId);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Activity Feed Dashboard</h2>
            <p className="text-xs text-slate-500 mt-1">
              Audit trail of team actions, task progressions, and project updates separated by individual team members.
            </p>
          </div>

          {/* View mode toggle & Refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchActivity}
              title="Refresh Activity"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('feed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'feed'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Feed View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('sections')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'sections'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>By Member Sections</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar: Search & Member Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search activities or actions..."
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

          {/* Member Dropdown Filter (Quick Filter) */}
          <div className="w-full sm:w-64">
            <div className="relative">
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All Team Members ({logs.length} activities)</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.count} actions)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Team Member Tabs */}
        {members.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100">
            <button
              onClick={() => setSelectedMemberId('ALL')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedMemberId === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Members</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedMemberId === 'ALL' ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {logs.length}
              </span>
            </button>

            {members.map((member) => {
              const isSelected = selectedMemberId === String(member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedMemberId(String(member.id))}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                      isSelected ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{member.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {member.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter summary when specific member is chosen */}
      {selectedMemberId !== 'ALL' && activeMember && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              {activeMember.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-blue-900 font-medium">
              Showing isolated activity feed for <strong className="font-bold">{activeMember.name}</strong> ({filteredLogs.length} actions)
            </span>
          </div>
          <button
            onClick={() => setSelectedMemberId('ALL')}
            className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>Show All Members</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {logs.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-8 h-8 text-blue-500" />}
          title="No activity recorded yet"
          description="Actions performed by team members and team leads will appear here."
        />
      ) : viewMode === 'sections' ? (
        /* SEPARATE USER SECTIONS VIEW */
        <div className="space-y-6">
          {members
            .filter((m) => selectedMemberId === 'ALL' || String(m.id) === selectedMemberId)
            .map((member) => {
              const memberActivities = filteredLogs.filter((log) => log.user_id === member.id);
              if (memberActivities.length === 0 && searchQuery) return null;

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
                >
                  {/* Member Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                          {member.role && (
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {member.role}
                            </span>
                          )}
                        </div>
                        {member.email && (
                          <p className="text-xs text-slate-400 mt-0.5">{member.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                        {memberActivities.length} {memberActivities.length === 1 ? 'Action' : 'Actions'} Logged
                      </span>
                    </div>
                  </div>

                  {/* Member Activity List */}
                  {memberActivities.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-3 text-center">
                      No matching actions recorded for this member.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {memberActivities.map((log) => (
                        <div
                          key={log.id}
                          className="p-3.5 bg-slate-50 hover:bg-slate-100/70 transition-colors rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{log.action}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Entity: <span className="font-medium text-slate-700">{log.entity_type}</span>
                                {log.project_id && <span className="ml-2 text-slate-400">• Project #{log.project_id}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 self-end sm:self-center font-medium">
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
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        /* FILTERED AGGREGATED / SINGLE FEED VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              {selectedMemberId === 'ALL'
                ? `All Activities (${filteredLogs.length})`
                : `${activeMember?.name}'s Activities (${filteredLogs.length})`}
            </h3>
            {searchQuery && (
              <span className="text-xs text-slate-500">
                Filtered by keyword: &quot;{searchQuery}&quot;
              </span>
            )}
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No activities found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search keyword or member filter.
              </p>
              {(selectedMemberId !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedMemberId('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-3 text-xs text-blue-600 font-semibold hover:underline"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-slate-50 hover:bg-slate-100/70 transition-colors rounded-xl border border-slate-100 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center text-xs mt-0.5 shrink-0">
                      {log.user?.name ? log.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-slate-900">{log.action}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        By{' '}
                        <button
                          type="button"
                          onClick={() => setSelectedMemberId(String(log.user_id))}
                          className="font-semibold text-slate-700 hover:text-blue-600 hover:underline"
                        >
                          {log.user?.name || 'User'}
                        </button>{' '}
                        • Entity: <span className="font-medium text-slate-600">{log.entity_type}</span>
                        {log.project_id && <span className="ml-1.5 text-slate-400">(Project #{log.project_id})</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium shrink-0">
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
          )}
        </div>
      )}
    </div>
  );
};
