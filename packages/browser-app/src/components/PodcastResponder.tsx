import { useState } from 'react';
import {
  TextInput,
  TextArea,
  Button,
  Form,
  Stack,
  Tile,
  Tag,
} from '@carbon/react';
import { Headphones, Send, Renew } from '@carbon/icons-react';
import './PodcastResponder.css';

interface MediaSource {
  title: string;
  url: string;
  author?: string;
  notes?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function PodcastResponder() {
  const [step, setStep] = useState<'input' | 'chat' | 'preview'>('input');
  const [mediaSource, setMediaSource] = useState<MediaSource>({
    title: '',
    url: '',
    author: '',
    notes: '',
  });
  const [conversation, setConversation] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaSource.title || !mediaSource.notes) {
      return;
    }

    // Move to chat step with initial assistant message
    setConversation([
      {
        role: 'assistant',
        content: `Great! Let's discuss "${mediaSource.title}". You mentioned: "${mediaSource.notes}". What aspect resonated with you the most, or what thoughts did it spark?`,
      },
    ]);
    setStep('chat');
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = { role: 'user', content: currentMessage };
    const updatedConversation = [...conversation, userMessage];

    // Generate a collaborative response
    const response = generateCollaborativeResponse(currentMessage, mediaSource);
    const assistantMessage: Message = { role: 'assistant', content: response };

    setConversation([...updatedConversation, assistantMessage]);
    setCurrentMessage('');
  };

  const generateCollaborativeResponse = (_userInput: string, media: MediaSource): string => {
    // Mock collaborative AI responses
    const responses: string[] = [
      `That's a fascinating perspective! Building on what you said, have you considered how this might connect to ${media.title}'s broader themes?`,
      `Yes, and taking that idea further... What if we explore an alternative angle? Perhaps there's an interesting parallel to other work in this space.`,
      `I love where you're going with this! That's an interesting direction. How does this relate to your own experiences or work?`,
      `Great insight! This reminds me of another perspective: what if we framed this as a collaborative exploration rather than a critique?`,
      `Interesting! Let's build on that thought. What would happen if we combined your idea with the original podcast's argument?`,
    ];
    const index = Math.floor(Math.random() * responses.length);
    return responses[index]!;
  };

  const handleGeneratePost = async () => {
    setIsGenerating(true);

    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate responder-style blog post
    const post = generateResponderPost(mediaSource, conversation);
    setGeneratedPost(post);
    setStep('preview');
    setIsGenerating(false);
  };

  const generateResponderPost = (media: MediaSource, messages: Message[]): string => {
    const userThoughts = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' ');

    return `# I Was Listening to "${media.title}" and It Made Me Think...

${media.author ? `*A response to ${media.author}'s podcast episode*\n` : ''}

## The Context

Recently, I came across "${media.title}"${media.url ? ` ([listen here](${media.url}))` : ''}, and it really got me thinking. ${media.notes}

## My Initial Reaction

${userThoughts.slice(0, 200)}...

## Building on the Ideas

What struck me most was how this connects to broader patterns we see in the industry. Rather than simply agreeing or disagreeing, I found myself asking: what if we took this idea even further?

**The "yes, and..." perspective:**
The podcast makes an excellent point about the core concept, and building on that foundation, we might also consider alternative approaches that complement rather than contradict the original argument.

## An Interesting Other Direction

While listening, I kept thinking about adjacent possibilities. What if we approached this from a different angle entirely? Not to dismiss the original perspective, but to explore parallel paths that might yield additional insights.

## Where This Could Go

The conversation doesn't end here. I'm curious to explore:
- How these ideas might evolve over time
- What other perspectives could add to this discussion
- Where the intersection of different viewpoints might lead

## Final Thoughts

This is less about having the final word and more about continuing the conversation. The podcast raised important questions, and I'm grateful for the opportunity to think alongside these ideas rather than simply about them.

**What do you think?** Have you listened to this episode? What other directions might this conversation take?

---

*This is a conversational response to media I've encountered, written in the spirit of collaborative exploration rather than critique. All perspectives are offered as additions to the ongoing dialogue.*
`;
  };

  const handleReset = () => {
    setStep('input');
    setMediaSource({ title: '', url: '', author: '', notes: '' });
    setConversation([]);
    setCurrentMessage('');
    setGeneratedPost('');
  };

  return (
    <div className="podcast-responder">
      <div className="responder-header-compact">
        <h4>
          <Headphones size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Podcast Responder
        </h4>
        <Tag size="sm" type="purple">Beta</Tag>
      </div>

      {step === 'input' && (
        <Form onSubmit={handleMediaSubmit} className="media-input-form">
          <Stack gap={4}>
            <TextInput
              id="media-title"
              labelText="Podcast/Episode Title *"
              placeholder="e.g., 'The Future of AI' by Tech Talks"
              value={mediaSource.title}
              onChange={(e) => setMediaSource({ ...mediaSource, title: e.target.value })}
              size="sm"
              required
            />
            <div className="form-row">
              <TextInput
                id="media-url"
                labelText="URL (optional)"
                placeholder="https://..."
                value={mediaSource.url}
                onChange={(e) => setMediaSource({ ...mediaSource, url: e.target.value })}
                size="sm"
              />
              <TextInput
                id="media-author"
                labelText="Author/Host (optional)"
                placeholder="e.g., Jane Smith"
                value={mediaSource.author}
                onChange={(e) => setMediaSource({ ...mediaSource, author: e.target.value })}
                size="sm"
              />
            </div>
            <TextArea
              id="media-notes"
              labelText="What resonated with you? *"
              placeholder="e.g., 'The discussion about creativity in the age of AI...'"
              rows={3}
              value={mediaSource.notes}
              onChange={(e) => setMediaSource({ ...mediaSource, notes: e.target.value })}
              required
            />
            <Button type="submit" size="sm" disabled={!mediaSource.title || !mediaSource.notes}>
              Start Conversation
            </Button>
          </Stack>
        </Form>
      )}

      {step === 'chat' && (
        <div className="conversation-section">
          <Tile className="media-context-bar">
            <strong>Discussing:</strong> {mediaSource.title}
            {mediaSource.author && ` by ${mediaSource.author}`}
          </Tile>

          <div className="conversation-messages">
            {conversation.map((msg, idx) => (
              <div key={idx} className={`message message-${msg.role}`}>
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
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="conversation-actions">
              <Button
                kind="secondary"
                size="sm"
                onClick={handleGeneratePost}
                disabled={conversation.length < 2 || isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Post'}
              </Button>
              <Button
                renderIcon={Send}
                size="sm"
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="preview-section">
          <div className="preview-header">
            <h4>Generated Responder Post</h4>
            <Button kind="secondary" renderIcon={Renew} onClick={handleReset}>
              Start New
            </Button>
          </div>
          <Tile className="generated-content">
            <pre className="markdown-preview">{generatedPost}</pre>
          </Tile>
          <div className="preview-actions">
            <Button kind="primary" size="sm">Copy to Clipboard</Button>
            <Button kind="secondary" size="sm">Save to Library</Button>
            <Button kind="tertiary" size="sm" onClick={() => setStep('chat')}>
              Back to Chat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PodcastResponder;
