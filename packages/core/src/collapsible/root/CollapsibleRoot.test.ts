import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import CollapsiblePanel from '../panel/CollapsiblePanel.vue'
import CollapsibleTrigger from '../trigger/CollapsibleTrigger.vue'
import CollapsibleRoot from './CollapsibleRoot.vue'

const PANEL_CONTENT = 'This is panel content'

function renderCollapsible(options: {
  defaultOpen?: boolean
  open?: boolean
  disabled?: boolean
  panelId?: string
} = {}) {
  const { defaultOpen, open, disabled, panelId } = options

  return render(
    defineComponent({
      components: { CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel },
      setup() {
        const rootProps: Record<string, unknown> = {
          defaultOpen,
          disabled,
        }
        if (open !== undefined) {
          rootProps.open = open
        }
        return { rootProps, panelId }
      },
      template: `
        <CollapsibleRoot v-bind="rootProps">
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsiblePanel :id="panelId">
            ${PANEL_CONTENT}
          </CollapsiblePanel>
        </CollapsibleRoot>
      `,
    }),
  )
}

describe('<CollapsibleRoot />', () => {
  describe('aRIA attributes', () => {
    it('sets ARIA attributes when open', () => {
      renderCollapsible({ defaultOpen: true })

      const trigger = screen.getByRole('button')
      const panel = screen.getByText(PANEL_CONTENT)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger).toHaveAttribute('aria-controls')
      expect(panel.getAttribute('id')).toBe(trigger.getAttribute('aria-controls'))
    })

    it('references manual panel id in trigger aria-controls', async () => {
      renderCollapsible({ defaultOpen: true, panelId: 'custom-panel-id' })
      await nextTick()

      const trigger = screen.getByRole('button')
      const panel = screen.getByText(PANEL_CONTENT)

      expect(panel).toHaveAttribute('id', 'custom-panel-id')
      expect(trigger).toHaveAttribute('aria-controls', 'custom-panel-id')
    })
  })

  describe('collapsible status', () => {
    it('disabled status', () => {
      renderCollapsible({ disabled: true })
      const trigger = screen.getByRole('button')
      expect(trigger).toHaveAttribute('data-disabled')
    })
  })

  describe('onOpenChange', () => {
    it('emits open-change with correct arguments', async () => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()

      const App = defineComponent({
        components: { CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel },
        setup() {
          return { handleOpenChange }
        },
        template: `
          <CollapsibleRoot @open-change="handleOpenChange">
            <CollapsibleTrigger>Toggle</CollapsibleTrigger>
            <CollapsiblePanel>
              ${PANEL_CONTENT}
            </CollapsiblePanel>
          </CollapsibleRoot>
        `,
      })

      render(App)

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      await user.click(trigger)

      expect(handleOpenChange).toHaveBeenCalledTimes(1)
      const [openArg, details] = handleOpenChange.mock.calls[0]
      expect(openArg).toBe(true)
      expect(details).toBeDefined()
      expect(details.reason).toBe('trigger-press')
      expect(details.event).toBeInstanceOf(MouseEvent)
      expect(details.isCanceled).toBe(false)
      expect(typeof details.cancel).toBe('function')
      expect(typeof details.allowPropagation).toBe('function')
    })
  })

  describe('open state', () => {
    it('uncontrolled mode', async () => {
      const user = userEvent.setup()
      renderCollapsible({ defaultOpen: false })

      const trigger = screen.getByRole('button')

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).not.toHaveAttribute('aria-controls')
      expect(screen.queryByText(PANEL_CONTENT)).toBeNull()

      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger).toHaveAttribute('aria-controls')
      expect(screen.queryByText(PANEL_CONTENT)).not.toBeNull()
      expect(screen.queryByText(PANEL_CONTENT)).toBeVisible()
      expect(screen.queryByText(PANEL_CONTENT)).toHaveAttribute('data-open')
      expect(trigger).toHaveAttribute('data-panel-open')

      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).not.toHaveAttribute('aria-controls')
      expect(screen.queryByText(PANEL_CONTENT)).toBeNull()
    })

    it('controlled mode', async () => {
      const user = userEvent.setup()

      const App = defineComponent({
        components: { CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel },
        setup() {
          const open = ref(false)
          return { open }
        },
        template: `
          <CollapsibleRoot :open="open">
            <CollapsibleTrigger>trigger</CollapsibleTrigger>
            <CollapsiblePanel>${PANEL_CONTENT}</CollapsiblePanel>
          </CollapsibleRoot>
          <button @click="open = !open">toggle</button>
        `,
      })

      render(App)

      const externalTrigger = screen.getByRole('button', { name: 'toggle' })
      const trigger = screen.getByRole('button', { name: 'trigger' })

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).not.toHaveAttribute('aria-controls')
      expect(screen.queryByText(PANEL_CONTENT)).toBeNull()

      await user.click(externalTrigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger).toHaveAttribute('aria-controls')
      expect(screen.queryByText(PANEL_CONTENT)).not.toBeNull()
      expect(screen.queryByText(PANEL_CONTENT)).toBeVisible()
      expect(screen.queryByText(PANEL_CONTENT)).toHaveAttribute('data-open')
      expect(trigger).toHaveAttribute('data-panel-open')

      await user.click(externalTrigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).not.toHaveAttribute('aria-controls')
      expect(screen.queryByText(PANEL_CONTENT)).toBeNull()
    })
  })

  describe('keyboard interactions', () => {
    (['Enter', 'Space'] as const).forEach((key) => {
      it(`key: ${key} should toggle the Collapsible`, async () => {
        const user = userEvent.setup()
        renderCollapsible({ defaultOpen: false })

        const trigger = screen.getByRole('button')

        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByText(PANEL_CONTENT)).toBeNull()

        await user.tab()
        expect(trigger).toHaveFocus()
        await user.keyboard(`[${key}]`)

        expect(trigger).toHaveAttribute('aria-expanded', 'true')
        expect(trigger).toHaveAttribute('aria-controls')
        expect(trigger).toHaveAttribute('data-panel-open')
        expect(screen.queryByText(PANEL_CONTENT)).not.toBeNull()
        expect(screen.queryByText(PANEL_CONTENT)).toBeVisible()
        expect(screen.queryByText(PANEL_CONTENT)).toHaveAttribute('data-open')

        await user.keyboard(`[${key}]`)

        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(trigger).not.toHaveAttribute('aria-controls')
        expect(trigger).not.toHaveAttribute('data-panel-open')
        expect(screen.queryByText(PANEL_CONTENT)).toBeNull()
      })
    })
  })
})
