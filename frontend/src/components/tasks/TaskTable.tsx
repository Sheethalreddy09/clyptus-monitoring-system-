import React from 'react';
import { Calendar, MessageSquare, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

interface TaskTableProps {
  tasks: Task[];
  onStatusChange?: (taskId: number, newStatus: TaskStatus) => void;
  onOpenComments?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: number) => void;
  isLead?: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onStatusChange,
  onOpenComments,
  onEditTask,
  onDeleteTask,
  isLead = false,
}) => {
  const { user } = useAuth();
  const isLeadUser = isLead || user?.role === 'TEAM_LEAD';
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Task</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-900">
                  <div className="flex flex-col">
                    <span
                      onClick={() => onEditTask && onEditTask(task)}
                      className="hover:text-blue-600 cursor-pointer font-semibold"
                    >
                      {task.title}
                    </span>
                    {task.description && (
                      <span className="text-xs text-slate-400 line-clamp-1">{task.description}</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-xs text-slate-600">
                  {task.project_name || 'General'}
                </td>
                <td className="py-3 px-4 text-xs text-slate-700">
                  {task.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center text-[10px]">
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{task.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={task.priority} size="sm" />
                </td>
                <td className="py-3 px-4 text-xs">
                  <span className={task.is_overdue ? 'text-red-600 font-bold' : 'text-slate-600'}>
                    {formatDate(task.due_date)}
                  </span>
                  {task.is_overdue && (
                    <span className="ml-1 text-[10px] text-red-600 uppercase font-bold">(Overdue)</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {onStatusChange ? (
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                      className="text-xs py-1 px-2 border border-slate-200 rounded-md bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="REVIEW">REVIEW</option>
                      {isLeadUser && <option value="COMPLETED">COMPLETED</option>}
                    </select>
                  ) : (
                    <Badge variant={task.status} size="sm" />
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onOpenComments && onOpenComments(task)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors"
                      title="Comments"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    {onEditTask && (
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                        title="Edit Task"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {isLead && onDeleteTask && (
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
