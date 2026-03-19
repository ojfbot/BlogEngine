import type { Meta, StoryObj } from '@storybook/react'
import PublishingDashboard from './PublishingDashboard'

const meta: Meta<typeof PublishingDashboard> = {
  title: 'Dashboards/PublishingDashboard',
  component: PublishingDashboard,
}

export default meta
type Story = StoryObj<typeof PublishingDashboard>

export const Default: Story = {}

export const InDarkBackground: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
}
