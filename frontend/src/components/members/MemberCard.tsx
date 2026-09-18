import React from 'react';
import { User, Mail, Shield, ToggleLeft, ToggleRight, Edit } from 'lucide-react';
import { User as UserType } from '../../types';
import { Badge } from '../common/Badge';

interface MemberCardProps {
  member: UserType;
  onToggleActive?: (user: UserType) => void;
  onEdit?: (user: UserType) => void;
  isLead?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onToggleActive,
  onEdit,
  isLead = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center justify-center text-base border border-blue-200 shadow-xs">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">{member.name}</h3>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                <Mail className="w-3 h-3" />
                <span>{member.email}</span>
              </div>
            </div>
          </div>
          <Badge variant={member.is_active ? 'ACTIVE' : 'INACTIVE'} size="sm" />
        </div>

        <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>System Role:</span>
            <Badge variant={member.role} size="sm" />
          </div>
          {member.assigned_role && (
            <div className="flex justify-between items-center text-slate-600">
              <span>Project Role:</span>
              <span className="font-semibold text-slate-800">{member.assigned_role}</span>
            </div>
          )}
        </div>
      </div>

      {isLead && (
        <div className="flex items-center justify-end gap-2 pt-3">
          {onEdit && (
            <button
              onClick={() => onEdit(member)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
              title="Edit Member"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {onToggleActive && (
            <button
              onClick={() => onToggleActive(member)}
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                member.is_active
                  ? 'text-slate-600 hover:bg-red-50 hover:text-red-600'
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              {member.is_active ? (
                <>
                  <ToggleRight className="w-4 h-4 text-emerald-600" />
                  <span>Deactivate</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                  <span>Activate</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
