import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import CollapsiblePanel from '../panel/CollapsiblePanel.vue'
import CollapsibleRoot from '../root/CollapsibleRoot.vue'
import CollapsibleTrigger from './CollapsibleTrigger.vue'

const PANEL_CONTENT = 'This is panel content'

describe('<CollapsibleTrigger />', () => {
  it('renders a native button by default', () => {
    render(
      defineComponent({
        components: { CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel },
        template: `
          <CollapsibleRoot>
            <CollapsibleTrigger>Trigger</CollapsibleTrigger>
            <CollapsiblePanel>${PANEL_CONTENT}</CollapsiblePanel>
          </CollapsibleRoot>
        `,
      }),
    )

    const trigger = screen.getByRole('button', { name: 'Trigger' })
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger).toHaveAttribute('type', 'button')
  })

  it('toggles panel on click', async () => {
    const user = userEvent.setup()

    render(
      defineComponent({
        components: { CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel },
        template: `
          <CollapsibleRoot>
            <CollapsibleTrigger>Recovery keys</CollapsibleTrigger>
            <CollapsiblePanel>${PANEL_CONTENT}</CollapsiblePanel>
          </CollapsibleRoot>
        `,
      }),
    )

    const trigger = screen.getByRole('button', { name: 'Recovery keys' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(PANEL_CONTENT)).toBeNull()

    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const panel = screen.queryByText(PANEL_CONTENT)
    expect(panel).not.toBeNull()
    expect(panel).toBeVisible()

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve())
      })
    })
    expect(panel).not.toHaveAttribute('data-starting-style')
  })
})
