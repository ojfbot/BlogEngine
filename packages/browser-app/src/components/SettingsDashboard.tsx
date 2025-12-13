import { useState } from 'react';
import { Tile, TextInput, Toggle } from '@carbon/react';
import { STORAGE_KEYS } from '../constants.js';
import './DashboardSection.css';

export interface SettingsFormData {
  anthropicApiKey: string;
  openaiApiKey: string;
  notionApiKey: string;
  autoSave: boolean;
  seoSuggestions: boolean;
}

interface SettingsFormProps {
  settings: SettingsFormData;
  onChange: (settings: SettingsFormData) => void;
}

// Load settings from localStorage
export function loadSettings(): SettingsFormData {
  return {
    anthropicApiKey: localStorage.getItem(STORAGE_KEYS.ANTHROPIC_API_KEY) || '',
    openaiApiKey: localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY) || '',
    notionApiKey: localStorage.getItem(STORAGE_KEYS.NOTION_API_KEY) || '',
    autoSave: localStorage.getItem(STORAGE_KEYS.AUTO_SAVE) !== 'false', // default true
    seoSuggestions: localStorage.getItem(STORAGE_KEYS.SEO_SUGGESTIONS) !== 'false', // default true
  };
}

// Save settings to localStorage
export function saveSettings(settings: SettingsFormData): void {
  localStorage.setItem(STORAGE_KEYS.ANTHROPIC_API_KEY, settings.anthropicApiKey);
  localStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY, settings.openaiApiKey);
  localStorage.setItem(STORAGE_KEYS.NOTION_API_KEY, settings.notionApiKey);
  localStorage.setItem(STORAGE_KEYS.AUTO_SAVE, String(settings.autoSave));
  localStorage.setItem(STORAGE_KEYS.SEO_SUGGESTIONS, String(settings.seoSuggestions));
}

/**
 * Reusable settings form component that can be used in a modal or standalone.
 * This component is controlled - parent manages state and persistence.
 */
export function SettingsForm({ settings, onChange }: SettingsFormProps) {
  const handleChange = (field: keyof SettingsFormData, value: string | boolean) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="settings-form">
      <Tile className="settings-section" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h4 style={{ marginBottom: '1rem' }}>API Keys</h4>
        <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
          Note: API keys are stored in browser localStorage (dev-mode only)
        </p>

        <TextInput
          id="anthropic-key"
          labelText="Anthropic API Key"
          placeholder="sk-ant-..."
          type="password"
          value={settings.anthropicApiKey}
          onChange={(e) => handleChange('anthropicApiKey', e.target.value)}
          style={{ marginBottom: '1rem' }}
        />

        <TextInput
          id="openai-key"
          labelText="OpenAI API Key"
          placeholder="sk-..."
          type="password"
          value={settings.openaiApiKey}
          onChange={(e) => handleChange('openaiApiKey', e.target.value)}
          style={{ marginBottom: '1rem' }}
        />

        <TextInput
          id="notion-key"
          labelText="Notion API Key"
          placeholder="secret_..."
          type="password"
          value={settings.notionApiKey}
          onChange={(e) => handleChange('notionApiKey', e.target.value)}
        />
      </Tile>

      <Tile className="settings-section" style={{ padding: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem' }}>Preferences</h4>

        <Toggle
          id="auto-save"
          labelText="Auto-save drafts"
          toggled={settings.autoSave}
          onToggle={(checked) => handleChange('autoSave', checked)}
          style={{ marginBottom: '1rem' }}
        />

        <Toggle
          id="seo-suggestions"
          labelText="Show SEO suggestions"
          toggled={settings.seoSuggestions}
          onToggle={(checked) => handleChange('seoSuggestions', checked)}
        />
      </Tile>
    </div>
  );
}

/**
 * Legacy dashboard version - kept for backwards compatibility if needed.
 * New code should use SettingsModal instead.
 */
function SettingsDashboard() {
  const [settings, setSettings] = useState<SettingsFormData>(loadSettings());

  return (
    <div className="settings-container">
      <h3>Settings</h3>
      <p>Configure your BlogEngine preferences</p>
      <SettingsForm settings={settings} onChange={setSettings} />
    </div>
  );
}

export default SettingsDashboard;
