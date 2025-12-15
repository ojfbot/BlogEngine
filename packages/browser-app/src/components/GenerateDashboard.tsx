import { useState } from 'react';
import { Tile, ClickableTile, Button } from '@carbon/react';
import { Document, Code, Book, Headphones, ArrowLeft } from '@carbon/icons-react';
import PodcastResponder from './PodcastResponder';
import './DashboardSection.css';

type ContentType = 'blog' | 'tutorial' | 'documentation' | 'podcast-responder' | null;

function GenerateDashboard() {
  const [selectedType, setSelectedType] = useState<ContentType>(null);

  if (selectedType === 'podcast-responder') {
    return (
      <div className="generate-dashboard">
        <Button
          kind="ghost"
          renderIcon={ArrowLeft}
          onClick={() => setSelectedType(null)}
          style={{ marginBottom: '1rem' }}
        >
          Back to Content Types
        </Button>
        <PodcastResponder />
      </div>
    );
  }

  if (selectedType) {
    return (
      <div className="generate-dashboard">
        <Button
          kind="ghost"
          renderIcon={ArrowLeft}
          onClick={() => setSelectedType(null)}
          style={{ marginBottom: '1rem' }}
        >
          Back to Content Types
        </Button>
        <Tile>
          <h3>{selectedType === 'blog' ? 'Blog Article' : selectedType === 'tutorial' ? 'Tutorial' : 'Documentation'}</h3>
          <p>Coming soon: Full content generation flow for {selectedType}</p>
        </Tile>
      </div>
    );
  }

  return (
    <div className="generate-dashboard">
      <h3>Generate Content</h3>
      <p>Choose a content type to start creating</p>

      <div className="generate-grid">
        <ClickableTile onClick={() => setSelectedType('blog')}>
          <Document size={32} style={{ marginBottom: '1rem' }} />
          <h4>Blog Article</h4>
          <p>Create narrative blog posts and announcements</p>
        </ClickableTile>

        <ClickableTile onClick={() => setSelectedType('tutorial')}>
          <Code size={32} style={{ marginBottom: '1rem' }} />
          <h4>Tutorial</h4>
          <p>Step-by-step guides with code examples</p>
        </ClickableTile>

        <ClickableTile onClick={() => setSelectedType('documentation')}>
          <Book size={32} style={{ marginBottom: '1rem' }} />
          <h4>Documentation</h4>
          <p>Technical docs and API references</p>
        </ClickableTile>

        <ClickableTile onClick={() => setSelectedType('podcast-responder')}>
          <Headphones size={32} style={{ marginBottom: '1rem' }} />
          <h4>Podcast Responder</h4>
          <p>Create thoughtful, collaborative responses to podcasts and media</p>
        </ClickableTile>
      </div>
    </div>
  );
}

export default GenerateDashboard;
