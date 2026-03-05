import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import AccordionHeader from '../header/AccordionHeader.vue'
import AccordionItem from '../item/AccordionItem.vue'
import AccordionPanel from '../panel/AccordionPanel.vue'
import AccordionTrigger from '../trigger/AccordionTrigger.vue'
import AccordionRoot from './AccordionRoot.vue'

function renderAccordion(
  options: {
    defaultValue?: any[]
    value?: any[]
    disabled?: boolean
    multiple?: boolean
  } = {},
) {
  const { defaultValue, value, disabled, multiple } = options

  return render(
    defineComponent({
      components: {
        AccordionRoot,
        AccordionItem,
        AccordionHeader,
        AccordionTrigger,
        AccordionPanel,
      },
      setup() {
        const rootProps: Record<string, unknown> = {
          defaultValue,
          disabled,
          multiple,
        }
        if (value !== undefined) {
          rootProps.value = value
        }
        return { rootProps }
      },
      template: `
        <AccordionRoot v-bind="rootProps">
          <AccordionItem value="item-1">
            <AccordionHeader>
              <AccordionTrigger>Trigger 1</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel 1 content</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionHeader>
              <AccordionTrigger>Trigger 2</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel 2 content</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionHeader>
              <AccordionTrigger>Trigger 3</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel 3 content</AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      `,
    }),
  )
}

