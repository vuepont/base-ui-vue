import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import CollapsibleRoot from '../root/CollapsibleRoot.vue'
import CollapsibleTrigger from '../trigger/CollapsibleTrigger.vue'
import CollapsiblePanel from './CollapsiblePanel.vue'

const PANEL_CONTENT = 'This is panel content'

describe('<CollapsiblePanel />', () => {
  describe('prop: keepMounted', () => {
    it('does not unmount the panel when true', async () => {
      const user = userEvent.setup()

      const App = defineComponent({
        components: { CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel },
        setup() {
          const open = ref(false)
          function handleOpenChange(val: boolean) {
            open.value = val
          }
          return { open, handleOpenChange }
        },
        template: `
          <CollapsibleRoot :open="open" @open-change="handleOpenChange">
            <CollapsibleTrigger>Toggle</CollapsibleTrigger>
            <CollapsiblePanel keep-mounted>${PANEL_CONTENT}</CollapsiblePanel>
          </CollapsibleRoot>
        `,
      })

      render(App)

      const trigger = screen.getByRole('button')

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT)).not.toBeNull()
      expect(screen.queryByText(PANEL_CONTENT)).not.toBeVisible()
      expect(screen.queryByText(PANEL_CONTENT)).toHaveAttribute('data-closed')

      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger.getAttribute('aria-controls')).toBe(
        screen.queryByText(PANEL_CONTENT)?.getAttribute('id'),
      )
      expect(screen.queryByText(PANEL_CONTENT)).toBeVisible()
      expect(screen.queryByText(PANEL_CONTENT)).toHaveAttribute('data-open')
      expect(trigger).toHaveAttribute('data-panel-open')

      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger.getAttribute('aria-controls')).toBeNull()
      expect(screen.queryByText(PANEL_CONTENT)).not.toBeVisible()
      expect(screen.queryByText(PANEL_CONTENT)).toHaveAttribute('data-closed')
    })
  })

  describe('prop: hiddenUntilFound', () => {
    const supportsBeforeMatch
      = 'onbeforematch' in window
        && !window.navigator.userAgent.toLowerCase().includes('jsdom')

    it.skipIf(!supportsBeforeMatch)(
      'uses beforematch to open hidden panel',
      async () => {
        const handleOpenChange = vi.fn()

        render(
          defineComponent({
            components: {
              CollapsibleRoot,
              CollapsibleTrigger,
              CollapsiblePanel,
            },
            setup() {
              return { handleOpenChange }
            },
            template: `
              <CollapsibleRoot @open-change="handleOpenChange">
                <CollapsibleTrigger>Toggle</CollapsibleTrigger>
                <CollapsiblePanel hidden-until-found keep-mounted>
                  ${PANEL_CONTENT}
                </CollapsiblePanel>
              </CollapsibleRoot>
            `,
          }),
        )

        const panel = screen.getByText(PANEL_CONTENT)
        panel.dispatchEvent(
          new Event('beforematch', {
            bubbles: true,
            cancelable: false,
          }),
        )

        await nextTick()

        expect(handleOpenChange).toHaveBeenCalledTimes(1)
        expect(panel).toHaveAttribute('data-open')
      },
    )
  })

  it('keeps internal CSS variables ahead of user style overrides', () => {
    const App = defineComponent({
      components: { CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel },
      template: `
        <CollapsibleRoot :open="true">
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsiblePanel :style="{ '--collapsible-panel-height': '1px', '--collapsible-panel-width': '2px' }">
            ${PANEL_CONTENT}
          </CollapsiblePanel>
        </CollapsibleRoot>
      `,
    })

    render(App)
    const style = screen.getByText(PANEL_CONTENT).getAttribute('style') || ''

    expect(style).toContain('--collapsible-panel-height')
    expect(style).toContain('--collapsible-panel-width')
    expect(style).not.toContain('1px')
    expect(style).not.toContain('2px')
  })
})
