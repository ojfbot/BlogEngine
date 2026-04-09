import {
  TextArea,
  Button,
  Tile,
} from '@carbon/react';
import { Send } from '@carbon/icons-react';
import type { MediaSource, Message } from './types';

interface ConversationViewProps {
  mediaSource: MediaSource;
  conversation: Message[];
  currentMessage: string;
  isGenerating: boolean;
  onCurrentMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onGeneratePost: () => void;
}

function ConversationView({
  mediaSource,
  conversation,
  currentMessage,
  isGenerating,
  onCurrentMessageChange,
  onSendMessage,
  onGeneratePost,
}: ConversationViewProps) {
  return (
    <div className="conversation-section">
      <Tile className="media-context-bar">
        <strong>Discussing:</strong> {mediaSource.title}
        {mediaSource.author && ` by ${mediaSource.author}`}
      </Tile>

      <div className="conversation-messages">
        {conversation.map((msg) => (
          <div key={msg.id} className={`message message-${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
      </div>

      <div className="conversation-input">
        <TextArea
          id="user-message"
          labelText=""
          placeholder="Share your thoughts..."
          rows={2}
          value={currentMessage}
          onChange={(e) => onCurrentMessageChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
        />
        <div className="conversation-actions">
          <Button
            kind="secondary"
            size="sm"
            onClick={onGeneratePost}
            disabled={conversation.length < 2 || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Post'}
          </Button>
          <Button
            renderIcon={Send}
            size="sm"
            onClick={onSendMessage}
            disabled={!currentMessage.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConversationView;
