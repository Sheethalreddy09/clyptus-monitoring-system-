import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Users2, User as UserIcon } from 'lucide-react';
import { User, Group, Message, GroupMessage } from '../types';
import { ChatWindow } from '../components/chat/ChatWindow';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialGroupId = searchParams.get('group_id');

  const [activeTab, setActiveTab] = useState<'direct' | 'group'>(initialGroupId ? 'group' : 'direct');
  const [members, setMembers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [messages, setMessages] = useState<(Message | GroupMessage)[]>([]);
  const [loading, setLoading] = useState(true);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const [usersRes, groupsRes] = await Promise.all([
          api.get<User[]>('/api/v1/users'),
          api.get<Group[]>('/api/v1/groups'),
        ]);

        const filteredUsers = usersRes.data.filter((u) => u.id !== currentUser?.id);
        setMembers(filteredUsers);
        setGroups(groupsRes.data);

        if (initialGroupId) {
          const matchedGrp = groupsRes.data.find((g) => g.id === Number(initialGroupId));
          if (matchedGrp) {
            setSelectedGroup(matchedGrp);
            setActiveTab('group');
          }
        } else if (filteredUsers.length > 0) {
          setSelectedUser(filteredUsers[0]);
        }
      } catch (err) {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [currentUser?.id, initialGroupId]);

  const fetchChatMessages = async () => {
    try {
      if (activeTab === 'direct' && selectedUser) {
        const res = await api.get<Message[]>(`/api/v1/messages/${selectedUser.id}`);
        setMessages(res.data);
      } else if (activeTab === 'group' && selectedGroup) {
        const res = await api.get<GroupMessage[]>(`/api/v1/messages/groups/${selectedGroup.id}`);
        setMessages(res.data);
      }
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 3000); // 3s polling for real-time messages
    return () => clearInterval(interval);
  }, [activeTab, selectedUser, selectedGroup]);

  const handleSendMessage = async (text: string) => {
    if (activeTab === 'direct' && selectedUser) {
      await api.post('/api/v1/messages', {
        receiver_id: selectedUser.id,
        message: text,
      });
    } else if (activeTab === 'group' && selectedGroup) {
      await api.post('/api/v1/messages/groups', {
        group_id: selectedGroup.id,
        message: text,
      });
    }
    fetchChatMessages();
  };

  if (loading) return <LoadingSpinner message="Loading chat channels..." />;

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar Channels (1/3) */}
      <div className="w-80 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex bg-slate-200/80 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab('direct');
                if (!selectedUser && members.length > 0) setSelectedUser(members[0]);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'direct' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Direct Chat</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('group');
                if (!selectedGroup && groups.length > 0) setSelectedGroup(groups[0]);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'group' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              <span>Groups ({groups.length})</span>
            </button>
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {activeTab === 'direct' ? (
            members.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No members available to message.</div>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedUser(m)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    selectedUser?.id === m.id ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center text-xs border border-blue-200">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{m.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{m.role.replace('_', ' ')}</div>
                  </div>
                </div>
              ))
            )
          ) : groups.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No groups created yet.</div>
          ) : (
            groups.map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedGroup(g)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                  selectedGroup?.id === g.id ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center justify-center text-xs border border-indigo-200">
                  <Users2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{g.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{g.member_count} members</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area (2/3) */}
      <div className="flex-1 h-full">
        {activeTab === 'direct' && selectedUser ? (
          <ChatWindow
            recipientName={selectedUser.name}
            recipientSubtitle={selectedUser.email}
            messages={messages}
            currentUserId={currentUser?.id || 0}
            onSendMessage={handleSendMessage}
            emptyMessageText="No messages yet. Start the conversation."
          />
        ) : activeTab === 'group' && selectedGroup ? (
          <ChatWindow
            recipientName={selectedGroup.name}
            recipientSubtitle={`${selectedGroup.member_count} Group Members`}
            messages={messages}
            currentUserId={currentUser?.id || 0}
            onSendMessage={handleSendMessage}
            emptyMessageText="No group messages yet. Broadcast the first message!"
          />
        ) : (
          <div className="h-full bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mb-2 text-slate-300" />
            <p className="text-sm font-medium">Select a team member or group to view messages.</p>
          </div>
        )}
      </div>
    </div>
  );
};
