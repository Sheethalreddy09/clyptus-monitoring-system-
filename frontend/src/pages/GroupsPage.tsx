import React, { useState, useEffect } from 'react';
import { Users2, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Group } from '../types';
import { GroupModal } from '../components/chat/GroupModal';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const { user } = useAuth();
  const isLead = user?.role === 'TEAM_LEAD';
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const res = await api.get<Group[]>('/api/v1/groups');
      setGroups(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      await api.delete(`/api/v1/groups/${groupId}`);
      fetchGroups();
    } catch (err) {
      alert('Failed to delete group');
    }
  };

  if (loading) return <LoadingSpinner message="Loading team groups..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Team Groups</h2>
          <p className="text-xs text-slate-500 mt-1">
            Create and manage group communication channels for project teams and sub-departments.
          </p>
        </div>

        {isLead && (
          <Button
            onClick={() => setIsGroupModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Create Group
          </Button>
        )}
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<Users2 className="w-8 h-8 text-blue-500" />}
          title="No groups created yet."
          description="Groups facilitate team discussions and group broadcasts. Create a group to bring team members together."
          action={
            isLead ? (
              <Button onClick={() => setIsGroupModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
                Create Group
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 font-bold">
                      <Users2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{group.name}</h3>
                      <span className="text-[11px] text-slate-400">
                        {group.member_count} Members
                      </span>
                    </div>
                  </div>

                  {isLead && (
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete Group"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                  {group.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/messages?group_id=${group.id}`)}
                  icon={<MessageSquare className="w-4 h-4" />}
                  className="w-full"
                >
                  Open Group Chat
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSuccess={fetchGroups}
      />
    </div>
  );
};
