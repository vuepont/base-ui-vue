import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { SwitchRoot, SwitchThumb } from '..'

describe('<SwitchThumb />', () => {
  it('renders a `span` with switch state attributes', () => {
    render(defineComponent({
      components: { SwitchRoot, SwitchThumb },
      template: `
        <SwitchRoot :default-checked="true" disabled read-only required>
          <SwitchThumb data-testid="thumb" />
        </SwitchRoot>
      `,
    }))

    const thumb = screen.getByTestId('thumb')
    expect(thumb.tagName).toBe('SPAN')
    expect(thumb).toHaveAttribute('data-checked', '')
    expect(thumb).toHaveAttribute('data-disabled', '')
    expect(thumb).toHaveAttribute('data-readonly', '')
    expect(thumb).toHaveAttribute('data-required', '')
  })
})
