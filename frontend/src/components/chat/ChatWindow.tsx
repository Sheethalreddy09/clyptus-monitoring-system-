import React, { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Users2 } from 'lucide-react';
import { Message, GroupMessage, User } from '../../types';
import { Button } from '../common/Button';

interface ChatWindowProps {
  recipientName: string;
  recipientSubtitle?: string;
  messages: (Message | GroupMessage)[];
  currentUserId: number;
  onSendMessage: (text: string) => Promise<void>;
  emptyMessageText?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  recipientName,
  recipientSubtitle,
  messages,
  currentUserId,
  onSendMessage,
  emptyMessageText = 'No messages yet. Start the conversation!',
}) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    try {
      await onSendMessage(text.trim());
      setText('');
    } catch (err) {
      // silent
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center text-sm border border-blue-200">
          {recipientName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">{recipientName}</h3>
          {recipientSubtitle && <p className="text-[11px] text-slate-500">{recipientSubtitle}</p>}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 min-h-[300px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Users2 className="w-8 h-8 mb-2 text-slate-300" />
            <p className="text-sm font-medium">{emptyMessageText}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const senderName = msg.sender?.name || (isMe ? 'You' : 'Member');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-[10px] font-semibold text-slate-400 mb-1 px-1">
                    {senderName}
                  </span>
                )}

                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {msg.message}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
        />
        <Button type="submit" loading={sending} icon={<Send className="w-4 h-4" />}>
          Send
        </Button>
      </form>
    </div>
  );
};
