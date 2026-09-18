import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus } from 'lucide-react';
import { Project } from '../types';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Select } from '../components/common/Select';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

type ProjectSortMode = 'earliest' | 'latest';

const getProjectDateValue = (project: Project) => {
  const start = project.start_date ? new Date(project.start_date).getTime() : Number.NEGATIVE_INFINITY;
  const end = project.end_date ? new Date(project.end_date).getTime() : Number.NEGATIVE_INFINITY;
  return {
    start: Number.isFinite(start) ? start : Number.MAX_SAFE_INTEGER,
    end: Number.isFinite(end) ? end : Number.MAX_SAFE_INTEGER,
  };
};

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [sortMode, setSortMode] = useState<ProjectSortMode>('earliest');

  const { user } = useAuth();
  const isLead = user?.role === 'TEAM_LEAD';
  const navigate = useNavigate();

  const fetchProjects = async (nextSortMode: ProjectSortMode = sortMode) => {
    try {
      const res = await api.get<Project[]>('/api/v1/projects', { params: { sort: nextSortMode } });
      setProjects(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(sortMode);
  }, [sortMode]);

  const sortedProjects = [...projects].sort((a, b) => {
    const first = getProjectDateValue(a);
    const second = getProjectDateValue(b);
    const comparison = (first.start ?? first.end) - (second.start ?? second.end);
    const rangeComparison = (first.end ?? first.start) - (second.end ?? second.start);
    const result = comparison === 0 ? rangeComparison : comparison;
    return sortMode === 'earliest' ? result : -result;
  });

  if (loading) return <LoadingSpinner message="Loading projects..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Projects</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage projects, monitor progress percentages, and track team assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Sort</label>
          <Select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as ProjectSortMode)}
            options={[
              { value: 'earliest', label: 'Earliest First' },
              { value: 'latest', label: 'Latest First' },
            ]}
            className="min-w-[180px]"
          />
        </div>
        {isLead && (
          <Button
            onClick={() => {
              setProjectToEdit(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Create Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-8 h-8 text-blue-500" />}
          title="No projects created yet."
          description="Projects organize team members, tasks, groups, and analytics. Get started by creating your first project."
          action={
            isLead ? (
              <Button
                onClick={() => {
                  setProjectToEdit(null);
                  setIsModalOpen(true);
                }}
                icon={<Plus className="w-4 h-4" />}
              >
                Create Project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={(p) => navigate(`/projects/${p.id}`)}
            />
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
        projectToEdit={projectToEdit}
      />
    </div>
  );
};
