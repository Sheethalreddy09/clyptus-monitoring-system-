import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { User, Project } from '../../types';
import api from '../../services/api';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get<User[]>('/api/v1/users');
        setMembers(res.data);
      } catch (err) {
        // silent
      }
    };
    if (isOpen) {
      fetchMembers();
      setName('');
      setDescription('');
      setSelectedMembers([]);
      setError('');
    }
  }, [isOpen]);

  const toggleMemberSelect = (userId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/api/v1/groups', {
        name: name.trim(),
        description: description.trim() || null,
        member_ids: selectedMembers,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Group" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}

        <Input
          label="Group Name *"
          placeholder="e.g. Frontend Team Chat"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            rows={2}
            className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Purpose of this group..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Add Group Members
          </label>
          <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50">
            {members.length === 0 ? (
              <p className="text-xs text-slate-400">No members available to add.</p>
            ) : (
              members.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center justify-between p-2 bg-white rounded-md border border-slate-100 cursor-pointer hover:bg-blue-50/50"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(m.id)}
                      onChange={() => toggleMemberSelect(m.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">{m.name}</span>
                    <span className="text-[10px] text-slate-400">({m.email})</span>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
};
