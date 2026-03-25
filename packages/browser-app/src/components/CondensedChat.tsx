import { useCallback } from 'react';
import { IconButton } from '@carbon/react';
import { Microphone } from '@carbon/icons-react';
import {
  ChatShell,
  ChatMessage,
  MarkdownMessage,
  getChatMessage,
} from '@ojfbot/frame-ui-components';
import '@ojfbot/frame-ui-components/styles/chat-shell';
import '@ojfbot/frame-ui-components/styles/markdown-message';
import '@ojfbot/frame-ui-components/styles/badge-button';
import type { ChatDisplayState, BadgeAction } from '@ojfbot/frame-ui-components';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addMessage,
  setDraftInput,
  setIsLoading,
  setDisplayState,
} from '../store/slices/chatSlice';

interface CondensedChatProps {
  sidebarExpanded?: boolean;
}

export default function CondensedChat({ sidebarExpanded = false }: CondensedChatProps) {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(state => state.chat.messages);
  const draftInput = useAppSelector(state => state.chat.draftInput);
  const isLoading = useAppSelector(state => state.chat.isLoading);
  const displayState = useAppSelector(state => state.chat.displayState) as ChatDisplayState;
  const unreadCount = useAppSelector(state => state.chat.unreadCount);
  const chatSummary = useAppSelector(state => state.chat.chatSummary);

  const handleSend = useCallback((message: string) => {
    if (!message || isLoading) return;

    dispatch(addMessage({ role: 'user', content: message }));
    dispatch(setDraftInput(''));
    dispatch(setIsLoading(true));

    // TODO: Connect to API
    setTimeout(() => {
      dispatch(addMessage({
        role: 'assistant',
        content: 'Response from condensed chat. API integration coming in Phase 2!',
      }));
      dispatch(setIsLoading(false));
    }, 1000);
  }, [isLoading, dispatch]);

  const handleExecute = useCallback((action: BadgeAction) => {
    const msg = getChatMessage(action);
    if (msg) handleSend(msg);
  }, [handleSend]);

  return (
    <ChatShell
      displayState={displayState}
      onDisplayStateChange={(state) => dispatch(setDisplayState(state))}
      sidebarExpanded={sidebarExpanded}
      title="AI Assistant"
      chatSummary={chatSummary}
      isLoading={isLoading}
      unreadCount={unreadCount}
      draftInput={draftInput}
      onDraftChange={(value) => dispatch(setDraftInput(value))}
      onSend={handleSend}
      onInputFocus={() => {
        if (displayState !== 'expanded') {
          dispatch(setDisplayState('expanded'));
        }
      }}
      placeholder="Ask me anything..."
      inputDisabled={isLoading}
      inputExtra={
        <IconButton
          label="Voice input"
          onClick={() => {
            // TODO: Implement voice input functionality
          }}
          disabled={isLoading}
          kind="ghost"
          size="sm"
        >
          <Microphone size={20} />
        </IconButton>
      }
    >
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} role={msg.role}>
          {msg.role === 'user' ? (
            <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
          ) : (
            <MarkdownMessage
              content={msg.content}
              suggestions={msg.suggestions}
              onExecute={handleExecute}
              compact
            />
          )}
        </ChatMessage>
      ))}
    </ChatShell>
  );
}
