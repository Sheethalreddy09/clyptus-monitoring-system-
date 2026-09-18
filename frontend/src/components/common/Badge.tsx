import React from 'react';
import { TaskStatus, TaskPriority } from '../../types';

interface BadgeProps {
  variant: TaskStatus | TaskPriority | 'ACTIVE' | 'COMPLETED' | 'TEAM_LEAD' | 'TEAM_MEMBER' | 'OVERDUE' | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant, size = 'md' }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (variant) {
    case 'TODO':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
      break;
    case 'IN_PROGRESS':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'REVIEW':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'COMPLETED':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'LOW':
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    case 'MEDIUM':
      colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case 'HIGH':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'ACTIVE':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'TEAM_LEAD':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case 'TEAM_MEMBER':
      colorClasses = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      break;
    case 'OVERDUE':
      colorClasses = 'bg-red-100 text-red-800 border-red-200 font-semibold animate-pulse';
      break;
    default:
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${padding} ${colorClasses}`}
    >
      {variant.replace('_', ' ')}
    </span>
  );
};
