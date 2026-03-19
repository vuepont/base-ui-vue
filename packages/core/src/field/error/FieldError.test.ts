import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import Form from '../../form/Form.vue'
import FieldControl from '../control/FieldControl.vue'
import FieldRoot from '../root/FieldRoot.vue'
import FieldError from './FieldError.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: { Form, FieldRoot, FieldControl, FieldError },
    setup: options.setup,
    template: options.template,
  })
}

describe('<FieldError />', () => {
  it('should set aria-describedby on the control automatically', async () => {
    render(
      createApp({
        template: `
          <FieldRoot invalid>
            <FieldControl />
            <FieldError match>Message</FieldError>
          </FieldRoot>
        `,
      }),
    )

    await nextTick()

    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(screen.getByText('Message').id),
    )
  })

  it('should show error messages on submit by default', async () => {
    const user = userEvent.setup()

    render(
      createApp({
        template: `
          <Form>
            <FieldRoot>
              <FieldControl required />
              <FieldError>Message</FieldError>
            </FieldRoot>
            <button type="submit">submit</button>
          </Form>
        `,
      }),
    )

    expect(screen.queryByText('Message')).toBeNull()

    await user.click(screen.getByText('submit'))
    await nextTick()

    expect(screen.queryByText('Message')).not.toBeNull()
  })

  describe('prop: match', () => {
    it('should only render when match matches constraint validation', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          template: `
            <Form>
              <FieldRoot>
                <FieldControl required :minlength="2" />
                <FieldError match="valueMissing">Message</FieldError>
              </FieldRoot>
              <button type="submit">submit</button>
            </Form>
          `,
        }),
      )

      expect(screen.queryByText('Message')).toBeNull()

      await user.click(screen.getByText('submit'))
      await nextTick()
      expect(screen.queryByText('Message')).not.toBeNull()

      const input = screen.getByRole('textbox')
      await fireEvent.update(input, 'a')
      await nextTick()

      expect(screen.queryByText('Message')).toBeNull()

      await fireEvent.update(input, '')
      await nextTick()

      expect(screen.queryByText('Message')).not.toBeNull()
    })

    it('should show custom errors', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          setup() {
            return { validate: () => 'error' }
          },
          template: `
            <Form>
              <FieldRoot :validate="validate">
                <FieldControl />
                <FieldError match="customError">Message</FieldError>
              </FieldRoot>
              <button type="submit">submit</button>
            </Form>
          `,
        }),
      )

      expect(screen.queryByText('Message')).toBeNull()

      await user.click(screen.getByText('submit'))
      await nextTick()

      expect(screen.queryByText('Message')).not.toBeNull()
    })

    it('always renders the error message when match is true', async () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <FieldControl required />
              <FieldError match>Message</FieldError>
            </FieldRoot>
          `,
        }),
      )

      expect(screen.queryByText('Message')).not.toBeNull()
    })
  })
})
