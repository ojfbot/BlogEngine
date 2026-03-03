/**
 * BlogEngine SettingsPanel — exposed via MF './Settings' to the shell.
 *
 * Shell provides the <Modal> chrome. This component owns form fields and
 * persistence across two stores:
 *
 *   Shell Redux (shared singleton via MF):
 *     apiBaseUrl, notionApiUrl, defaultAuthor, autoPublish, autoSave,
 *     seoSuggestions — non-sensitive preferences and connection config.
 *     Persisted by the shell's localStorage adapter in store/index.ts.
 *
 *   localStorage (this app's own keys):
 *     anthropicApiKey, openaiApiKey, notionApiKey — sensitive credentials.
 *     Never sent to Redux. Managed entirely within this panel.
 *
 * Dispatch pattern: sub-apps can't import from the shell (circular MF dep).
 * Use action type string — valid Redux, store is shared via MF singleton.
 */

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  TextInput,
  Toggle,
  Button,
  ButtonSet,
  FormGroup,
  InlineNotification,
} from '@carbon/react'
import { STORAGE_KEYS } from '../../constants.js'

const ACTION_TYPE = 'settings/updateBlogEngineSettings'
const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3006/api/v2'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BlogSettings {
  apiBaseUrl: string
  notionApiUrl: string
  defaultAuthor: string
  autoPublish: boolean
  autoSave: boolean
  seoSuggestions: boolean
}

interface LocalKeys {
  anthropicApiKey: string
  openaiApiKey: string
  notionApiKey: string
}

const BLOG_DEFAULTS: BlogSettings = {
  apiBaseUrl: '',
  notionApiUrl: '',
  defaultAuthor: '',
  autoPublish: false,
  autoSave: true,
  seoSuggestions: true,
}

// ── localStorage key helpers ──────────────────────────────────────────────────

function loadLocalKeys(): LocalKeys {
  return {
    anthropicApiKey: localStorage.getItem(STORAGE_KEYS.ANTHROPIC_API_KEY) ?? '',
    openaiApiKey:    localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY)    ?? '',
    notionApiKey:    localStorage.getItem(STORAGE_KEYS.NOTION_API_KEY)    ?? '',
  }
}

function saveLocalKeys(keys: LocalKeys): void {
  localStorage.setItem(STORAGE_KEYS.ANTHROPIC_API_KEY, keys.anthropicApiKey)
  localStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY,    keys.openaiApiKey)
  localStorage.setItem(STORAGE_KEYS.NOTION_API_KEY,    keys.notionApiKey)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsPanel({ onClose: _onClose }: { onClose?: () => void }) {
  const dispatch = useDispatch()

  // Non-sensitive settings from shell Redux
  const stored =
    useSelector((s: any) => s?.settings?.apps?.['blogengine'] as BlogSettings | undefined) ?? BLOG_DEFAULTS

  // API URL — save on blur
  const [apiBaseUrl, setApiBaseUrl] = useState(stored.apiBaseUrl)

  // Sensitive keys from localStorage (never in Redux)
  const [localKeys, setLocalKeys] = useState<LocalKeys>(loadLocalKeys)
  const [keysSaved, setKeysSaved] = useState(false)

  function handleApiUrlBlur() {
    const trimmed = apiBaseUrl.trim()
    if (trimmed !== stored.apiBaseUrl) {
      dispatch({ type: ACTION_TYPE, payload: { apiBaseUrl: trimmed } })
    }
  }

  function handleReduxChange(field: keyof BlogSettings, value: string | boolean) {
    dispatch({ type: ACTION_TYPE, payload: { [field]: value } })
  }

  function handleSaveKeys() {
    try {
      saveLocalKeys(localKeys)
      setKeysSaved(true)
      setTimeout(() => setKeysSaved(false), 2000)
    } catch (err) {
      console.error('[BlogEngine] Failed to save API keys to localStorage:', err)
    }
  }

  return (
    <div className="blog-settings-panel">
      {/* ── Connection ─────────────────────────────────────────────────────── */}
      <FormGroup legendText="Connection" className="settings-form-group">
        <TextInput
          id="blog-api-base-url"
          labelText="API base URL"
          helperText={`Default: ${DEFAULT_API_BASE_URL}`}
          placeholder={DEFAULT_API_BASE_URL}
          value={apiBaseUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiBaseUrl(e.target.value)}
          onBlur={handleApiUrlBlur}
        />
        <TextInput
          id="blog-notion-api-url"
          labelText="Notion integration URL"
          helperText="Notion API endpoint for publishing integration"
          placeholder="https://api.notion.com/v1/..."
          value={stored.notionApiUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleReduxChange('notionApiUrl', e.target.value)
          }
        />
      </FormGroup>

      {/* ── API Keys (localStorage only — never Redux) ────────────────────── */}
      <FormGroup legendText="API Keys" className="settings-form-group">
        <InlineNotification
          kind="info"
          title="Dev-mode only"
          subtitle="Keys are stored in browser localStorage and never sent to Redux or a server."
          lowContrast
          hideCloseButton
          className="settings-info-banner"
        />
        <TextInput
          id="blog-anthropic-key"
          labelText="Anthropic API Key"
          placeholder="sk-ant-..."
          type="password"
          value={localKeys.anthropicApiKey}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLocalKeys(k => ({ ...k, anthropicApiKey: e.target.value }))
          }
        />
        <TextInput
          id="blog-openai-key"
          labelText="OpenAI API Key"
          placeholder="sk-..."
          type="password"
          value={localKeys.openaiApiKey}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLocalKeys(k => ({ ...k, openaiApiKey: e.target.value }))
          }
        />
        <TextInput
          id="blog-notion-key"
          labelText="Notion API Key"
          placeholder="secret_..."
          type="password"
          value={localKeys.notionApiKey}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLocalKeys(k => ({ ...k, notionApiKey: e.target.value }))
          }
        />
        <ButtonSet style={{ marginTop: '0.75rem' }}>
          <Button
            kind={keysSaved ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleSaveKeys}
          >
            {keysSaved ? 'Saved' : 'Save API Keys'}
          </Button>
        </ButtonSet>
      </FormGroup>

      {/* ── Preferences ──────────────────────────────────────────────────── */}
      <FormGroup legendText="Preferences" className="settings-form-group">
        <TextInput
          id="blog-default-author"
          labelText="Default author"
          placeholder="Your name"
          value={stored.defaultAuthor}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleReduxChange('defaultAuthor', e.target.value)
          }
        />
        <Toggle
          id="blog-auto-save"
          labelText="Auto-save drafts"
          toggled={stored.autoSave}
          onToggle={(checked: boolean) => handleReduxChange('autoSave', checked)}
        />
        <Toggle
          id="blog-auto-publish"
          labelText="Auto-publish drafts"
          toggled={stored.autoPublish}
          onToggle={(checked: boolean) => handleReduxChange('autoPublish', checked)}
        />
        <Toggle
          id="blog-seo-suggestions"
          labelText="Show SEO suggestions"
          toggled={stored.seoSuggestions}
          onToggle={(checked: boolean) => handleReduxChange('seoSuggestions', checked)}
        />
      </FormGroup>
    </div>
  )
}
