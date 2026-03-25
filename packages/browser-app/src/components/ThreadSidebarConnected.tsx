import { useEffect } from 'react';
import { ThreadSidebar } from '@ojfbot/frame-ui-components';
import '@ojfbot/frame-ui-components/styles/thread-sidebar';
import type { ThreadItem } from '@ojfbot/frame-ui-components';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchThreads,
  createThread,
  deleteThread,
  setCurrentThreadId,
  fetchThread,
} from '../store/slices/threadsSlice';
import { getUserId } from '../utils/user';

interface ThreadSidebarConnectedProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ThreadSidebarConnected({ isExpanded, onToggle }: ThreadSidebarConnectedProps) {
  const dispatch = useAppDispatch();
  const { threads, currentThreadId, isLoading, isCreatingThread } = useAppSelector(
    state => state.threads
  );

  // Load threads on mount
  useEffect(() => {
    const userId = getUserId();
    dispatch(fetchThreads({ userId }));
  }, [dispatch]);

  const threadItems: ThreadItem[] = threads.map(t => ({
    threadId: t.threadId,
    title: t.title || 'Untitled conversation',
    updatedAt: t.updatedAt,
  }));

  return (
    <ThreadSidebar
      isExpanded={isExpanded}
      onToggle={onToggle}
      threads={threadItems}
      currentThreadId={currentThreadId}
      isLoading={isLoading}
      isCreatingThread={isCreatingThread}
      title="Conversations"
      onCreateThread={() => {
        const userId = getUserId();
        const timestamp = new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
        dispatch(createThread({ userId, title: `Conversation - ${timestamp}` }));
      }}
      onSelectThread={(threadId) => {
        if (currentThreadId !== threadId) {
          dispatch(setCurrentThreadId(threadId));
          dispatch(fetchThread(threadId));
        }
      }}
      onDeleteThread={(threadId) => dispatch(deleteThread(threadId))}
      onRefresh={() => {
        const userId = getUserId();
        dispatch(fetchThreads({ userId }));
      }}
    />
  );
}
