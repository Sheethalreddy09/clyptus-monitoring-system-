import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Award,
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { WebClock } from '../components/attendance/WebClock';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import api from '../services/api';

export const MyAttendancePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const fetchMonthlyRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get<AttendanceRecord[]>(
        `/api/v1/attendance/me/monthly?year=${currentYear}&month=${currentMonth}`
      );
      setRecords(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyRecords();
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth, 1));
  };

  // Compute monthly stats
  const presentDays = records.filter((r) => r.status === 'PRESENT').length;
  const halfDays = records.filter((r) => r.status === 'HALF_DAY').length;
  const absentDays = records.filter((r) => r.status === 'ABSENT').length;
  const totalMinutes = records.reduce((acc, r) => acc + (r.total_active_minutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const avgHours = records.length > 0 ? (totalMinutes / records.length / 60).toFixed(1) : '0.0';

  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return '--:--';
    let safeStr = dateStr;
    if (!safeStr.endsWith('Z') && !safeStr.includes('+') && !safeStr.slice(10).includes('-')) {
      safeStr += 'Z';
    }
    const d = new Date(safeStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      case 'ON_LEAVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>On Leave</span>
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

  const monthName = currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Attendance Timesheet</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track your daily clock-ins, breaks, active working hours, and monthly attendance history.
          </p>
        </div>
      </div>

      {/* Live Web Clock Widget */}
      <WebClock onPunchSuccess={fetchMonthlyRecords} />

      {/* Monthly Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Days Present</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{presentDays}</div>
          <span className="text-[10px] text-slate-400">Full workday completions</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Half Days</span>
          </div>
          <div className="text-2xl font-black text-amber-600">{halfDays}</div>
          <span className="text-[10px] text-slate-400">Under 8 hours recorded</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Total Active Hours</span>
          </div>
          <div className="text-2xl font-black text-blue-600">{totalHours}h</div>
          <span className="text-[10px] text-slate-400">Hours worked in {currentDate.toLocaleString(undefined, { month: 'short' })}</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Avg Daily Hours</span>
          </div>
          <div className="text-2xl font-black text-indigo-600">{avgHours}h</div>
          <span className="text-[10px] text-slate-400">Average per logged day</span>
        </div>
      </div>

      {/* Timesheet Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        {/* Month Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Attendance Log for {monthName}</h3>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2 min-w-30 text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading attendance records..." />
        ) : records.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-blue-500" />}
            title="No attendance records found"
            description={`You have no clock-in punches logged for ${monthName}. Use the Web Clock above to clock in.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">First Clock In</th>
                  <th className="py-3 px-4">Last Clock Out</th>
                  <th className="py-3 px-4">Active Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Punches Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {records.map((record) => {
                  const hours = Math.floor(record.total_active_minutes / 60);
                  const mins = Math.floor(record.total_active_minutes % 60);
                  const formattedActive = `${hours}h ${mins}m`;

                  const parsedDate = new Date(record.date + 'T00:00:00');
                  const weekday = parsedDate.toLocaleDateString(undefined, { weekday: 'short' });

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-bold uppercase w-8">{weekday}</span>
                          <span>{record.date}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {formatTime(record.first_clock_in)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {formatTime(record.last_clock_out)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                        {formattedActive}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {record.punches?.length || 0} punches
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
