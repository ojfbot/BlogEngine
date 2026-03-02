import { useRef, useEffect, useCallback } from 'react';
import {
  TextInput,
  TextArea,
  Button,
  IconButton,
  Tile,
  InlineLoading,
} from '@carbon/react';
import { SendAlt, Minimize, ChatBot, Microphone } from '@carbon/icons-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addMessage,
  setDraftInput,
  setIsLoading,
  setDisplayState,
} from '../store/slices/chatSlice';
import MarkdownMessage from './MarkdownMessage';
import './CondensedChat.css';

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

  const isExpanded = displayState === 'expanded';
  const isMinimized = displayState === 'minimized';

  const inputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when expanding
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 100);
    }
  }, [isExpanded]);

  // Auto-scroll to bottom - direct scrollTop manipulation is more reliable
  const scrollToBottom = useCallback((smooth = false) => {
    // Use multiple RAF calls to ensure layout is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          if (smooth) {
            // Smooth animated scroll
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
          } else {
            // Instant scroll
            container.scrollTop = container.scrollHeight;
          }
        }
      });
    });
  }, []);

  // Auto-scroll when messages change (only when expanded)
  useEffect(() => {
    if (isExpanded && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isExpanded, scrollToBottom]);

  const handleSend = useCallback(async (messageText?: string) => {
    const textToSend = messageText || draftInput.trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: textToSend
    };

    dispatch(addMessage(userMessage));
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
  }, [draftInput, isLoading, dispatch]);

  const handleExecute = useCallback((message: string) => {
    console.log('[CondensedChat] handleExecute called with:', message);
    dispatch(setDraftInput(message));
    // Auto-send the message after a brief delay
    setTimeout(() => handleSend(message), 200);
  }, [dispatch, handleSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleInputFocus = useCallback(() => {
    // When not expanded, focusing the input expands the chat
    if (!isExpanded) {
      console.log('[CondensedChat] Input focused while not expanded - expanding chat');
      dispatch(setDisplayState('expanded'));
    }
  }, [isExpanded, dispatch]);

  return (
    <div
      className={`condensed-chat ${isExpanded ? 'expanded' : ''} ${isMinimized ? 'minimized' : ''} ${sidebarExpanded ? 'with-sidebar' : ''}`}
      data-element="chat-window"
      data-state={displayState}
    >
      <div
        className="condensed-header"
        onClick={() => {
          if (!isExpanded) {
            dispatch(setDisplayState('expanded'));
          }
        }}
        style={{ cursor: isExpanded ? 'default' : 'pointer' }}
      >
        <div className="header-left">
          <ChatBot size={20} />
          <span className="header-title">
            AI Assistant{chatSummary ? ` - ${chatSummary}` : ''}
          </span>
          {!isExpanded && isLoading && (
            <div className="header-thinking-spinner">
              <InlineLoading status="active" />
            </div>
          )}
          {!isExpanded && !isLoading && unreadCount > 0 && (
            <span className="unread-badge">new</span>
          )}
        </div>
        <div className="header-actions">
          {isExpanded && (
            <IconButton
              label="Minimize chat"
              data-element="chat-close-button"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(setDisplayState('collapsed'));
              }}
              size="sm"
              kind="ghost"
            >
              <Minimize size={16} />
            </IconButton>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="chat-messages-container" data-element="chat-messages" ref={messagesContainerRef}>
          {messages.map((msg, idx) => (
            <Tile
              key={idx}
              className={`message-tile ${msg.role}`}
            >
              <div className="message-header">
                <strong>{msg.role === 'user' ? '👤 You' : '🤖 Assistant'}</strong>
              </div>
              <div className="message-content">
                {msg.role === 'user' ? (
                  <div className="user-message">{msg.content}</div>
                ) : (
                  <MarkdownMessage
                    content={msg.content}
                    suggestions={msg.suggestions}
                    onExecute={handleExecute}
                    compact={true}
                  />
                )}
              </div>
            </Tile>
          ))}

          {isLoading && (
            <Tile className="message-tile assistant">
              <InlineLoading description="Thinking..." />
            </Tile>
          )}
        </div>
      )}

      {!isMinimized && (
        <div className="condensed-input-wrapper" data-element="condensed-chat-input-wrapper">
          <div className="textarea-container-condensed">
            {isExpanded ? (
              <TextArea
                ref={textAreaRef}
                labelText="Message"
                placeholder="Ask me anything..."
                value={draftInput}
                onChange={(e) => dispatch(setDraftInput(e.target.value))}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                disabled={isLoading}
                rows={3}
                className="condensed-chat-textarea"
                data-element="chat-input"
              />
            ) : (
              <TextInput
                ref={inputRef}
                id="condensed-input"
                labelText=""
                placeholder="Ask me anything..."
                value={draftInput}
                onChange={(e) => dispatch(setDraftInput(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onFocus={handleInputFocus}
                disabled={isLoading}
                size="md"
                data-element="chat-input"
              />
            )}
          </div>
          <div className="input-actions-condensed">
            <IconButton
              label="Voice input"
              onClick={() => {
                console.log('[CondensedChat] Microphone button clicked - functionality to be implemented');
                // TODO: Implement voice input functionality
              }}
              disabled={isLoading}
              className="microphone-button-input-condensed"
              kind="ghost"
              size="sm"
            >
              <Microphone size={20} />
            </IconButton>
            <Button
              renderIcon={SendAlt}
              onClick={() => handleSend()}
              disabled={!draftInput.trim() || isLoading}
              size="sm"
              kind="primary"
              hasIconOnly
              iconDescription="Send"
              className="send-button-inline-condensed"
              data-element="chat-send-button"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CondensedChat;
