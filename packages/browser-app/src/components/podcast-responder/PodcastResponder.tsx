import { Tag } from '@carbon/react';
import { Headphones } from '@carbon/icons-react';
import { usePodcastResponder } from './usePodcastResponder';
import MediaInputForm from './MediaInputForm';
import ConversationView from './ConversationView';
import PostPreview from './PostPreview';
import '../PodcastResponder.css';

function PodcastResponder() {
  const {
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
  } = usePodcastResponder();

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
        <MediaInputForm
          mediaSource={mediaSource}
          onMediaSourceChange={setMediaSource}
          onSubmit={handleMediaSubmit}
        />
      )}

      {step === 'chat' && (
        <ConversationView
          mediaSource={mediaSource}
          conversation={conversation}
          currentMessage={currentMessage}
          isGenerating={isGenerating}
          onCurrentMessageChange={setCurrentMessage}
          onSendMessage={handleSendMessage}
          onGeneratePost={handleGeneratePost}
        />
      )}

      {step === 'preview' && (
        <PostPreview
          generatedPost={generatedPost}
          onReset={handleReset}
          onSetStep={setStep}
        />
      )}
    </div>
  );
}

export default PodcastResponder;
