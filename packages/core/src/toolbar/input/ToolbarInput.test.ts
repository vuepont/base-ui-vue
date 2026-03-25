import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP } from '../../composite/composite'
import { ToolbarButton, ToolbarInput, ToolbarRoot } from '../index'

describe('<ToolbarInput />', () => {
  // TODO: Add shared public API contract coverage for ref exposure and
  // renderless/`as` behavior if the Vue package gains a reusable conformance
  // helper comparable to the React test harness.
  // TODO: Add composition coverage for rendering ToolbarInput as NumberField.Input
  // once the Vue package has a NumberField implementation.
  it('renders a textbox', () => {
    const TestComponent = defineComponent({
      components: { ToolbarRoot, ToolbarInput },
      template: `
        <ToolbarRoot>
          <ToolbarInput data-testid="input" />
        </ToolbarRoot>
      `,
    })

    render(TestComponent)

    expect(screen.getByTestId('input')).toBe(screen.getByRole('textbox'))
  })

  it('prevents interactions when disabled while remaining focusable by default', async () => {
    const user = userEvent.setup()

    const TestComponent = defineComponent({
      components: { ToolbarRoot, ToolbarInput },
      template: `
        <ToolbarRoot>
          <ToolbarInput disabled data-testid="input" default-value="" />
        </ToolbarRoot>
      `,
    })

    const wrapper = mount(TestComponent, { attachTo: document.body })
    const input = wrapper.get('[data-testid="input"]').element as HTMLInputElement

    expect(input.hasAttribute('disabled')).toBe(false)
    expect(input.getAttribute('aria-disabled')).toBe('true')
    expect(input.getAttribute('data-disabled')).toBe('')
    expect(input.getAttribute('data-focusable')).toBe('')

    await user.tab()
    expect(document.activeElement).toBe(input)

    input.focus()
    await user.keyboard('[ArrowRight]')
    expect(document.activeElement).toBe(input)

    wrapper.unmount()
  })

  ;([
    ['horizontal', ARROW_RIGHT, ARROW_LEFT],
    ['vertical', ARROW_DOWN, ARROW_UP],
  ] as const).forEach(([orientation, nextKey, prevKey]) => {
    it(`preserves text cursor movement until the boundary in a ${orientation} toolbar`, async () => {
      const user = userEvent.setup()

      const TestComponent = defineComponent({
        components: { ToolbarRoot, ToolbarButton, ToolbarInput },
        setup() {
          return {
            orientation,
          }
        },
        template: `
          <ToolbarRoot :orientation="orientation">
            <ToolbarButton>One</ToolbarButton>
            <ToolbarInput default-value="abcd" />
            <ToolbarButton>Two</ToolbarButton>
          </ToolbarRoot>
        `,
      })

      const wrapper = mount(TestComponent, { attachTo: document.body })
      const [button1, button2] = wrapper.findAll('button').map(node => node.element as HTMLButtonElement)
      const input = wrapper.get('input').element as HTMLInputElement

      await user.tab()
      expect(document.activeElement).toBe(button1)

      await user.keyboard(`[${nextKey}]`)
      expect(document.activeElement).toBe(input)
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(input.value.length)

      input.setSelectionRange(input.value.length, input.value.length)
      await user.keyboard(`[${nextKey}]`)
      expect(document.activeElement).toBe(button2)

      await user.keyboard(`[${prevKey}]`)
      expect(document.activeElement).toBe(input)

      input.setSelectionRange(0, 0)
      await user.keyboard(`[${prevKey}]`)
      expect(document.activeElement).toBe(button1)

      wrapper.unmount()
    })
  })
})
