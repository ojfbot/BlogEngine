import type { Meta, StoryObj } from '@storybook/react'
import GenerateDashboard from './GenerateDashboard'

const meta: Meta<typeof GenerateDashboard> = {
  title: 'Dashboards/GenerateDashboard',
  component: GenerateDashboard,
}

export default meta
type Story = StoryObj<typeof GenerateDashboard>

export const Default: Story = {}

export const InDarkBackground: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
}
