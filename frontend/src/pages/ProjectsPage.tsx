import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus } from 'lucide-react';
import { Project } from '../types';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const { user } = useAuth();
  const isLead = user?.role === 'TEAM_LEAD';
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get<Project[]>('/api/v1/projects');
      setProjects(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
          {projects.map((project) => (
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
