import type { Meta, StoryObj } from '@storybook/react'
import { BadgeButton, createSimpleBadge } from '@ojfbot/frame-ui-components'
import '@ojfbot/frame-ui-components/styles/badge-button'

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
    badgeAction: createSimpleBadge('Write Blog Post', '/write-blog', { variant: 'purple' }),
    onExecute: () => {},
  },
}

export const WithIcon: Story = {
  args: {
    badgeAction: createSimpleBadge('Generate Draft', '/generate-draft', { icon: '\u270D\uFE0F', variant: 'blue' }),
    onExecute: () => {},
  },
}

export const Disabled: Story = {
  args: {
    badgeAction: createSimpleBadge('Publish Article', '/publish', { variant: 'green', disabled: true }),
    onExecute: () => {},
  },
}

export const SmallSize: Story = {
  args: {
    badgeAction: createSimpleBadge('SEO Check', '/seo-check', { variant: 'cyan' }),
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
            badgeAction={createSimpleBadge(variant, `/${variant}`, { variant })}
            onExecute={() => {}}
          />
        ))}
      </div>
    )
  },
}
