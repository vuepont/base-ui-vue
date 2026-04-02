import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import {
  SliderControl,
  SliderIndicator,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from '..'
import { getHorizontalSliderRect } from '../utils/test-utils'

function createSliderApp(template: string, setup?: () => Record<string, unknown>) {
  return defineComponent({
    components: {
      SliderControl,
      SliderIndicator,
      SliderRoot,
      SliderThumb,
      SliderTrack,
    },
    setup,
    template,
  })
}

describe('<SliderControl />', () => {
  it('does not apply a tabIndex by default', () => {
    render(createSliderApp(`
      <SliderRoot :default-value="50">
        <SliderControl data-testid="control">
          <SliderThumb />
        </SliderControl>
      </SliderRoot>
    `))

    expect(screen.getByTestId('control')).not.toHaveAttribute('tabindex')
  })

  it('should change its state when clicking on the control', async () => {
    const user = userEvent.setup()

    render(createSliderApp(`
      <SliderRoot :default-value="0">
        <SliderControl data-testid="control">
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb aria-label="Volume" data-testid="thumb" />
          </SliderTrack>
        </SliderControl>
      </SliderRoot>
    `))

    const control = screen.getByTestId('control')
    vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

    await user.pointer({ target: control, keys: '[MouseLeft]', coords: { x: 10, y: 0 } })

    await waitFor(() => {
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '10')
    })
  })

  it('single value commit event', () => {
    const onValueCommitted = vi.fn()

    render(createSliderApp(
      `
        <SliderRoot :default-value="0" @value-committed="onValueCommitted">
          <SliderControl data-testid="control">
            <SliderThumb aria-label="Volume" />
          </SliderControl>
        </SliderRoot>
      `,
      () => ({ onValueCommitted }),
    ))

    const control = screen.getByTestId('control')
    vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

    fireEvent.pointerDown(control, { buttons: 1, clientX: 10 })
    fireEvent.pointerUp(control, { buttons: 1, clientX: 10 })

    expect(onValueCommitted).toHaveBeenCalledTimes(1)
    expect(onValueCommitted.mock.calls[0][0]).toBe(10)
    expect(onValueCommitted.mock.calls[0][1].reason).toBe('track-press')
  })
})
