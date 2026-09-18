import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Task, Project, User, TaskPriority, TaskStatus } from '../../types';
import api from '../../services/api';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskToEdit?: Task | null;
  defaultProjectId?: number;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  taskToEdit,
  defaultProjectId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<number | string>('');
  const [assignedTo, setAssignedTo] = useState<number | string>('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(0);

  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          api.get<Project[]>('/api/v1/projects'),
          api.get<User[]>('/api/v1/users'),
        ]);
        setProjects(projRes.data);
        setMembers(userRes.data);
      } catch (err) {
        // silent error
      }
    };
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setProjectId(taskToEdit.project_id);
      setAssignedTo(taskToEdit.assigned_to || '');
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setDueDate(taskToEdit.due_date ? taskToEdit.due_date.split('T')[0] : '');
      setEstimatedHours(taskToEdit.estimated_hours || 0);
    } else {
      setTitle('');
      setDescription('');
      setProjectId(defaultProjectId || (projects.length > 0 ? projects[0].id : ''));
      setAssignedTo('');
      setPriority('MEDIUM');
      setStatus('TODO');
      setDueDate('');
      setEstimatedHours(0);
    }
    setError('');
  }, [taskToEdit, isOpen, defaultProjectId, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!projectId) {
      setError('Please select a project');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        project_id: Number(projectId),
        assigned_to: assignedTo ? Number(assignedTo) : null,
        priority,
        status,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        estimated_hours: Number(estimatedHours) || 0,
      };

      if (taskToEdit) {
        await api.put(`/api/v1/tasks/${taskToEdit.id}`, payload);
      } else {
        await api.post('/api/v1/tasks', payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task' : 'Create New Task'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}

        <Input
          label="Task Title *"
          placeholder="e.g. Implement JWT authentication middleware"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Detailed description of requirements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Project *"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={[
              { value: '', label: '-- Select Project --' },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />

          <Select
            label="Assign To"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            options={[
              { value: '', label: '-- Unassigned --' },
              ...members.map((m) => ({ value: m.id, label: `${m.name} (${m.email})` })),
            ]}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
            ]}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={[
              { value: 'TODO', label: 'TODO' },
              { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
              { value: 'REVIEW', label: 'REVIEW' },
              { value: 'COMPLETED', label: 'COMPLETED' },
            ]}
          />

          <Input
            label="Estimated Hours"
            type="number"
            step="0.5"
            min="0"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
