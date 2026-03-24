import type { Meta, StoryObj } from '@storybook/react'
import { MarkdownMessage, createSimpleBadge } from '@ojfbot/frame-ui-components'
import '@ojfbot/frame-ui-components/styles/markdown-message'

const meta: Meta<typeof MarkdownMessage> = {
  title: 'Components/MarkdownMessage',
  component: MarkdownMessage,
}

export default meta
type Story = StoryObj<typeof MarkdownMessage>

export const PlainText: Story = {
  args: {
    content: 'Here is a simple blog post summary. The article covers modern CSS techniques including container queries, cascade layers, and the `:has()` selector.',
  },
}

export const RichMarkdown: Story = {
  args: {
    content: `# Blog Post: Modern CSS Techniques

## Container Queries

Container queries let you style elements based on the **size of their container** rather than the viewport.

\`\`\`css
@container (min-width: 400px) {
  .card { grid-template-columns: 1fr 1fr; }
}
\`\`\`

## Key Takeaways

- Container queries are now supported in all major browsers
- Cascade layers provide better specificity management
- The \`:has()\` selector enables parent-based styling

> "CSS has never been more powerful." — A random developer

Visit the [MDN docs](https://developer.mozilla.org) for more.`,
  },
}

export const WithSuggestions: Story = {
  args: {
    content: 'Your draft is ready for review. What would you like to do next?',
    suggestions: [
      createSimpleBadge('Publish Now', '/publish', { variant: 'green' }),
      createSimpleBadge('Edit Draft', '/edit', { variant: 'blue' }),
      createSimpleBadge('SEO Analysis', '/seo', { variant: 'cyan' }),
    ],
    onExecute: () => {},
  },
}

export const WithActionLinks: Story = {
  args: {
    content: `I found 3 blog drafts that need attention:

1. [Edit "CSS Grid Deep Dive"](action:/edit-draft/css-grid)
2. [Review "React Server Components"](action:/review/rsc)
3. [Publish "TypeScript 5.4 Features"](action:/publish/ts54)

Click any link above to take action.`,
  },
}
