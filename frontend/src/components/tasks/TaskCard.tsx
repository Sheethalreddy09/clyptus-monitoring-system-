import React from 'react';
import { Calendar, MessageSquare, Clock, User, CheckCircle2 } from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: number, newStatus: TaskStatus) => void;
  onOpenComments?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  isLead?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onOpenComments,
  onEditTask,
  isLead = false,
}) => {
  const { user } = useAuth();
  const isLeadUser = isLead || user?.role === 'TEAM_LEAD';
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant={task.priority} size="sm" />
          <div className="flex items-center gap-1.5">
            {task.is_overdue && <Badge variant="OVERDUE" size="sm" />}
            <Badge variant={task.status} size="sm" />
          </div>
        </div>

        <h4
          onClick={() => onEditTask && onEditTask(task)}
          className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer mb-1 line-clamp-2"
        >
          {task.title}
        </h4>

        {task.project_name && (
          <span className="inline-block text-[11px] font-medium text-slate-400 mb-2">
            Project: {task.project_name}
          </span>
        )}

        <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
          {task.description || 'No additional details.'}
        </p>
      </div>

      <div className="space-y-2 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-[10px]">
              {task.assignee ? task.assignee.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
            </div>
            <span className="text-xs text-slate-700 font-medium">
              {task.assignee ? task.assignee.name : 'Unassigned'}
            </span>
          </div>

          {task.due_date && (
            <div className={`flex items-center gap-1 text-[11px] ${task.is_overdue ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            onClick={() => onOpenComments && onOpenComments(task)}
            className="flex items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors text-[11px]"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{task.comments?.length || 0} Comments</span>
          </button>

          {onStatusChange && (
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
              className="text-xs py-1 px-2 border border-slate-200 rounded-md bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="REVIEW">REVIEW</option>
              {isLeadUser && <option value="COMPLETED">COMPLETED</option>}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};
