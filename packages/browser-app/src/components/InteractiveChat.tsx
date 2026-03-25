import { useRef, useEffect, useCallback } from 'react';
import {
  TextArea,
  Button,
} from '@carbon/react';
import { SendAlt } from '@carbon/icons-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addMessage,
  setDraftInput,
  setIsLoading,
  markMessagesAsRead,
} from '../store/slices/chatSlice';
import {
  ChatMessage,
  MarkdownMessage,
  getChatMessage,
} from '@ojfbot/frame-ui-components';
import '@ojfbot/frame-ui-components/styles/markdown-message';
import '@ojfbot/frame-ui-components/styles/badge-button';
import type { BadgeAction } from '@ojfbot/frame-ui-components';
import './InteractiveChat.css';

function InteractiveChat() {
  const dispatch = useAppDispatch();
  const draftInput = useAppSelector(state => state.chat.draftInput);
  const messages = useAppSelector(state => state.chat.messages);
  const isLoading = useAppSelector(state => state.chat.isLoading);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(markMessagesAsRead());
  }, [dispatch]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async (messageText?: string) => {
    const text = messageText || draftInput.trim();
    if (!text || isLoading) return;

    dispatch(addMessage({ role: 'user', content: text }));
    dispatch(setDraftInput(''));
    dispatch(setIsLoading(true));

    // TODO: Connect to API
    setTimeout(() => {
      dispatch(addMessage({
        role: 'assistant',
        content: 'This is a placeholder response. API integration coming in Phase 2!'
      }));
      dispatch(setIsLoading(false));
    }, 1000);
  }, [draftInput, isLoading, dispatch]);

  const handleExecute = useCallback((action: BadgeAction) => {
    const msg = getChatMessage(action);
    if (msg) handleSend(msg);
  }, [handleSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="interactive-chat">
      <div className="chat-messages" ref={messagesContainerRef}>
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
        {isLoading && (
          <ChatMessage role="assistant" isStreaming>
            <span>Thinking...</span>
          </ChatMessage>
        )}
      </div>

      <div className="chat-input-container">
        <TextArea
          id="chat-input"
          labelText=""
          placeholder="Ask BlogEngine to generate content..."
          value={draftInput}
          onChange={(e) => dispatch(setDraftInput(e.target.value))}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={isLoading}
        />
        <Button
          kind="primary"
          renderIcon={SendAlt}
          onClick={() => handleSend()}
          disabled={!draftInput.trim() || isLoading}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export default InteractiveChat;
