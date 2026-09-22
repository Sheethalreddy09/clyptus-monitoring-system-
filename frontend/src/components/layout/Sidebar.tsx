import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Users,
  MessageSquare,
  Users2,
  BarChart3,
  Activity,
  Bell,
  ShieldCheck,
  UserCheck,
  Clock,
  CalendarCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMessageContext } from '../../context/MessageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { unreadCount, isBumping } = useMessageContext();
  const isLead = user?.role === 'TEAM_LEAD';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <img src="/logo.png" alt="Clyptus Software Solutions" className="h-10 w-auto object-contain max-w-[190px]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-0.5">
              Clyptus Monitoring System
            </span>
          </div>
        </div>

        {/* User Role Banner */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
          {isLead ? (
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          ) : (
            <UserCheck className="w-4 h-4 text-emerald-600" />
          )}
          <span className="text-xs font-semibold text-slate-700">
            {isLead ? 'Team Lead Workspace' : 'Team Member View'}
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Dashboard Link */}
          <div>
            <NavLink to="/dashboard" className={navLinkClass} onClick={onClose}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* PROJECT SECTION */}
          <div>
            <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Project
            </h4>
            <div className="space-y-1">
              <NavLink to="/projects" className={navLinkClass} onClick={onClose}>
                <FolderKanban className="w-4 h-4" />
                <span>Projects</span>
              </NavLink>

              {isLead ? (
                <NavLink to="/tasks" className={navLinkClass} onClick={onClose}>
                  <CheckSquare className="w-4 h-4" />
                  <span>Tasks</span>
                </NavLink>
              ) : (
                <NavLink to="/my-tasks" className={navLinkClass} onClick={onClose}>
                  <CheckSquare className="w-4 h-4" />
                  <span>My Tasks</span>
                </NavLink>
              )}

              <NavLink to="/calendar" className={navLinkClass} onClick={onClose}>
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </NavLink>
            </div>
          </div>

          {/* TEAM SECTION */}
          <div>
            <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Team
            </h4>
            <div className="space-y-1">
              {isLead && (
                <NavLink to="/team" className={navLinkClass} onClick={onClose}>
                  <Users className="w-4 h-4" />
                  <span>Team Members</span>
                </NavLink>
              )}
              <NavLink to="/groups" className={navLinkClass} onClick={onClose}>
                <Users2 className="w-4 h-4" />
                <span>Groups</span>
              </NavLink>
              <NavLink to="/messages" className={navLinkClass} onClick={onClose}>
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1">Messages</span>
                {unreadCount > 0 && (
                  <span
                    className={`ml-auto shrink-0 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-extrabold text-white bg-red-600 rounded-full shadow-xs ring-1 ring-white/30 transition-all duration-300 ${
                      isBumping ? 'animate-bounce scale-110 ring-2 ring-red-400' : ''
                    }`}
                    title={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
                    aria-label={`${unreadCount} unread messages`}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </NavLink>
            </div>
          </div>

          {/* ATTENDANCE SECTION */}
          <div>
            <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Attendance
            </h4>
            <div className="space-y-1">
              <NavLink to="/attendance" className={navLinkClass} onClick={onClose}>
                <Clock className="w-4 h-4" />
                <span>My Attendance</span>
              </NavLink>
              {isLead && (
                <NavLink to="/team-attendance" className={navLinkClass} onClick={onClose}>
                  <CalendarCheck className="w-4 h-4" />
                  <span>Team Attendance</span>
                </NavLink>
              )}
            </div>
          </div>

          {/* ANALYTICS SECTION */}
          <div>
            <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Analytics
            </h4>
            <div className="space-y-1">
              <NavLink to="/analytics" className={navLinkClass} onClick={onClose}>
                <BarChart3 className="w-4 h-4" />
                <span>Progress & Analytics</span>
              </NavLink>
              <NavLink to="/activity" className={navLinkClass} onClick={onClose}>
                <Activity className="w-4 h-4" />
                <span>Activity Feed</span>
              </NavLink>
            </div>
          </div>

          {/* SYSTEM SECTION */}
          <div>
            <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              System
            </h4>
            <div className="space-y-1">
              <NavLink to="/notifications" className={navLinkClass} onClick={onClose}>
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </NavLink>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
