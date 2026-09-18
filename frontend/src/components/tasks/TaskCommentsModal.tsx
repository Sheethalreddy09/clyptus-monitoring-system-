import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Send, User as UserIcon, Paperclip, Download, Trash2, MessageSquare, FileText } from 'lucide-react';
import { Task, TaskComment, TaskAttachment } from '../../types';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface TaskCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export const TaskCommentsModal: React.FC<TaskCommentsModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'comments' | 'attachments'>('comments');
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTaskDetails = async () => {
    if (!task) return;
    setLoading(true);
    try {
      const res = await api.get<Task>(`/api/v1/tasks/${task.id}`);
      setComments(res.data.comments || []);
      const attRes = await api.get<TaskAttachment[]>(`/api/v1/tasks/${task.id}/attachments`);
      setAttachments(attRes.data || []);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && task) {
      fetchTaskDetails();
    }
  }, [isOpen, task]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;

    setPosting(true);
    try {
      await api.post(`/api/v1/tasks/${task.id}/comments`, { comment: newComment.trim() });
      setNewComment('');
      fetchTaskDetails();
    } catch (err) {
      // silent
    } finally {
      setPosting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !task) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await api.post(`/api/v1/tasks/${task.id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchTaskDetails();
    } catch (err) {
      // silent
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attId: number) => {
    if (!task) return;
    try {
      await api.delete(`/api/v1/tasks/attachments/${attId}`);
      fetchTaskDetails();
    } catch (err) {
      // silent
    }
  };

  const handleDownloadAttachment = async (attId: number, fileName: string) => {
    try {
      const res = await api.get(`/api/v1/tasks/attachments/${attId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      // silent
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? `Task: ${task.title}` : 'Task Details'}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Tab Selector */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('comments')}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments ({comments.length})</span>
          </button>
          <button
            type="button"
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'attachments'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('attachments')}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Attachments ({attachments.length})</span>
          </button>
        </div>

        {activeTab === 'comments' ? (
          <div className="space-y-4">
            {/* Comment list */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {comments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                  No comments on this task yet. Be the first to comment!
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[9px] font-bold">
                          {c.user?.name ? c.user.name.charAt(0).toUpperCase() : <UserIcon className="w-2.5 h-2.5" />}
                        </div>
                        <span>{c.user?.name || 'User'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.created_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed pl-5">{c.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post new comment form */}
            <form onSubmit={handlePostComment} className="pt-2 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button type="submit" size="sm" loading={posting} icon={<Send className="w-3.5 h-3.5" />}>
                Send
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Attachments List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {attachments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                  No attachments uploaded yet. Upload documents, diagrams, or specifications.
                </div>
              ) : (
                attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-medium text-slate-700 truncate">{att.file_name}</p>
                        <p className="text-[10px] text-slate-400">
                          {formatFileSize(att.file_size)} • {new Date(att.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(att.id, att.file_name)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {(user?.role === 'TEAM_LEAD' || user?.id === att.user_id) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(att.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Upload Attachment */}
            <div className="pt-2 border-t border-slate-100">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                loading={uploading}
                icon={<Paperclip className="w-3.5 h-3.5" />}
                onClick={() => fileInputRef.current?.click()}
                className="w-full justify-center"
              >
                {uploading ? 'Uploading...' : 'Upload Attachment'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

