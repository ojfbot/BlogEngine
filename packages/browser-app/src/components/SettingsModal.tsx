import { useState, useEffect } from 'react';
import { Modal } from '@carbon/react';
import { SettingsForm, loadSettings, saveSettings, SettingsFormData } from './SettingsDashboard';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Settings modal component.
 * Opens from header action, allows saving/canceling changes.
 * Persists settings to localStorage on save.
 */
function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<SettingsFormData>(loadSettings());
  const [initialSettings, setInitialSettings] = useState<SettingsFormData>(loadSettings());

  // Load fresh settings when modal opens
  useEffect(() => {
    if (open) {
      const currentSettings = loadSettings();
      setSettings(currentSettings);
      setInitialSettings(currentSettings);
    }
  }, [open]);

  const handleSave = () => {
    saveSettings(settings);
    onClose();
  };

  const handleCancel = () => {
    // Revert to initial settings
    setSettings(initialSettings);
    onClose();
  };

  return (
    <Modal
      open={open}
      onRequestClose={handleCancel}
      onRequestSubmit={handleSave}
      modalHeading="Settings"
      modalLabel="BlogEngine"
      primaryButtonText="Save"
      secondaryButtonText="Cancel"
      size="md"
      preventCloseOnClickOutside={false}
    >
      <SettingsForm settings={settings} onChange={setSettings} />
    </Modal>
  );
}

export default SettingsModal;
