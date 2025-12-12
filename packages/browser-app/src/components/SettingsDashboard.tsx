import { Tile, TextInput, Toggle, Button } from '@carbon/react';
import { Save } from '@carbon/icons-react';
import './DashboardSection.css';

function SettingsDashboard() {
  return (
    <div className="settings-container">
      <h3>Settings</h3>
      <p>Configure your BlogEngine preferences</p>

      <Tile className="settings-section" style={{ padding: '2rem' }}>
        <h4>API Keys</h4>

        <TextInput
          id="anthropic-key"
          labelText="Anthropic API Key"
          placeholder="sk-ant-..."
          type="password"
          style={{ marginBottom: '1rem' }}
        />

        <TextInput
          id="openai-key"
          labelText="OpenAI API Key"
          placeholder="sk-..."
          type="password"
          style={{ marginBottom: '1rem' }}
        />

        <TextInput
          id="notion-key"
          labelText="Notion API Key"
          placeholder="secret_..."
          type="password"
        />
      </Tile>

      <Tile className="settings-section" style={{ padding: '2rem' }}>
        <h4>Preferences</h4>

        <Toggle
          id="auto-save"
          labelText="Auto-save drafts"
          defaultToggled
          style={{ marginBottom: '1rem' }}
        />

        <Toggle
          id="seo-suggestions"
          labelText="Show SEO suggestions"
          defaultToggled
        />
      </Tile>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Button kind="primary" renderIcon={Save}>
          Save Settings
        </Button>
        <Button kind="secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default SettingsDashboard;
