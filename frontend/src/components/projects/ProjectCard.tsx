import React from 'react';
import { FolderKanban, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';

interface ProjectCardProps {
  project: Project;
  onSelect?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      onClick={() => onSelect && onSelect(project)}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 line-clamp-1">{project.name}</h3>
          </div>
          <Badge variant={project.status} size="sm" />
        </div>

        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
          {project.description || 'No project description provided.'}
        </p>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-100">
        <ProgressBar progress={project.progress_percentage} showLabel={true} size="sm" />

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{project.members?.length || 0} Members</span>
          </div>

          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {project.completed_task_count}/{project.task_count} Tasks
            </span>
          </div>
        </div>

        {(project.start_date || project.end_date) && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>
              {formatDate(project.start_date)} - {formatDate(project.end_date)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
