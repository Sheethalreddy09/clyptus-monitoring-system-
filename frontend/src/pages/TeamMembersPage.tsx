import React, { useState, useEffect } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import { User } from '../types';
import { MemberCard } from '../components/members/MemberCard';
import { MemberModal } from '../components/members/MemberModal';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const TeamMembersPage: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<User | null>(null);

  const { user } = useAuth();
  const isLead = user?.role === 'TEAM_LEAD';

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const url = search ? `/api/v1/users?query=${encodeURIComponent(search)}` : '/api/v1/users';
      const res = await api.get<User[]>(url);
      setMembers(res.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const handleToggleActive = async (member: User) => {
    try {
      await api.patch(`/api/v1/users/${member.id}/toggle-active`);
      fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to toggle user status');
    }
  };

  if (loading) return <LoadingSpinner message="Loading team members..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Team Members</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage organization team members, assign project roles, and activate or deactivate accounts.
          </p>
        </div>

        {isLead && (
          <Button
            onClick={() => {
              setMemberToEdit(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Create Member
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
          />
        </div>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-blue-500" />}
          title="No team members yet"
          description="Create team members to start assigning tasks, creating groups, and collaborating."
          action={
            isLead ? (
              <Button
                onClick={() => {
                  setMemberToEdit(null);
                  setIsModalOpen(true);
                }}
                icon={<Plus className="w-4 h-4" />}
              >
                Create Member
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              onToggleActive={handleToggleActive}
              onEdit={(mem) => {
                setMemberToEdit(mem);
                setIsModalOpen(true);
              }}
              isLead={isLead}
            />
          ))}
        </div>
      )}

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMembers}
        memberToEdit={memberToEdit}
      />
    </div>
  );
};
