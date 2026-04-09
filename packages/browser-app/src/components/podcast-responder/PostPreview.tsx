import {
  Button,
  Tile,
} from '@carbon/react';
import { Renew } from '@carbon/icons-react';
import type { Step } from './types';

interface PostPreviewProps {
  generatedPost: string;
  onReset: () => void;
  onSetStep: (step: Step) => void;
}

function PostPreview({ generatedPost, onReset, onSetStep }: PostPreviewProps) {
  return (
    <div className="preview-section">
      <div className="preview-header">
        <h4>Generated Responder Post</h4>
        <Button kind="secondary" renderIcon={Renew} onClick={onReset}>
          Start New
        </Button>
      </div>
      <Tile className="generated-content">
        <pre className="markdown-preview">{generatedPost}</pre>
      </Tile>
      <div className="preview-actions">
        {/* TODO: wire to Clipboard API — Phase C */}
        <Button kind="primary" size="sm" disabled title="Coming soon">Copy to Clipboard</Button>
        {/* TODO: wire to POST /api/v2/working-memory or library service — Phase C */}
        <Button kind="secondary" size="sm" disabled title="Coming soon">Save to Library</Button>
        <Button kind="tertiary" size="sm" onClick={() => onSetStep('chat')}>
          Back to Chat
        </Button>
      </div>
    </div>
  );
}

export default PostPreview;
