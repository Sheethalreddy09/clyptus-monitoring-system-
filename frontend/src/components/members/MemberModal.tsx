import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { User as UserType, Project, UserRole } from '../../types';
import api from '../../services/api';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  memberToEdit?: UserType | null;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  memberToEdit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('TEAM_MEMBER');
  const [projectRole, setProjectRole] = useState('Developer');
  const [projectId, setProjectId] = useState<number | string>('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get<Project[]>('/api/v1/projects');
        setProjects(res.data);
      } catch (err) {
        // silent
      }
    };
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name);
      setEmail(memberToEdit.email);
      setPassword('');
      setRole(memberToEdit.role);
      setProjectRole(memberToEdit.assigned_role || 'Developer');
      setProjectId('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('TEAM_MEMBER');
      setProjectRole('Developer');
      setProjectId('');
    }
    setError('');
  }, [memberToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required');
      return;
    }
    if (!memberToEdit && !password.trim()) {
      setError('Password is required for new users');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (memberToEdit) {
        await api.put(`/api/v1/users/${memberToEdit.id}`, {
          name: name.trim(),
          email: email.trim(),
          role,
          project_role: projectRole.trim(),
        });
      } else {
        await api.post('/api/v1/users', {
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
          project_role: projectRole.trim(),
          project_id: projectId ? Number(projectId) : null,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save team member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? 'Edit Team Member' : 'Create Team Member'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}

        <Input
          label="Full Name *"
          placeholder="e.g. John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email Address *"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {!memberToEdit && (
          <Input
            label="Password *"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="System Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { value: 'TEAM_MEMBER', label: 'Team Member' },
              { value: 'TEAM_LEAD', label: 'Team Lead' },
            ]}
          />

          <Input
            label="Project Role"
            placeholder="e.g. Frontend Dev, QA Tester"
            value={projectRole}
            onChange={(e) => setProjectRole(e.target.value)}
          />
        </div>

        {!memberToEdit && (
          <Select
            label="Add To Project (Optional)"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={[
              { value: '', label: '-- None --' },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {memberToEdit ? 'Save Changes' : 'Create Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
