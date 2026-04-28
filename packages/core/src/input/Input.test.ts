import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import FieldLabel from '../field/label/FieldLabel.vue'
import FieldRoot from '../field/root/FieldRoot.vue'
import Input from './Input.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: { FieldRoot, FieldLabel, Input },
    setup: options.setup,
    template: options.template,
  })
}

describe('<Input />', () => {
  it('renders an input element by default', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <Input data-testid="input" />
          </FieldRoot>
        `,
      }),
    )

    const input = screen.getByTestId('input')
    expect(input.tagName).toBe('INPUT')
  })

  describe('prop forwarding', () => {
    it('forwards type prop', () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <Input type="email" data-testid="input" />
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')
    })

    it('forwards placeholder prop', () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <Input placeholder="Enter text…" data-testid="input" />
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByTestId('input')).toHaveAttribute('placeholder', 'Enter text…')
    })

    it('forwards disabled prop', () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <Input disabled data-testid="input" />
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByTestId('input')).toBeDisabled()
    })

    it('forwards name prop', () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <Input name="username" data-testid="input" />
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByTestId('input')).toHaveAttribute('name', 'username')
    })
  })

  describe('field integration', () => {
    it('links to FieldLabel via aria-labelledby', async () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <FieldLabel>Username</FieldLabel>
              <Input data-testid="input" />
            </FieldRoot>
          `,
        }),
      )

      await nextTick()

      const input = screen.getByTestId('input')
      const label = screen.getByText('Username')
      expect(input.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))
    })

    it('inherits disabled from FieldRoot', () => {
      render(
        createApp({
          template: `
            <FieldRoot disabled>
              <Input data-testid="input" />
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByTestId('input')).toBeDisabled()
    })

    it('sets data-focused when focused', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          template: `
            <FieldRoot data-testid="field">
              <Input data-testid="input" />
            </FieldRoot>
          `,
        }),
      )

      await user.click(screen.getByTestId('input'))
      expect(screen.getByTestId('field')).toHaveAttribute('data-focused')
    })

    it('sets data-touched after blur', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          template: `
            <FieldRoot data-testid="field">
              <Input data-testid="input" />
            </FieldRoot>
          `,
        }),
      )

      await user.click(screen.getByTestId('input'))
      await user.tab()

      expect(screen.getByTestId('field')).toHaveAttribute('data-touched')
    })
  })

  describe('controlled value', () => {
    it('reflects the controlled value prop', () => {
      render(
        createApp({
          setup() {
            return { val: ref('hello') }
          },
          template: `
            <FieldRoot>
              <Input :value="val" data-testid="input" />
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByTestId('input')).toHaveValue('hello')
    })

    it('uses default-value for uncontrolled mode', () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <Input default-value="world" data-testid="input" />
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByTestId('input')).toHaveValue('world')
    })
  })

  describe('@value-change event', () => {
    it('emits value-change on input', async () => {
      const user = userEvent.setup()
      const spy = vi.fn()

      render(
        createApp({
          setup() {
            return { spy }
          },
          template: `
            <FieldRoot>
              <Input data-testid="input" @value-change="spy" />
            </FieldRoot>
          `,
        }),
      )

      await user.click(screen.getByTestId('input'))
      await user.keyboard('a')

      expect(spy).toHaveBeenCalled()
      expect(spy.mock.lastCall?.[0]).toBe('a')
    })
  })

  describe('prop: as', () => {
    it('supports rendering as a textarea', () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <Input as="textarea" data-testid="input" />
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByTestId('input').tagName).toBe('TEXTAREA')
    })
  })
})
