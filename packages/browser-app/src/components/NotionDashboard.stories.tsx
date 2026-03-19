import type { Meta, StoryObj } from '@storybook/react'
import NotionDashboard from './NotionDashboard'

const meta: Meta<typeof NotionDashboard> = {
  title: 'Dashboards/NotionDashboard',
  component: NotionDashboard,
}

export default meta
type Story = StoryObj<typeof NotionDashboard>

export const Default: Story = {}

export const InDarkBackground: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
}
