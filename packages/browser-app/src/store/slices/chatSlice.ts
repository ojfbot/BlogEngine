import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BadgeAction } from '@ojfbot/frame-ui-components';
import { createSimpleBadge } from '@ojfbot/frame-ui-components';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: BadgeAction[];
}

type DisplayState = 'minimized' | 'collapsed' | 'expanded';

export interface ChatState {
  messages: ChatMessage[];
  draftInput: string;
  isLoading: boolean;
  streamingContent: string;
  chatSummary: string;
  displayState: DisplayState;
  unreadCount: number;
}

const initialState: ChatState = {
  messages: [
    {
      role: 'assistant',
      content: `# Welcome to BlogEngine 👋

Your AI-powered content creation assistant. I can help you explore multiple content formats, manage different writing contexts, and juggle various topics simultaneously across the tabs above.

**Choose an action to begin:**`,
      suggestions: [
        createSimpleBadge('Write Blog Post', 'Write a blog post about TypeScript best practices', { icon: '📝', variant: 'purple' }),
        createSimpleBadge('Create Tutorial', 'Create a tutorial on React hooks', { icon: '📚', variant: 'purple' }),
        createSimpleBadge('Generate Docs', 'Generate API documentation for a REST service', { icon: '📄', variant: 'cyan' }),
        createSimpleBadge('Draft Article', 'Draft a technical article about web performance optimization', { icon: '✍️', variant: 'green' }),
        createSimpleBadge('Content Strategy', 'Help me plan a content strategy for my tech blog', { icon: '🎯', variant: 'blue' }),
        createSimpleBadge('Brainstorm Ideas', 'Brainstorm content ideas for developers learning JavaScript', { icon: '💡', variant: 'teal' }),
      ],
    },
  ],
  draftInput: '',
  isLoading: false,
  streamingContent: '',
  chatSummary: '',
  displayState: 'collapsed',
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
      if (action.payload.role === 'assistant' && state.displayState !== 'expanded') {
        state.unreadCount += 1;
      }
    },
    setDraftInput: (state, action: PayloadAction<string>) => {
      state.draftInput = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setStreamingContent: (state, action: PayloadAction<string>) => {
      state.streamingContent = action.payload;
    },
    setChatSummary: (state, action: PayloadAction<string>) => {
      state.chatSummary = action.payload;
    },
    setDisplayState: (state, action: PayloadAction<DisplayState>) => {
      state.displayState = action.payload;
      if (action.payload === 'expanded') {
        state.unreadCount = 0;
      }
    },
    markMessagesAsRead: (state) => {
      state.unreadCount = 0;
    },
    clearChat: (state) => {
      state.messages = [
        {
          role: 'assistant',
          content: `# Welcome back! 👋\n\nHow can I help you with your content today?`,
        },
      ];
      state.draftInput = '';
      state.streamingContent = '';
      state.chatSummary = '';
      state.unreadCount = 0;
    },
  },
});

export const {
  addMessage,
  setDraftInput,
  setIsLoading,
  setStreamingContent,
  setChatSummary,
  setDisplayState,
  markMessagesAsRead,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
