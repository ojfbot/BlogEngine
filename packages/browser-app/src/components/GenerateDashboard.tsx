import { Tile } from '@carbon/react';
import { Document, Code, Book } from '@carbon/icons-react';
import './DashboardSection.css';

function GenerateDashboard() {
  return (
    <div className="generate-dashboard">
      <h3>Generate Content</h3>
      <p>Choose a content type to start creating</p>

      <div className="generate-grid">
        <Tile>
          <Document size={32} style={{ marginBottom: '1rem' }} />
          <h4>Blog Article</h4>
          <p>Create narrative blog posts and announcements</p>
        </Tile>

        <Tile>
          <Code size={32} style={{ marginBottom: '1rem' }} />
          <h4>Tutorial</h4>
          <p>Step-by-step guides with code examples</p>
        </Tile>

        <Tile>
          <Book size={32} style={{ marginBottom: '1rem' }} />
          <h4>Documentation</h4>
          <p>Technical docs and API references</p>
        </Tile>
      </div>
    </div>
  );
}

export default GenerateDashboard;
