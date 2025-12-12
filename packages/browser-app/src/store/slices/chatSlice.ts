import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BadgeAction } from '../../components/BadgeButton';

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
        {
          label: 'Write Blog Post',
          icon: '📝',
          message: 'Write a blog post about TypeScript best practices',
          variant: 'purple',
        },
        {
          label: 'Create Tutorial',
          icon: '📚',
          message: 'Create a tutorial on React hooks',
          variant: 'purple',
        },
        {
          label: 'Generate Docs',
          icon: '📄',
          message: 'Generate API documentation for a REST service',
          variant: 'cyan',
        },
        {
          label: 'Draft Article',
          icon: '✍️',
          message: 'Draft a technical article about web performance optimization',
          variant: 'green',
        },
        {
          label: 'Content Strategy',
          icon: '🎯',
          message: 'Help me plan a content strategy for my tech blog',
          variant: 'blue',
        },
        {
          label: 'Brainstorm Ideas',
          icon: '💡',
          message: 'Brainstorm content ideas for developers learning JavaScript',
          variant: 'teal',
        },
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
