import type { Meta, StoryObj } from '@storybook/react'
import BadgeButton from './BadgeButton'

const meta: Meta<typeof BadgeButton> = {
  title: 'Components/BadgeButton',
  component: BadgeButton,
  argTypes: {
    onExecute: { action: 'executed' },
  },
}

export default meta
type Story = StoryObj<typeof BadgeButton>

export const Default: Story = {
  args: {
    badgeAction: {
      label: 'Write Blog Post',
      message: '/write-blog',
      variant: 'purple',
    },
    onExecute: () => {},
  },
}

export const WithIcon: Story = {
  args: {
    badgeAction: {
      label: 'Generate Draft',
      icon: '\u270D\uFE0F',
      message: '/generate-draft',
      variant: 'blue',
    },
    onExecute: () => {},
  },
}

export const Disabled: Story = {
  args: {
    badgeAction: {
      label: 'Publish Article',
      message: '/publish',
      variant: 'green',
      disabled: true,
    },
    onExecute: () => {},
  },
}

export const SmallSize: Story = {
  args: {
    badgeAction: {
      label: 'SEO Check',
      message: '/seo-check',
      variant: 'cyan',
    },
    onExecute: () => {},
    size: 'sm',
  },
}

export const AllVariants: Story = {
  render: () => {
    const variants = ['purple', 'blue', 'cyan', 'teal', 'green', 'gray', 'red', 'magenta'] as const
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {variants.map((variant) => (
          <BadgeButton
            key={variant}
            badgeAction={{
              label: variant,
              message: `/${variant}`,
              variant,
            }}
            onExecute={() => {}}
          />
        ))}
      </div>
    )
  },
}
