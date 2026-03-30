import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { DirectionProvider } from '../direction-provider'
import { ToggleGroup } from '../toggle-group'
import { ToolbarButton, ToolbarRoot } from '../toolbar'
import { Slot } from '../utils/slot'
import { Toggle } from './index'

function createToggleApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: {
      DirectionProvider,
      Slot,
      Toggle,
      ToggleGroup,
      ToolbarButton,
      ToolbarRoot,
    },
    setup() {
      return {
        Slot,
        ...(options.setup?.() ?? {}),
      }
    },
    template: options.template,
  })
}

describe('<Toggle />', () => {
  describe('pressed state', () => {
    it('controlled', async () => {
      const user = userEvent.setup()

      render(createToggleApp({
        setup() {
          const pressed = ref(false)
          return { pressed }
        },
        template: `
          <div>
            <input type="checkbox" :checked="pressed" @change="pressed = !pressed">
            <Toggle :pressed="pressed" />
          </div>
        `,
      }))

      const checkbox = screen.getByRole('checkbox')
      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('aria-pressed', 'false')

      await user.click(checkbox)
      expect(button).toHaveAttribute('aria-pressed', 'true')

      await user.click(checkbox)
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })

    it('uncontrolled', async () => {
      const user = userEvent.setup()

      render(createToggleApp({
        template: `<Toggle :default-pressed="false" />`,
      }))

      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('aria-pressed', 'false')

      await user.click(button)
      await flushPromises()
      expect(button).toHaveAttribute('aria-pressed', 'true')

      await user.click(button)
      await flushPromises()
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('emit: pressedChange', () => {
    it('is called when the pressed state changes', async () => {
      const user = userEvent.setup()
      const handlePressedChange = vi.fn()

      render(createToggleApp({
        setup() {
          return { handlePressedChange }
        },
        template: `<Toggle :default-pressed="false" @pressed-change="handlePressedChange" />`,
      }))

      await user.click(screen.getByRole('button'))

      expect(handlePressedChange).toHaveBeenCalledTimes(1)
      expect(handlePressedChange.mock.calls[0][0]).toBe(true)
    })

    it('does not apply side effects when pressedChange is canceled', async () => {
      const user = userEvent.setup()

      render(createToggleApp({
        setup() {
          function handlePressedChange(
            _pressed: boolean,
            details: { cancel: () => void },
          ) {
            details.cancel()
          }

          return { handlePressedChange }
        },
        template: `<Toggle @pressed-change="handlePressedChange" />`,
      }))

      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('aria-pressed', 'false')

      await user.click(button)

      expect(button).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('prop: disabled', () => {
    it('disables the component', async () => {
      const user = userEvent.setup()
      const handlePressedChange = vi.fn()

      render(createToggleApp({
        setup() {
          return { handlePressedChange }
        },
        template: `<Toggle disabled @pressed-change="handlePressedChange" />`,
      }))

      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('disabled')
      expect(button).toHaveAttribute('data-disabled')
      expect(button).toHaveAttribute('aria-pressed', 'false')

      await user.click(button)

      expect(handlePressedChange).not.toHaveBeenCalled()
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('prop: as', () => {
    it('should pass composite props', async () => {
      render(createToggleApp({
        template: `
          <ToggleGroup :default-value="['left']">
            <Toggle value="left" :as="Slot" v-slot="{ props, ref }">
              <button type="button" :ref="ref" v-bind="props" data-testid="toggle-render" />
            </Toggle>
          </ToggleGroup>
        `,
      }))

      await flushPromises()
      expect(screen.getByTestId('toggle-render')).toHaveAttribute('tabindex', '0')
    })
  })

  it('participates in toolbar navigation when nested inside ToggleGroup within ToolbarRoot', async () => {
    const user = userEvent.setup()

    const wrapper = mount(createToggleApp({
      template: `
        <DirectionProvider direction="ltr">
          <ToolbarRoot>
            <ToolbarButton data-testid="before">Before</ToolbarButton>
            <ToggleGroup aria-label="Alignment">
              <Toggle value="left" aria-label="Align left" />
              <Toggle value="right" aria-label="Align right" />
            </ToggleGroup>
            <ToolbarButton data-testid="after">After</ToolbarButton>
          </ToolbarRoot>
        </DirectionProvider>
      `,
    }), {
      attachTo: document.body,
    })

    const before = screen.getByTestId('before')
    const left = screen.getByRole('button', { name: 'Align left' })
    const right = screen.getByRole('button', { name: 'Align right' })
    const after = screen.getByTestId('after')

    await user.tab()
    expect(document.activeElement).toBe(before)

    await user.keyboard('[ArrowRight]')
    expect(document.activeElement).toBe(left)

    await user.keyboard('[ArrowRight]')
    expect(document.activeElement).toBe(right)

    await user.keyboard('[ArrowRight]')
    expect(document.activeElement).toBe(after)

    wrapper.unmount()
  })
})
