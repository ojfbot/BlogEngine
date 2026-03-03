/**
 * BlogEngine SettingsPanel — exposed via MF './Settings' to the shell.
 *
 * Two-store architecture:
 *   Shell Redux: apiBaseUrl, notionApiUrl, defaultAuthor, autoPublish, autoSave,
 *                seoSuggestions — non-sensitive, persisted by shell.
 *   localStorage: anthropicApiKey, openaiApiKey, notionApiKey — sensitive keys,
 *                 explicit Save button, never in Redux.
 *
 * Connection status: probes GET /health on the BlogEngine API server.
 * Health URL is derived from the effective base URL (strips /api/v2 suffix
 * via URL constructor origin resolution).
 */

import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  TextInput,
  Toggle,
  Button,
  ButtonSet,
  FormGroup,
  InlineLoading,
  Tag,
} from '@carbon/react'
import { Renew } from '@carbon/icons-react'
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

// ── localStorage helpers ──────────────────────────────────────────────────────

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

// ── Connection status hook ────────────────────────────────────────────────────

type ConnStatus = 'idle' | 'checking' | 'connected' | 'unreachable'

function useConnectionStatus(apiBaseUrl: string) {
  const [status, setStatus] = useState<ConnStatus>('idle')

  const check = useCallback(async () => {
    setStatus('checking')
    try {
      // Resolve /health from the base URL origin (strips /api/v2 path prefix)
      const healthUrl = new URL('/health', apiBaseUrl || DEFAULT_API_BASE_URL).href
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000)
      const res = await fetch(healthUrl, { signal: controller.signal })
      clearTimeout(timer)
      setStatus(res.ok ? 'connected' : 'unreachable')
    } catch {
      setStatus('unreachable')
    }
  }, [apiBaseUrl])

  useEffect(() => { check() }, [check])

  return { status, recheck: check }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsPanel({ onClose: _onClose }: { onClose?: () => void }) {
  const dispatch = useDispatch()

  const stored =
    useSelector((s: any) => s?.settings?.apps?.['blogengine'] as BlogSettings | undefined) ?? BLOG_DEFAULTS

  const effectiveUrl = stored.apiBaseUrl || DEFAULT_API_BASE_URL
  const { status, recheck } = useConnectionStatus(stored.apiBaseUrl)

  const [apiBaseUrl, setApiBaseUrl] = useState(stored.apiBaseUrl)
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

        <div className="settings-connection-row">
          <ConnectionIndicator status={status} url={effectiveUrl} />
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Renew}
            iconDescription="Re-check"
            hasIconOnly
            onClick={recheck}
            disabled={status === 'checking'}
            className="settings-recheck-btn"
          />
        </div>

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

      {/* ── API Keys (localStorage only) ─────────────────────────────────── */}
      <FormGroup legendText="API Keys" className="settings-form-group">
        <p className="settings-info-text">
          Stored in browser localStorage only — never sent to Redux or a server. Dev-mode only.
        </p>
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

// ── Status indicator ──────────────────────────────────────────────────────────

function ConnectionIndicator({ status, url }: { status: ConnStatus; url: string }) {
  if (status === 'checking') {
    return (
      <InlineLoading
        description="Checking connection…"
        status="active"
        className="settings-conn-loading"
      />
    )
  }
  if (status === 'connected') {
    return (
      <span className="settings-conn-status">
        <Tag type="green" size="sm">Connected</Tag>
        <span className="settings-conn-url">{url}</span>
      </span>
    )
  }
  if (status === 'unreachable') {
    return (
      <span className="settings-conn-status">
        <Tag type="red" size="sm">Unreachable</Tag>
        <span className="settings-conn-url">{url}</span>
      </span>
    )
  }
  return null
}
