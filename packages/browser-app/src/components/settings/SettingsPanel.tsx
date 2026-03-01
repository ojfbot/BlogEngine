/**
 * BlogEngine SettingsPanel — bare panel exposed via MF './Settings' to the shell.
 *
 * Shell provides the <Modal> chrome; this component owns form state, persistence,
 * and Save/Cancel actions. Calls onClose() after a successful save so the shell
 * can close the modal.
 *
 * localStorage keys are managed by SettingsDashboard's saveSettings / loadSettings.
 */

import { useState } from 'react'
import { Button } from '@carbon/react'
import { SettingsForm, loadSettings, saveSettings } from '../SettingsDashboard.js'
import type { SettingsFormData } from '../SettingsDashboard.js'

interface SettingsPanelProps {
  onClose: () => void
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState<SettingsFormData>(loadSettings)

  function handleSave() {
    saveSettings(settings)
    onClose()
  }

  function handleCancel() {
    setSettings(loadSettings()) // reset dirty state before the shell closes/hides the panel
    onClose()
  }

  return (
    <div>
      <SettingsForm settings={settings} onChange={setSettings} />
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <Button kind="ghost" onClick={handleCancel}>Cancel</Button>
        <Button kind="primary" onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}
