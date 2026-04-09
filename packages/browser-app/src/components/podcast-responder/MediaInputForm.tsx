import {
  TextInput,
  TextArea,
  Button,
  Form,
  Stack,
} from '@carbon/react';
import type { MediaSource } from './types';

interface MediaInputFormProps {
  mediaSource: MediaSource;
  onMediaSourceChange: (source: MediaSource) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function MediaInputForm({ mediaSource, onMediaSourceChange, onSubmit }: MediaInputFormProps) {
  return (
    <Form onSubmit={onSubmit} className="media-input-form">
      <Stack gap={4}>
        <TextInput
          id="media-title"
          labelText="Podcast/Episode Title *"
          placeholder="e.g., 'The Future of AI' by Tech Talks"
          value={mediaSource.title}
          onChange={(e) => onMediaSourceChange({ ...mediaSource, title: e.target.value })}
          size="sm"
          required
        />
        <div className="form-row">
          <TextInput
            id="media-url"
            labelText="URL (optional)"
            placeholder="https://..."
            value={mediaSource.url}
            onChange={(e) => onMediaSourceChange({ ...mediaSource, url: e.target.value })}
            size="sm"
          />
          <TextInput
            id="media-author"
            labelText="Author/Host (optional)"
            placeholder="e.g., Jane Smith"
            value={mediaSource.author}
            onChange={(e) => onMediaSourceChange({ ...mediaSource, author: e.target.value })}
            size="sm"
          />
        </div>
        <TextArea
          id="media-notes"
          labelText="What resonated with you? *"
          placeholder="e.g., 'The discussion about creativity in the age of AI...'"
          rows={3}
          value={mediaSource.notes}
          onChange={(e) => onMediaSourceChange({ ...mediaSource, notes: e.target.value })}
          required
        />
        <Button type="submit" size="sm" disabled={!mediaSource.title || !mediaSource.notes}>
          Start Conversation
        </Button>
      </Stack>
    </Form>
  );
}

export default MediaInputForm;
