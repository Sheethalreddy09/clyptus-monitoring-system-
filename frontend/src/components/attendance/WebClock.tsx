import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Square,
  Coffee,
  CheckCircle2,
  AlertCircle,
  History,
  Timer,
  Sparkles,
} from 'lucide-react';
import { TodayAttendanceData, PunchType } from '../../types';
import api from '../../services/api';

interface WebClockProps {
  onPunchSuccess?: () => void;
  compact?: boolean;
}

export const WebClock: React.FC<WebClockProps> = ({ onPunchSuccess, compact = false }) => {
  const [data, setData] = useState<TodayAttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [errorMsg, setErrorMsg] = useState('');

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const res = await api.get<TodayAttendanceData>('/api/v1/attendance/me/today');
      setData(res.data);
      setErrorMsg('');
    } catch (err: any) {
      // silent or network retry
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
    const interval = setInterval(fetchTodayAttendance, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const handlePunch = async (punchType: PunchType) => {
    setPunching(true);
    setErrorMsg('');
    try {
      const res = await api.post<TodayAttendanceData>('/api/v1/attendance/punch', {
        punch_type: punchType,
      });
      setData(res.data);
      if (onPunchSuccess) onPunchSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to record punch. Please try again.');
    } finally {
      setPunching(false);
    }
  };

  // Format active minutes into HH:MM:SS or HHh MMm
  const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatLocalPunchTime = (dateStr: string) => {
    let safeStr = dateStr;
    if (!safeStr.endsWith('Z') && !safeStr.includes('+') && !safeStr.slice(10).includes('-')) {
      safeStr += 'Z';
    }
    const d = new Date(safeStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const isClockedIn = data?.is_clocked_in ?? false;
  const isOnBreak = data?.is_on_break ?? false;
  const activeMinutes = data?.active_minutes_today ?? 0;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${compact ? 'p-4' : 'p-6'}`}>
      {/* Top Banner / Live Clock Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs ${
            isOnBreak
              ? 'bg-amber-100 text-amber-700'
              : isClockedIn
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-700'
          }`}>
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Web Clock</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isOnBreak
                  ? 'bg-amber-100 text-amber-800'
                  : isClockedIn
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isOnBreak ? 'On Break' : isClockedIn ? 'Clocked In' : 'Not Clocked In'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {currentTime.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Live Digital Clock */}
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 tabular-nums">
            {currentTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            })}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Local Workstation Time</div>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Stats and Punch Action Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
        {/* Active Work Timer Gauge */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-blue-600" />
              <span>Today's Total Active Work</span>
            </span>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {formatDuration(activeMinutes)}
            </div>
            <span className="text-[10px] text-slate-400 block">
              {data?.first_clock_in
                ? `Started at ${formatLocalPunchTime(data.first_clock_in)}`
                : 'No punch recorded yet today'}
            </span>
          </div>

          <div className="text-right space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">Daily Target</span>
            <span className="text-sm font-bold text-slate-800">8h 00m</span>
            <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeMinutes >= 480 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, Math.round((activeMinutes / 480) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Punch Buttons */}
        <div className="flex flex-col justify-center gap-2.5">
          {!isClockedIn ? (
            /* CLOCK IN BUTTON */
            <button
              type="button"
              id="web-clock-in-btn"
              disabled={punching || loading}
              onClick={() => handlePunch('CLOCK_IN')}
              className="w-full h-13 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{punching ? 'Recording Punch...' : 'Web Clock In'}</span>
            </button>
          ) : (
            /* CLOCKED IN CONTROLS (BREAK & CLOCK OUT) */
            <div className="flex items-center gap-3">
              {/* Take Break / Resume Break */}
              {isOnBreak ? (
                <button
                  type="button"
                  id="web-resume-work-btn"
                  disabled={punching || loading}
                  onClick={() => handlePunch('BREAK_END')}
                  className="flex-1 h-13 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{punching ? 'Resuming...' : 'Resume Work'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="web-take-break-btn"
                  disabled={punching || loading}
                  onClick={() => handlePunch('BREAK_START')}
                  className="flex-1 h-13 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Coffee className="w-4 h-4" />
                  <span>{punching ? 'Recording...' : 'Take a Break'}</span>
                </button>
              )}

              {/* Web Clock Out */}
              <button
                type="button"
                id="web-clock-out-btn"
                disabled={punching || loading}
                onClick={() => handlePunch('CLOCK_OUT')}
                className="flex-1 h-13 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>{punching ? 'Clocking Out...' : 'Web Clock Out'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Today's Punch History Timeline */}
      {data?.punches && data.punches.length > 0 && (
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Today's Punch Log ({data.punches.length})</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Status: <strong className="text-emerald-700">{data.status}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 overflow-x-auto py-1">
            {data.punches.map((punch) => {
              const badgeColors = {
                CLOCK_IN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                CLOCK_OUT: 'bg-rose-50 text-rose-700 border-rose-200',
                BREAK_START: 'bg-amber-50 text-amber-700 border-amber-200',
                BREAK_END: 'bg-blue-50 text-blue-700 border-blue-200',
              }[punch.punch_type] || 'bg-slate-50 text-slate-700 border-slate-200';

              const punchLabels = {
                CLOCK_IN: 'Clock In',
                CLOCK_OUT: 'Clock Out',
                BREAK_START: 'Break Start',
                BREAK_END: 'Break End',
              }[punch.punch_type] || punch.punch_type;

              return (
                <div
                  key={punch.id}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${badgeColors}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{punchLabels}</span>
                  <span className="text-[10px] font-bold opacity-75">
                    {formatLocalPunchTime(punch.punch_time)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
