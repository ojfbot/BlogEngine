import { Tile, Button } from '@carbon/react';
import { Notebook, Download, Upload } from '@carbon/icons-react';
import './DashboardSection.css';

function NotionDashboard() {
  return (
    <div className="dashboard-section">
      <h3>Notion Integration</h3>
      <p>Sync content with your Notion workspace</p>

      <Tile style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center' }}>
        <Notebook size={48} style={{ marginBottom: '1rem' }} />
        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Connect Notion</h4>
        <p style={{ color: 'var(--cds-text-secondary)', marginBottom: '1.5rem' }}>
          Connect your Notion workspace to start syncing content
        </p>
        <Button kind="primary">
          Connect Workspace
        </Button>
      </Tile>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <Tile style={{ padding: '2rem' }}>
          <Download size={32} style={{ marginBottom: '1rem' }} />
          <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Import from Notion</h4>
          <p style={{ color: 'var(--cds-text-secondary)', margin: 0 }}>
            Pull drafts and pages from Notion databases
          </p>
        </Tile>

        <Tile style={{ padding: '2rem' }}>
          <Upload size={32} style={{ marginBottom: '1rem' }} />
          <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Export to Notion</h4>
          <p style={{ color: 'var(--cds-text-secondary)', margin: 0 }}>
            Push published articles back to Notion
          </p>
        </Tile>
      </div>
    </div>
  );
}

export default NotionDashboard;
