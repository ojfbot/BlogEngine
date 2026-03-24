import { useCallback } from 'react';
import { IconButton } from '@carbon/react';
import { Microphone } from '@carbon/icons-react';
import { ChatShell, ChatMessage, MarkdownMessage, getChatMessage } from '@ojfbot/frame-ui-components';
import type { ChatDisplayState, BadgeAction } from '@ojfbot/frame-ui-components';
import '@ojfbot/frame-ui-components/styles/chat-shell';
import '@ojfbot/frame-ui-components/styles/markdown-message';
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

function CondensedChat({ sidebarExpanded = false }: CondensedChatProps) {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(state => state.chat.messages);
  const draftInput = useAppSelector(state => state.chat.draftInput);
  const isLoading = useAppSelector(state => state.chat.isLoading);
  const displayState = useAppSelector(state => state.chat.displayState);
  const unreadCount = useAppSelector(state => state.chat.unreadCount);
  const chatSummary = useAppSelector(state => state.chat.chatSummary);

  const handleSend = useCallback((messageText: string) => {
    if (isLoading) return;

    dispatch(addMessage({ role: 'user', content: messageText }));
    dispatch(setDraftInput(''));
    dispatch(setIsLoading(true));

    // TODO: Connect to API
    setTimeout(() => {
      dispatch(addMessage({
        role: 'assistant',
        content: 'Response from condensed chat. API integration coming in Phase 2!'
      }));
      dispatch(setIsLoading(false));
    }, 1000);
  }, [isLoading, dispatch]);

  const handleExecute = useCallback((badgeAction: BadgeAction) => {
    const message = getChatMessage(badgeAction);
    console.log('[CondensedChat] handleExecute called with:', message);
    if (message) {
      dispatch(setDraftInput(message));
      // Auto-send the message after a brief delay
      setTimeout(() => handleSend(message), 200);
    }
  }, [dispatch, handleSend]);

  const handleDisplayStateChange = useCallback((state: ChatDisplayState) => {
    dispatch(setDisplayState(state));
  }, [dispatch]);

  const microphoneButton = (
    <IconButton
      label="Voice input"
      onClick={() => {
        console.log('[CondensedChat] Microphone button clicked - functionality to be implemented');
        // TODO: Implement voice input functionality
      }}
      disabled={isLoading}
      kind="ghost"
      size="sm"
    >
      <Microphone size={20} />
    </IconButton>
  );

  return (
    <ChatShell
      displayState={displayState}
      onDisplayStateChange={handleDisplayStateChange}
      sidebarExpanded={sidebarExpanded}
      title={chatSummary ? `AI Assistant - ${chatSummary}` : 'AI Assistant'}
      isLoading={isLoading}
      unreadCount={unreadCount}
      draftInput={draftInput}
      onDraftChange={(value) => dispatch(setDraftInput(value))}
      onSend={handleSend}
      placeholder="Ask me anything..."
      inputDisabled={isLoading}
      inputExtra={microphoneButton}
    >
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} role={msg.role}>
          {msg.role === 'user' ? (
            <div className="user-message" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          ) : (
            <MarkdownMessage
              content={msg.content}
              suggestions={msg.suggestions}
              onExecute={handleExecute}
              compact={true}
            />
          )}
        </ChatMessage>
      ))}
    </ChatShell>
  );
}

export default CondensedChat;
