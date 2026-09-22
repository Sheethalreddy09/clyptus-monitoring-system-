import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Coffee,
  LogOut,
  Calendar,
  Filter,
  Search,
  Download,
  FileSpreadsheet,
  RotateCcw,
} from 'lucide-react';
import {
  TeamAttendanceSnapshot,
  TeamMemberDailyAttendance,
  AttendanceRecord,
  AttendanceStatus,
} from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import api from '../services/api';

export const LeadAttendanceDashboard: React.FC = () => {
  const [snapshot, setSnapshot] = useState<TeamAttendanceSnapshot | null>(null);
  const [loadingSnapshot, setLoadingSnapshot] = useState(true);
  const [searchMember, setSearchMember] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'ON_BREAK' | 'NOT_LOGGED_IN' | 'CLOCKED_OUT'>('ALL');

  // Reports state
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const thirtyDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('');
  const [reportRecords, setReportRecords] = useState<AttendanceRecord[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const fetchDailySnapshot = async () => {
    try {
      const res = await api.get<TeamAttendanceSnapshot>('/api/v1/attendance/team/daily');
      setSnapshot(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoadingSnapshot(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      let url = `/api/v1/attendance/team/report?start_date=${startDate}&end_date=${endDate}`;
      if (selectedMemberFilter) {
        url += `&member_id=${selectedMemberFilter}`;
      }
      const res = await api.get<AttendanceRecord[]>(url);
      setReportRecords(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchDailySnapshot();
    const interval = setInterval(fetchDailySnapshot, 15000); // 15s live polling
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, selectedMemberFilter]);

  const filteredMembers = useMemo(() => {
    if (!snapshot?.members) return [];
    return snapshot.members.filter((m) => {
      const matchesSearch =
        !searchMember ||
        m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
        m.email.toLowerCase().includes(searchMember.toLowerCase()) ||
        (m.assigned_role && m.assigned_role.toLowerCase().includes(searchMember.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' || m.current_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [snapshot, searchMember, statusFilter]);

  const formatPunchTime = (dateStr?: string | null) => {
    if (!dateStr) return '--:--';
    let safeStr = dateStr;
    if (!safeStr.endsWith('Z') && !safeStr.includes('+') && !safeStr.slice(10).includes('-')) {
      safeStr += 'Z';
    }
    const d = new Date(safeStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatActiveHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `${h}h ${m}m`;
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Present</span>
          </span>
        );
      case 'HALF_DAY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Half Day</span>
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span>Absent</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  if (loadingSnapshot) return <LoadingSpinner message="Loading attendance dashboard..." />;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Team Attendance Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time workplace presence tracking, live punch statuses, and organizational timesheet reports.
          </p>
        </div>
      </div>

      {/* Snapshot KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Currently Online</span>
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {snapshot?.online_count || 0}
          </div>
          <span className="text-[11px] text-slate-400">Clocked in & active</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Coffee className="w-4 h-4 text-amber-500" />
            <span>On Break</span>
          </div>
          <div className="text-3xl font-black text-amber-600">
            {snapshot?.on_break_count || 0}
          </div>
          <span className="text-[11px] text-slate-400">Temporary break pause</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <LogOut className="w-4 h-4 text-blue-600" />
            <span>Clocked Out</span>
          </div>
          <div className="text-3xl font-black text-blue-600">
            {snapshot?.clocked_out_count || 0}
          </div>
          <span className="text-[11px] text-slate-400">Completed shift today</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span>Not Logged In</span>
          </div>
          <div className="text-3xl font-black text-slate-500">
            {snapshot?.not_logged_in_count || 0}
          </div>
          <span className="text-[11px] text-slate-400">No punch recorded today</span>
        </div>
      </div>

      {/* SECTION 1: WHO'S IN TODAY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-base font-bold text-slate-900">Who's In Today</h3>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                {snapshot?.members?.length || 0} members
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Live workstation presence updated in real-time</p>
          </div>

          {/* Search & Quick Status Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search member or role..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Status pills filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200">
              {(['ALL', 'ONLINE', 'ON_BREAK', 'NOT_LOGGED_IN'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === st
                      ? 'bg-white text-blue-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'ONLINE' ? 'Online' : st === 'ON_BREAK' ? 'Break' : 'Offline'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Member Cards Grid */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No members match the filter</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing the search or status filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => {
              const statusBadgeStyles = {
                ONLINE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                ON_BREAK: 'bg-amber-50 text-amber-700 border-amber-200',
                CLOCKED_OUT: 'bg-blue-50 text-blue-700 border-blue-200',
                NOT_LOGGED_IN: 'bg-slate-100 text-slate-500 border-slate-200',
              }[member.current_status];

              const statusText = {
                ONLINE: 'Online / Working',
                ON_BREAK: 'On Break',
                CLOCKED_OUT: 'Clocked Out',
                NOT_LOGGED_IN: 'Not Clocked In',
              }[member.current_status];

              return (
                <div
                  key={member.member_id}
                  className="bg-slate-50/70 hover:bg-slate-100/70 transition-all rounded-xl border border-slate-200/80 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{member.name}</h4>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {member.assigned_role || 'Member'}
                        </span>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadgeStyles}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        member.current_status === 'ONLINE'
                          ? 'bg-emerald-500'
                          : member.current_status === 'ON_BREAK'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`} />
                      <span>{statusText}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">First In</span>
                      <span className="font-bold text-slate-700">
                        {formatPunchTime(member.first_clock_in)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Active Work</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {formatActiveHours(member.active_minutes)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: ATTENDANCE REPORTS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Attendance Reports</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Historical records and timesheet auditing for the entire organization</p>
          </div>

          {/* Date Range & Member Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-none"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-none"
              />
            </div>

            {/* Member Filter Dropdown */}
            {snapshot?.members && (
              <select
                value={selectedMemberFilter}
                onChange={(e) => setSelectedMemberFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="">All Team Members</option>
                {snapshot.members.map((m) => (
                  <option key={m.member_id} value={m.member_id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => {
                setStartDate(thirtyDaysAgoStr);
                setEndDate(todayStr);
                setSelectedMemberFilter('');
              }}
              title="Reset report filters"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loadingReports ? (
          <LoadingSpinner message="Generating attendance report..." />
        ) : reportRecords.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-blue-500" />}
            title="No attendance records in this date range"
            description="Adjust the date range or select another member to view historical records."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Team Member</th>
                  <th className="py-3 px-4">First Clock In</th>
                  <th className="py-3 px-4">Last Clock Out</th>
                  <th className="py-3 px-4">Active Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Punch Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {reportRecords.map((r) => {
                  const hours = Math.floor(r.total_active_minutes / 60);
                  const mins = Math.floor(r.total_active_minutes % 60);
                  const formattedActive = `${hours}h ${mins}m`;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">{r.date}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{r.member_name || 'User'}</div>
                        {r.member_email && <div className="text-[10px] text-slate-400">{r.member_email}</div>}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {formatPunchTime(r.first_clock_in)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {formatPunchTime(r.last_clock_out)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                        {formattedActive}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(r.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {r.punches?.length || 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
