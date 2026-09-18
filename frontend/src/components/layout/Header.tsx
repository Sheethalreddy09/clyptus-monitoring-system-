import React, { useState, useEffect } from 'react';
import { Menu, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import api from '../../services/api';
import { Notification } from '../../types';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const res = await api.get<Notification[]>('/api/v1/notifications');
        const unread = res.data.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        // Silent error
      }
    };

    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Clyptus Logo" className="h-8 w-auto object-contain hidden sm:inline-block" />
          <span className="text-sm font-bold text-slate-800 hidden md:inline-block border-l border-slate-200 pl-3">
            Clyptus Monitoring System
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <a
          href="/notifications"
          className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </a>

        {/* User profile details & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center text-sm border border-blue-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>

          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-slate-900 leading-tight">
              {user?.name}
            </div>
            <div className="text-[11px] text-slate-500">{user?.email}</div>
          </div>

          <Badge variant={user?.role || 'TEAM_MEMBER'} size="sm" />

          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
