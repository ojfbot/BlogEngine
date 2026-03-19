import type { Meta, StoryObj } from '@storybook/react'
import { SettingsForm, SettingsFormData } from './SettingsDashboard'

const meta: Meta<typeof SettingsForm> = {
  title: 'Components/SettingsForm',
  component: SettingsForm,
  argTypes: {
    onChange: { action: 'changed' },
  },
}

export default meta
type Story = StoryObj<typeof SettingsForm>

const defaultSettings: SettingsFormData = {
  anthropicApiKey: '',
  openaiApiKey: '',
  notionApiKey: '',
  autoSave: true,
  seoSuggestions: true,
}

export const Empty: Story = {
  args: {
    settings: defaultSettings,
    onChange: () => {},
  },
}

export const WithApiKeys: Story = {
  args: {
    settings: {
      anthropicApiKey: 'sk-ant-api03-XXXX',
      openaiApiKey: 'sk-proj-XXXX',
      notionApiKey: 'secret_XXXX',
      autoSave: true,
      seoSuggestions: false,
    },
    onChange: () => {},
  },
}

export const AllTogglesOff: Story = {
  args: {
    settings: {
      ...defaultSettings,
      autoSave: false,
      seoSuggestions: false,
    },
    onChange: () => {},
  },
}
