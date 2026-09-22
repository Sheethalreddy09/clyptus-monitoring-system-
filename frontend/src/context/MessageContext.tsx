import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { UnreadMessagesCount } from '../types';

interface MessageContextType {
  unreadCount: number;
  unreadBySender: Record<string, number>;
  isBumping: boolean;
  refreshUnreadCount: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadBySender, setUnreadBySender] = useState<Record<string, number>>({});
  const [isBumping, setIsBumping] = useState<boolean>(false);

  const prevCountRef = useRef<number | null>(null);
  const bumpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshUnreadCount = useCallback(async () => {
    if (!token || !user) {
      setUnreadCount(0);
      setUnreadBySender({});
      prevCountRef.current = null;
      return;
    }

    try {
      const res = await api.get<UnreadMessagesCount>('/api/v1/messages/unread/count');
      const newCount = res.data.unread_count || 0;
      const senders = res.data.unread_by_sender || {};

      // Trigger subtle bump animation only when new unread messages arrive
      if (prevCountRef.current !== null && newCount > prevCountRef.current) {
        setIsBumping(true);
        if (bumpTimeoutRef.current) {
          clearTimeout(bumpTimeoutRef.current);
        }
        bumpTimeoutRef.current = setTimeout(() => {
          setIsBumping(false);
        }, 1200);
      }

      prevCountRef.current = newCount;
      setUnreadCount(newCount);
      setUnreadBySender(senders);
    } catch (err) {
      // silent fallback
    }
  }, [token, user]);

  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await api.post('/api/v1/messages/read-all');
      setUnreadCount(0);
      setUnreadBySender({});
      prevCountRef.current = 0;
    } catch (err) {
      // silent fallback
    }
  }, [token]);

  useEffect(() => {
    if (!token || !user) return;

    // Initial fetch
    refreshUnreadCount();

    // Poll every 4 seconds for real-time synchronization
    const interval = setInterval(refreshUnreadCount, 4000);

    // Refresh immediately when window/tab is focused
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUnreadCount();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refreshUnreadCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refreshUnreadCount);
      if (bumpTimeoutRef.current) {
        clearTimeout(bumpTimeoutRef.current);
      }
    };
  }, [token, user, refreshUnreadCount]);

  return (
    <MessageContext.Provider
      value={{
        unreadCount,
        unreadBySender,
        isBumping,
        refreshUnreadCount,
        markAllRead,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
};