describe('<AccordionRoot />', () => {
  describe('rendering', () => {
    it('renders all items closed by default', () => {
      renderAccordion()

      expect(screen.queryByText('Panel 1 content')).toBeNull()
      expect(screen.queryByText('Panel 2 content')).toBeNull()
      expect(screen.queryByText('Panel 3 content')).toBeNull()
    })

    it('renders with defaultValue', () => {
      renderAccordion({ defaultValue: ['item-1'] })

      expect(screen.queryByText('Panel 1 content')).not.toBeNull()
      expect(screen.queryByText('Panel 2 content')).toBeNull()
    })

    it('renders with role="region"', () => {
      renderAccordion()
      expect(screen.getByRole('region')).toBeDefined()
    })
  })

  describe('single mode', () => {
    it('opens one item at a time by default', async () => {
      const user = userEvent.setup()
      renderAccordion()

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      await user.click(trigger1)
      expect(screen.queryByText('Panel 1 content')).not.toBeNull()
      expect(screen.queryByText('Panel 2 content')).toBeNull()

      await user.click(trigger2)
      expect(screen.queryByText('Panel 1 content')).toBeNull()
      expect(screen.queryByText('Panel 2 content')).not.toBeNull()
    })

    it('clicking the same trigger closes the item', async () => {
      const user = userEvent.setup()
      renderAccordion()

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })

      await user.click(trigger1)
      expect(screen.queryByText('Panel 1 content')).not.toBeNull()

      await user.click(trigger1)
      expect(screen.queryByText('Panel 1 content')).toBeNull()
    })
  })

  describe('multiple mode', () => {
    it('allows multiple items open at the same time', async () => {
      const user = userEvent.setup()
      renderAccordion({ multiple: true })

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      await user.click(trigger1)
      await user.click(trigger2)

      expect(screen.queryByText('Panel 1 content')).not.toBeNull()
      expect(screen.queryByText('Panel 2 content')).not.toBeNull()
    })
  })

  describe('disabled', () => {
    it('disables all triggers when root is disabled', async () => {
      renderAccordion({ disabled: true })
      await nextTick()

      const triggers = screen.getAllByRole('button')
      triggers.forEach((trigger) => {
        expect(trigger).toHaveAttribute('aria-disabled', 'true')
      })
    })
  })

  describe('value-change event', () => {
    it('emits value-change with correct arguments', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()

      const App = defineComponent({
        components: {
          AccordionRoot,
          AccordionItem,
          AccordionHeader,
          AccordionTrigger,
          AccordionPanel,
        },
        setup() {
          return { handleValueChange }
        },
        template: `
          <AccordionRoot @value-change="handleValueChange">
            <AccordionItem value="item-1">
              <AccordionHeader>
                <AccordionTrigger>Trigger 1</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>Panel 1</AccordionPanel>
            </AccordionItem>
          </AccordionRoot>
        `,
      })

      render(App)

      await user.click(screen.getByRole('button', { name: 'Trigger 1' }))

      expect(handleValueChange).toHaveBeenCalledTimes(1)
      const [value, details] = handleValueChange.mock.calls[0]
      expect(value).toEqual(['item-1'])
      expect(details).toBeDefined()
      expect(typeof details.cancel).toBe('function')
    })
  })

  describe('controlled mode', () => {
    it('respects controlled value prop', async () => {
      const user = userEvent.setup()

      const App = defineComponent({
        components: {
          AccordionRoot,
          AccordionItem,
          AccordionHeader,
          AccordionTrigger,
          AccordionPanel,
        },
        setup() {
          const value = ref<string[]>([])
          function handleValueChange(newValue: string[]) {
            value.value = newValue
          }
          return { value, handleValueChange }
        },
        template: `
          <AccordionRoot :value="value" @value-change="handleValueChange">
            <AccordionItem value="item-1">
              <AccordionHeader>
                <AccordionTrigger>Trigger 1</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>Panel 1</AccordionPanel>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionHeader>
                <AccordionTrigger>Trigger 2</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>Panel 2</AccordionPanel>
            </AccordionItem>
          </AccordionRoot>
        `,
      })

      render(App)

      expect(screen.queryByText('Panel 1')).toBeNull()

      await user.click(screen.getByRole('button', { name: 'Trigger 1' }))

      expect(screen.queryByText('Panel 1')).not.toBeNull()
    })
  })

  describe('keyboard interactions', () => {
    it('arrow keys should not put focus on disabled accordion items', async () => {
      const user = userEvent.setup()

      const App = defineComponent({
        components: {
          AccordionRoot,
          AccordionItem,
          AccordionHeader,
          AccordionTrigger,
          AccordionPanel,
        },
        template: `
          <AccordionRoot>
            <AccordionItem value="item-1">
              <AccordionHeader>
                <AccordionTrigger>Trigger 1</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>Panel 1</AccordionPanel>
            </AccordionItem>
            <AccordionItem value="item-2" disabled>
              <AccordionHeader>
                <AccordionTrigger>Trigger 2</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>Panel 2</AccordionPanel>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionHeader>
                <AccordionTrigger>Trigger 3</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>Panel 3</AccordionPanel>
            </AccordionItem>
          </AccordionRoot>
        `,
      })

      render(App)

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger3 = screen.getByRole('button', { name: 'Trigger 3' })

      trigger1.focus()
      expect(trigger1).toHaveFocus()

      await user.keyboard('[ArrowDown]')
      expect(trigger3).toHaveFocus()

      await user.keyboard('[ArrowUp]')
      expect(trigger1).toHaveFocus()
    })

    it('does not affect composite keys on interactive elements in the panel', async () => {
      const user = userEvent.setup()
      const App = defineComponent({
        components: {
          AccordionRoot,
          AccordionItem,
          AccordionHeader,
          AccordionTrigger,
          AccordionPanel,
        },
        template: `
          <AccordionRoot :default-value="['item-1']">
            <AccordionItem value="item-1">
              <AccordionHeader>
                <AccordionTrigger>Trigger 1</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>
                <input type="text" defaultValue="abcd" />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionHeader>
                <AccordionTrigger>Trigger 2</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>Panel 2</AccordionPanel>
            </AccordionItem>
          </AccordionRoot>
        `,
      })

      render(App)

      const input = screen.getByRole('textbox') as HTMLInputElement

      await user.keyboard('[Tab]')
      await user.keyboard('[Tab]')
      expect(input).toHaveFocus()

      input.setSelectionRange(0, 4)
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(4)

      await user.keyboard('[ArrowLeft]')
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(0)
    })
  })

  describe('prop: disabled', () => {
    it('can disable one accordion item', async () => {
      const App = defineComponent({
        components: {
          AccordionRoot,
          AccordionItem,
          AccordionHeader,
          AccordionTrigger,
          AccordionPanel,
        },
        template: `
          <AccordionRoot :default-value="['item-1']">
            <AccordionItem data-testid="item1" value="item-1" disabled>
              <AccordionHeader>
                <AccordionTrigger>Trigger 1</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>Panel 1</AccordionPanel>
            </AccordionItem>
            <AccordionItem data-testid="item2" value="item-2">
              <AccordionHeader>
                <AccordionTrigger>Trigger 2</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>Panel 2</AccordionPanel>
            </AccordionItem>
          </AccordionRoot>
        `,
      })

      render(App)

      await nextTick()

      const item1 = screen.getByTestId('item1')
      const panel1 = screen.queryByText('Panel 1')
      const triggers = screen.getAllByRole('button')
      const trigger1 = triggers[0]
      const trigger2 = triggers[1]
      const item2 = screen.getByTestId('item2')

      expect(item1).toHaveAttribute('data-disabled')
      expect(trigger1).toHaveAttribute('data-disabled')
      expect(panel1).toHaveAttribute('data-disabled')

      expect(item2).not.toHaveAttribute('data-disabled')
      expect(trigger2).not.toHaveAttribute('data-disabled')
    })
  })
})
