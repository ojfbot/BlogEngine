import { Tile, Tag } from '@carbon/react';
import { Upload, LogoGithub, LogoMedium } from '@carbon/icons-react';
import './DashboardSection.css';

function PublishingDashboard() {
  const platforms = [
    { name: 'GitHub Pages', status: 'connected', color: 'green', icon: LogoGithub },
    { name: 'WordPress', status: 'disconnected', color: 'gray', icon: Upload },
    { name: 'Medium', status: 'disconnected', color: 'gray', icon: LogoMedium },
    { name: 'Dev.to', status: 'connected', color: 'green', icon: Upload },
  ];

  return (
    <div className="dashboard-section">
      <h3>Publishing Targets</h3>
      <p>Manage where your content gets published</p>

      <div className="platform-grid">
        {platforms.map(platform => {
          const IconComponent = platform.icon;
          return (
            <Tile key={platform.name}>
              <IconComponent size={32} style={{ marginBottom: '0.75rem' }} />
              <h4>{platform.name}</h4>
              <Tag type={platform.status === 'connected' ? 'green' : 'gray'} style={{ marginTop: '0.75rem' }}>
                {platform.status}
              </Tag>
            </Tile>
          );
        })}
      </div>
    </div>
  );
}

export default PublishingDashboard;
