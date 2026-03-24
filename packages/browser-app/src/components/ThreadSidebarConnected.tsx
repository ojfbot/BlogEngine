import { useEffect, useMemo } from 'react';
import { ThreadSidebar } from '@ojfbot/frame-ui-components';
import type { ThreadItem } from '@ojfbot/frame-ui-components';
import '@ojfbot/frame-ui-components/styles/thread-sidebar';
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

function ThreadSidebarConnected({ isExpanded, onToggle }: ThreadSidebarConnectedProps) {
  const dispatch = useAppDispatch();
  const { threads: rawThreads, currentThreadId, isLoading, isCreatingThread } = useAppSelector(
    state => state.threads
  );

  // Map Thread (title optional) to ThreadItem (title required)
  const threads: ThreadItem[] = useMemo(
    () => rawThreads.map(t => ({
      threadId: t.threadId,
      title: t.title ?? 'Untitled conversation',
      updatedAt: t.updatedAt,
    })),
    [rawThreads]
  );

  // Load threads on mount
  useEffect(() => {
    const userId = getUserId();
    dispatch(fetchThreads({ userId }));
  }, [dispatch]);

  const handleCreateThread = async () => {
    const userId = getUserId();
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    await dispatch(createThread({
      userId,
      title: `Conversation - ${timestamp}`,
    }));
  };

  const handleSelectThread = (threadId: string) => {
    if (currentThreadId !== threadId) {
      dispatch(setCurrentThreadId(threadId));
      dispatch(fetchThread(threadId));
    }
  };

  const handleDeleteThread = (threadId: string) => {
    dispatch(deleteThread(threadId));
  };

  const handleRefresh = () => {
    const userId = getUserId();
    dispatch(fetchThreads({ userId }));
  };

  return (
    <ThreadSidebar
      isExpanded={isExpanded}
      onToggle={onToggle}
      threads={threads}
      currentThreadId={currentThreadId}
      isLoading={isLoading}
      isCreatingThread={isCreatingThread}
      onCreateThread={handleCreateThread}
      onSelectThread={handleSelectThread}
      onDeleteThread={handleDeleteThread}
      onRefresh={handleRefresh}
    />
  );
}

export default ThreadSidebarConnected;
