import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FolderKanban, Users, ListTodo, Plus, ArrowLeft, Calendar, Trash2 } from 'lucide-react';
import { Project, Task, User } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { TaskTable } from '../components/tasks/TaskTable';
import { TaskModal } from '../components/tasks/TaskModal';
import { TaskCommentsModal } from '../components/tasks/TaskCommentsModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [availableMembers, setAvailableMembers] = useState<User[]>([]);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState<number | string>('');
  const [memberRole, setMemberRole] = useState('Developer');

  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState<Task | null>(null);

  const { user } = useAuth();
  const isLead = user?.role === 'TEAM_LEAD';
  const navigate = useNavigate();

  const fetchProjectDetails = async () => {
    if (!id) return;
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        api.get<Project>(`/api/v1/projects/${id}`),
        api.get<Task[]>(`/api/v1/tasks?project_id=${id}`),
        api.get<User[]>('/api/v1/users'),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setAvailableMembers(usersRes.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberToAdd || !project) return;
    try {
      await api.post(`/api/v1/projects/${project.id}/members`, {
        user_id: Number(selectedMemberToAdd),
        assigned_role: memberRole.trim() || 'Member',
      });
      setSelectedMemberToAdd('');
      fetchProjectDetails();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add member to project.');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!project) return;
    if (!confirm('Remove member from project?')) return;
    try {
      await api.delete(`/api/v1/projects/${project.id}/members/${userId}`);
      fetchProjectDetails();
    } catch (err: any) {
      alert('Failed to remove member');
    }
  };

  if (loading) return <LoadingSpinner message="Loading project details..." />;
  if (!project) return <div>Project not found.</div>;

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/projects')}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Projects
        </Button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{project.name}</h2>
                <Badge variant={project.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-1">{project.description || 'No description'}</p>
            </div>
          </div>

          {isLead && (
            <Button onClick={() => setIsTaskModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Add Task
            </Button>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100">
          <ProgressBar progress={project.progress_percentage} showLabel={true} size="md" />
        </div>
      </div>

      {/* Grid: Project Members & Task Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Members Column (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Project Members ({project.members?.length || 0})</span>
          </h3>

          {/* Add member form */}
          {isLead && (
            <form onSubmit={handleAddMember} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase">Add Member to Project</label>
              <select
                value={selectedMemberToAdd}
                onChange={(e) => setSelectedMemberToAdd(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-md bg-white"
              >
                <option value="">-- Select Member --</option>
                {availableMembers
                  .filter((m) => !project.members?.some((pm) => pm.user_id === m.id))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
              </select>

              <input
                type="text"
                placeholder="Role e.g. Lead Designer"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-md bg-white"
              />

              <Button type="submit" size="sm" className="w-full">
                Add to Project
              </Button>
            </form>
          )}

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {project.members?.map((pm) => (
              <div
                key={pm.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">{pm.user?.name || `User #${pm.user_id}`}</div>
                  <div className="text-[11px] text-slate-500">{pm.assigned_role || 'Member'}</div>
                </div>

                {isLead && pm.user_id !== project.team_lead_id && (
                  <button
                    onClick={() => handleRemoveMember(pm.user_id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Project Tasks Table Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Project Tasks</h3>
            <span className="text-xs text-slate-500 font-medium">{tasks.length} total tasks</span>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              icon={<ListTodo className="w-6 h-6" />}
              title="No tasks in this project"
              description="Tasks assigned to team members drive project progress."
              action={
                isLead ? (
                  <Button onClick={() => setIsTaskModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
                    Create Task
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <TaskTable
              tasks={tasks}
              onOpenComments={(t) => setSelectedTaskForComments(t)}
              isLead={isLead}
            />
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchProjectDetails}
        defaultProjectId={project.id}
      />

      <TaskCommentsModal
        isOpen={!!selectedTaskForComments}
        onClose={() => setSelectedTaskForComments(null)}
        task={selectedTaskForComments}
      />
    </div>
  );
};
