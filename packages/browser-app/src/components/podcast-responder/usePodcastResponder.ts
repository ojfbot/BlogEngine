import { useState } from 'react';
import type { MediaSource, Message, Step } from './types';

function generateCollaborativeResponse(_userInput: string, media: MediaSource): string {
  const responses: string[] = [
    `That's a fascinating perspective! Building on what you said, have you considered how this might connect to ${media.title}'s broader themes?`,
    `Yes, and taking that idea further... What if we explore an alternative angle? Perhaps there's an interesting parallel to other work in this space.`,
    `I love where you're going with this! That's an interesting direction. How does this relate to your own experiences or work?`,
    `Great insight! This reminds me of another perspective: what if we framed this as a collaborative exploration rather than a critique?`,
    `Interesting! Let's build on that thought. What would happen if we combined your idea with the original podcast's argument?`,
  ];
  const index = Math.floor(Math.random() * responses.length);
  return responses[index]!;
}

function generateResponderPost(media: MediaSource, messages: Message[]): string {
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
}

export function usePodcastResponder() {
  const [step, setStep] = useState<Step>('input');
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

    setConversation([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Great! Let's discuss "${mediaSource.title}". You mentioned: "${mediaSource.notes}". What aspect resonated with you the most, or what thoughts did it spark?`,
      },
    ]);
    setStep('chat');
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: currentMessage };
    const updatedConversation = [...conversation, userMessage];

    // TODO: replace with POST /api/v2/chat (respond_to_podcast intent) — Phase C (TECHDEBT TD-013)
    const response = generateCollaborativeResponse(currentMessage, mediaSource);
    const assistantMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: response };

    setConversation([...updatedConversation, assistantMessage]);
    setCurrentMessage('');
  };

  const handleGeneratePost = async () => {
    setIsGenerating(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const post = generateResponderPost(mediaSource, conversation);
    setGeneratedPost(post);
    setStep('preview');
    setIsGenerating(false);
  };

  const handleReset = () => {
    setStep('input');
    setMediaSource({ title: '', url: '', author: '', notes: '' });
    setConversation([]);
    setCurrentMessage('');
    setGeneratedPost('');
  };

  return {
    step,
    setStep,
    mediaSource,
    setMediaSource,
    conversation,
    currentMessage,
    setCurrentMessage,
    generatedPost,
    isGenerating,
    handleMediaSubmit,
    handleSendMessage,
    handleGeneratePost,
    handleReset,
  };
}
