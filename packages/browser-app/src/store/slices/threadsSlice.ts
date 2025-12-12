import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Thread, ThreadWithMessages } from '@blogengine/agent-core';
import { apiClientV2 } from '../../api/client-v2';

export interface ThreadsState {
  threads: Thread[];
  currentThreadId: string | null;
  currentThread: ThreadWithMessages | null;
  isLoading: boolean;
  error: string | null;
  isCreatingThread: boolean;
  lastCreatedThreadId: string | null;
}

const initialState: ThreadsState = {
  threads: [],
  currentThreadId: null,
  currentThread: null,
  isLoading: false,
  error: null,
  isCreatingThread: false,
  lastCreatedThreadId: null,
};

/**
 * Async thunk to fetch all threads for a user
 */
export const fetchThreads = createAsyncThunk(
  'threads/fetchThreads',
  async (params: { userId?: string }) => {
    const threads = await apiClientV2.listThreads(params);
    return threads;
  }
);

/**
 * Async thunk to create a new thread
 */
export const createThread = createAsyncThunk(
  'threads/createThread',
  async (params: { userId?: string; title?: string; metadata?: Record<string, unknown> }) => {
    const thread = await apiClientV2.createThread(params);
    return thread;
  }
);

/**
 * Async thunk to fetch a specific thread with messages
 */
export const fetchThread = createAsyncThunk(
  'threads/fetchThread',
  async (threadId: string) => {
    const thread = await apiClientV2.getThread(threadId);
    return thread;
  }
);

/**
 * Async thunk to update a thread
 */
export const updateThread = createAsyncThunk(
  'threads/updateThread',
  async (params: { threadId: string; title?: string; metadata?: Record<string, unknown> }) => {
    const { threadId, ...updates } = params;
    const thread = await apiClientV2.updateThread(threadId, updates);
    return thread;
  }
);

/**
 * Async thunk to delete a thread
 */
export const deleteThread = createAsyncThunk(
  'threads/deleteThread',
  async (threadId: string) => {
    await apiClientV2.deleteThread(threadId);
    return threadId;
  }
);

const threadsSlice = createSlice({
  name: 'threads',
  initialState,
  reducers: {
    setCurrentThreadId: (state, action: PayloadAction<string | null>) => {
      state.currentThreadId = action.payload;
      // Find the thread in the list and set it as current
      if (action.payload) {
        const thread = state.threads.find(t => t.threadId === action.payload);
        if (thread) {
          state.currentThread = { ...thread, messages: [] };
        }
      } else {
        state.currentThread = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    addMessageToCurrentThread: (state, action: PayloadAction<{ role: 'user' | 'assistant'; content: string }>) => {
      if (state.currentThread) {
        state.currentThread.messages.push({
          messageId: crypto.randomUUID(),
          threadId: state.currentThread.threadId,
          role: action.payload.role,
          content: action.payload.content,
          createdAt: new Date().toISOString(),
        });
      }
    },
    clearThreads: (state) => {
      state.threads = [];
      state.currentThreadId = null;
      state.currentThread = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch threads
    builder
      .addCase(fetchThreads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.threads = action.payload;
      })
      .addCase(fetchThreads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch threads';
      });

    // Create thread
    builder
      .addCase(createThread.pending, (state) => {
        state.isCreatingThread = true;
        state.error = null;
      })
      .addCase(createThread.fulfilled, (state, action) => {
        state.isCreatingThread = false;
        state.threads.unshift(action.payload);
        state.currentThreadId = action.payload.threadId;
        state.currentThread = { ...action.payload, messages: [] };
        state.lastCreatedThreadId = action.payload.threadId;
      })
      .addCase(createThread.rejected, (state, action) => {
        state.isCreatingThread = false;
        state.error = action.error.message || 'Failed to create thread';
      });

    // Fetch thread
    builder
      .addCase(fetchThread.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchThread.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentThread = action.payload;
        state.currentThreadId = action.payload.threadId;
        // Update the thread in the list
        const index = state.threads.findIndex(t => t.threadId === action.payload.threadId);
        if (index !== -1) {
          state.threads[index] = action.payload;
        }
      })
      .addCase(fetchThread.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch thread';
      });

    // Update thread
    builder
      .addCase(updateThread.pending, (state) => {
        state.error = null;
      })
      .addCase(updateThread.fulfilled, (state, action) => {
        const index = state.threads.findIndex(t => t.threadId === action.payload.threadId);
        if (index !== -1) {
          state.threads[index] = action.payload;
        }
        if (state.currentThread?.threadId === action.payload.threadId) {
          state.currentThread = { ...state.currentThread, ...action.payload };
        }
      })
      .addCase(updateThread.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update thread';
      });

    // Delete thread
    builder
      .addCase(deleteThread.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.threads = state.threads.filter(t => t.threadId !== action.payload);
        if (state.currentThreadId === action.payload) {
          state.currentThreadId = null;
          state.currentThread = null;
        }
      })
      .addCase(deleteThread.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete thread';
      });
  },
});

export const {
  setCurrentThreadId,
  clearError,
  addMessageToCurrentThread,
  clearThreads,
} = threadsSlice.actions;

export default threadsSlice.reducer;
