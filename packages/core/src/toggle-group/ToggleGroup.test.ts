import type { TextDirection } from '../direction-provider'
import type { Orientation } from '../utils/types'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { DirectionProvider } from '../direction-provider'
import { Toggle } from '../toggle'
import { ToolbarRoot } from '../toolbar'
import { ToggleGroup } from './index'

function createToggleGroupApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: {
      DirectionProvider,
      Toggle,
      ToggleGroup,
    },
    setup: options.setup,
    template: options.template,
  })
}

describe('<ToggleGroup />', () => {
  it('renders a `group`', () => {
    render(createToggleGroupApp({
      template: `<ToggleGroup aria-label="My Toggle Group" />`,
    }))

    expect(screen.getByRole('group', { name: 'My Toggle Group' })).toBeInTheDocument()
  })

  describe('uncontrolled', () => {
    it('pressed state', async () => {
      const user = userEvent.setup()

      render(createToggleGroupApp({
        template: `
          <ToggleGroup>
            <Toggle value="one" />
            <Toggle value="two" />
          </ToggleGroup>
        `,
      }))

      const [button1, button2] = screen.getAllByRole('button')

      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await user.click(button1)

      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button1).toHaveAttribute('data-pressed')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await user.click(button2)

      expect(button2).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('data-pressed')
      expect(button1).toHaveAttribute('aria-pressed', 'false')
    })

    it('prop: defaultValue', async () => {
      const user = userEvent.setup()

      render(createToggleGroupApp({
        template: `
          <ToggleGroup :default-value="['two']">
            <Toggle value="one" />
            <Toggle value="two" />
          </ToggleGroup>
        `,
      }))

      const [button1, button2] = screen.getAllByRole('button')

      expect(button2).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('data-pressed')
      expect(button1).toHaveAttribute('aria-pressed', 'false')

      await user.click(button1)

      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button1).toHaveAttribute('data-pressed')
      expect(button2).toHaveAttribute('aria-pressed', 'false')
    })

    it('when Toggles omit value', async () => {
      const user = userEvent.setup()

      render(createToggleGroupApp({
        template: `
          <ToggleGroup>
            <Toggle />
            <Toggle value="" />
          </ToggleGroup>
        `,
      }))

      const [button1, button2] = screen.getAllByRole('button')

      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await user.click(button1)
      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await user.click(button2)
      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'true')
    })

    it('should warn if Toggle value is not set and ToggleGroup value is defined', () => {
      vi.spyOn(console, 'error')
        .mockName('console.error')
        .mockImplementation(() => {})

      render(createToggleGroupApp({
        template: `
          <ToggleGroup :default-value="['one']">
            <Toggle />
            <Toggle />
          </ToggleGroup>
        `,
      }))

      expect(console.error).toHaveBeenCalledExactlyOnceWith(
        'Base UI Vue: A `<Toggle>` component rendered in a `<ToggleGroup>` has no explicit `value` prop. This will cause issues between the Toggle Group and Toggle values. Provide the `<Toggle>` with a `value` prop matching the `<ToggleGroup>` values prop type.',
      )
    })
  })

  describe('controlled', () => {
    it('pressed state', async () => {
      const wrapper = mount(createToggleGroupApp({
        setup() {
          const value = ref<string[]>(['two'])
          return { value }
        },
        template: `
          <ToggleGroup :value="value">
            <Toggle value="one" />
            <Toggle value="two" />
          </ToggleGroup>
        `,
      }))

      const buttons = wrapper.findAll('button')
      const [button1, button2] = buttons.map(node => node.element as HTMLButtonElement)

      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('data-pressed')

      ;(wrapper.vm as unknown as { value: string[] }).value = ['one']
      await flushPromises()

      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button1).toHaveAttribute('data-pressed')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      ;(wrapper.vm as unknown as { value: string[] }).value = ['two']
      await flushPromises()

      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'true')

      wrapper.unmount()
    })

    it('prop: value', async () => {
      const TestComponent = defineComponent({
        components: { Toggle, ToggleGroup },
        setup() {
          const value = ref<string[]>(['two'])
          return { value }
        },
        template: `
          <ToggleGroup :value="value">
            <Toggle value="one" />
            <Toggle value="two" />
          </ToggleGroup>
        `,
      })

      const wrapper = mount(TestComponent)
      const buttons = wrapper.findAll('button')

      expect(buttons[0].attributes('aria-pressed')).toBe('false')
      expect(buttons[1].attributes('aria-pressed')).toBe('true')
      expect(buttons[1].attributes('data-pressed')).toBe('')

      ;(wrapper.vm as unknown as { value: string[] }).value = ['one']
      await flushPromises()

      expect(buttons[0].attributes('aria-pressed')).toBe('true')
      expect(buttons[0].attributes('data-pressed')).toBe('')
      expect(buttons[1].attributes('aria-pressed')).toBe('false')
    })
  })

  describe('emit: valueChange', () => {
    it('fires when an Item is clicked', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(createToggleGroupApp({
        setup() {
          return { onValueChange }
        },
        template: `
          <ToggleGroup @value-change="onValueChange">
            <Toggle value="one" />
            <Toggle value="two" />
          </ToggleGroup>
        `,
      }))

      const [button1, button2] = screen.getAllByRole('button')

      expect(onValueChange.mock.calls.length).toBe(0)

      await user.pointer({ keys: '[MouseLeft]', target: button1 })

      expect(onValueChange.mock.calls.length).toBe(1)
      expect(onValueChange.mock.calls[0][0]).toEqual(['one'])

      await user.pointer({ keys: '[MouseLeft]', target: button2 })

      expect(onValueChange.mock.calls.length).toBe(2)
      expect(onValueChange.mock.calls[1][0]).toEqual(['two'])
    })

    it('does not apply side effects when valueChange is canceled', async () => {
      const user = userEvent.setup()

      render(createToggleGroupApp({
        setup() {
          function handleValueChange(
            _value: string[],
            details: { cancel: () => void },
          ) {
            details.cancel()
          }

          return { handleValueChange }
        },
        template: `
          <ToggleGroup @value-change="handleValueChange">
            <Toggle value="one" />
            <Toggle value="two" />
          </ToggleGroup>
        `,
      }))

      const [button1, button2] = screen.getAllByRole('button')

      await user.click(button1)

      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'false')
    });

    ['Enter', 'Space'].forEach((key) => {
      it(`fires when when the ${key} is pressed`, async () => {
        const user = userEvent.setup()
        const onValueChange = vi.fn()

        render(createToggleGroupApp({
          setup() {
            return { onValueChange }
          },
          template: `
            <ToggleGroup @value-change="onValueChange">
              <Toggle value="one" />
              <Toggle value="two" />
            </ToggleGroup>
          `,
        }))

        const [button1, button2] = screen.getAllByRole('button')

        expect(onValueChange.mock.calls.length).toBe(0)

        button1.focus()
        await user.keyboard(`[${key}]`)

        expect(onValueChange.mock.calls.length).toBe(1)
        expect(onValueChange.mock.calls[0][0]).toEqual(['one'])

        button2.focus()
        await user.keyboard(`[${key}]`)

        expect(onValueChange.mock.calls.length).toBe(2)
        expect(onValueChange.mock.calls[1][0]).toEqual(['two'])
      })
    })
  })

  describe('prop: disabled', () => {
    it('can disable the whole group', () => {
      render(createToggleGroupApp({
        template: `
          <ToggleGroup disabled>
            <Toggle value="one" />
            <Toggle value="two" />
          </ToggleGroup>
        `,
      }))

      const [button1, button2] = screen.getAllByRole('button')

      expect(button1).toHaveAttribute('aria-disabled', 'true')
      expect(button1).toHaveAttribute('data-disabled')
      expect(button2).toHaveAttribute('aria-disabled', 'true')
      expect(button2).toHaveAttribute('data-disabled')
    })

    it('can disable individual items', () => {
      render(createToggleGroupApp({
        template: `
          <ToggleGroup>
            <Toggle value="one" />
            <Toggle value="two" disabled />
          </ToggleGroup>
        `,
      }))

      const [button1, button2] = screen.getAllByRole('button')

      expect(button1).toHaveAttribute('aria-disabled', 'false')
      expect(button1).not.toHaveAttribute('data-disabled')
      expect(button2).toHaveAttribute('aria-disabled', 'true')
      expect(button2).toHaveAttribute('data-disabled')
    })
  })

  describe('prop: orientation', () => {
    it('vertical', () => {
      render(createToggleGroupApp({
        template: `
          <ToggleGroup orientation="vertical">
            <Toggle value="one" />
            <Toggle value="two" />
          </ToggleGroup>
        `,
      }))

      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('data-orientation', 'vertical')
      expect(group).toHaveAttribute('aria-orientation', 'vertical')
    })

    it('vertical within toolbar', () => {
      render(defineComponent({
        components: {
          Toggle,
          ToggleGroup,
          ToolbarRoot,
        },
        template: `
          <ToolbarRoot>
            <ToggleGroup orientation="vertical">
              <Toggle value="one" />
              <Toggle value="two" />
            </ToggleGroup>
          </ToolbarRoot>
        `,
      }))

      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('data-orientation', 'vertical')
      expect(group).toHaveAttribute('aria-orientation', 'vertical')
    })
  })

  describe('prop: multiple', () => {
    it('multiple items can be pressed when true', async () => {
      const user = userEvent.setup()

      render(createToggleGroupApp({
        template: `
          <ToggleGroup multiple :default-value="['one']">
            <Toggle value="one" />
            <Toggle value="two" />
          </ToggleGroup>
        `,
      }))

      const [button1, button2] = screen.getAllByRole('button')

      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await user.click(button2)

      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('aria-pressed', 'true')
    })

    it('only one item can be pressed when false', async () => {
      const user = userEvent.setup()

      render(createToggleGroupApp({
        template: `
          <ToggleGroup :default-value="['one']">
            <Toggle value="one" />
            <Toggle value="two" />
          </ToggleGroup>
        `,
      }))

      const [button1, button2] = screen.getAllByRole('button')

      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await user.click(button2)

      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'true')
    })

    it('when Toggles omit value', async () => {
      const user = userEvent.setup()

      render(createToggleGroupApp({
        template: `
          <ToggleGroup multiple>
            <Toggle value="" />
            <Toggle />
          </ToggleGroup>
        `,
      }))

      const [button1, button2] = screen.getAllByRole('button')

      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await user.click(button1)
      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await user.click(button2)
      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('aria-pressed', 'true')

      await user.click(button1)
      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('keyboard interactions', () => {
    it('home key moves focus to the first item', async () => {
      const user = userEvent.setup()

      render(createToggleGroupApp({
        template: `
          <ToggleGroup>
            <Toggle value="one" />
            <Toggle value="two" />
            <Toggle value="three" />
          </ToggleGroup>
        `,
      }))

      const [button1, button2, button3] = screen.getAllByRole('button')

      await user.tab()
      expect(button1).toHaveFocus()

      await user.keyboard('[ArrowRight][ArrowRight]')
      expect(button3).toHaveFocus()

      await user.keyboard('[Home]')
      expect(button1).toHaveAttribute('tabindex', '0')
      expect(button1).toHaveFocus()

      await user.keyboard('[ArrowRight]')
      expect(button2).toHaveFocus()

      await user.keyboard('[Home]')
      expect(button1).toHaveAttribute('tabindex', '0')
      expect(button1).toHaveFocus()
    })

    it('end key moves focus to the last item', async () => {
      const user = userEvent.setup()

      render(createToggleGroupApp({
        template: `
          <ToggleGroup>
            <Toggle value="one" />
            <Toggle value="two" />
            <Toggle value="three" />
          </ToggleGroup>
        `,
      }))

      const [button1, button2, button3] = screen.getAllByRole('button')

      await user.tab()
      expect(button1).toHaveFocus()

      await user.keyboard('[End]')
      expect(button3).toHaveAttribute('tabindex', '0')
      expect(button3).toHaveFocus()

      await user.keyboard('[ArrowLeft]')
      expect(button2).toHaveFocus()

      await user.keyboard('[End]')
      expect(button3).toHaveAttribute('tabindex', '0')
      expect(button3).toHaveFocus()
    });

    ['Enter', 'Space'].forEach((key) => {
      it(`key: ${key} toggles the pressed state`, async () => {
        const user = userEvent.setup()

        render(createToggleGroupApp({
          template: `
            <ToggleGroup>
              <Toggle value="one" />
              <Toggle value="two" />
            </ToggleGroup>
          `,
        }))

        const [button1] = screen.getAllByRole('button')

        expect(button1).toHaveAttribute('aria-pressed', 'false')

        button1.focus()
        await user.keyboard(`[${key}]`)

        expect(button1).toHaveAttribute('aria-pressed', 'true')

        await user.keyboard(`[${key}]`)

        expect(button1).toHaveAttribute('aria-pressed', 'false')
      })
    })

    ;[
      ['ltr', 'horizontal', 'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'],
      ['ltr', 'vertical', 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'],
      ['rtl', 'horizontal', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'],
      ['rtl', 'vertical', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'],
    ].forEach((entry) => {
      const [direction, orientation, nextKey, prevKey, ignoredNextKey, ignoredPrevKey]
        = entry as [TextDirection, Orientation, string, string, string, string]

      describe(direction, () => {
        it(`orientation: ${orientation}`, async () => {
          const user = userEvent.setup()

          const wrapper = mount(createToggleGroupApp({
            setup() {
              return { direction, orientation }
            },
            template: `
            <DirectionProvider :direction="direction">
              <ToggleGroup :orientation="orientation">
                <Toggle value="one" />
                <Toggle value="two" />
                <Toggle value="three" />
              </ToggleGroup>
            </DirectionProvider>
          `,
          }), {
            attachTo: document.body,
          })

          const [button1, button2, button3] = wrapper.findAll('button').map(
            node => node.element as HTMLButtonElement,
          )

          await user.tab()

          expect(button1).toHaveAttribute('tabindex', '0')
          expect(document.activeElement).toBe(button1)

          await user.keyboard(`[${nextKey}]`)
          expect(button2).toHaveAttribute('tabindex', '0')
          expect(document.activeElement).toBe(button2)

          await user.keyboard(`[${nextKey}]`)
          expect(button3).toHaveAttribute('tabindex', '0')
          expect(document.activeElement).toBe(button3)

          await user.keyboard(`[${nextKey}]`)
          expect(button1).toHaveAttribute('tabindex', '0')
          expect(document.activeElement).toBe(button1)

          await user.keyboard(`[${prevKey}]`)
          expect(button3).toHaveAttribute('tabindex', '0')
          expect(document.activeElement).toBe(button3)

          await user.keyboard(`[${prevKey}]`)
          expect(button2).toHaveAttribute('tabindex', '0')
          expect(document.activeElement).toBe(button2)

          await user.keyboard(`[${ignoredNextKey}]`)
          expect(button2).toHaveAttribute('tabindex', '0')
          expect(document.activeElement).toBe(button2)

          await user.keyboard(`[${ignoredPrevKey}]`)
          expect(button2).toHaveAttribute('tabindex', '0')
          expect(document.activeElement).toBe(button2)

          wrapper.unmount()
        })
      })
    })
  })
})
