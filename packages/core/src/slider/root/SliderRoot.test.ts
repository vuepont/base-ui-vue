import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import {
  SliderControl,
  SliderIndicator,
  SliderLabel,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from '..'
import { FieldDescription, FieldLabel, FieldRoot } from '../../field'
import Form from '../../form/Form.vue'
import { createTouches, getHorizontalSliderRect } from '../utils/test-utils'

function createSliderApp(options: {
  template: string
  setup?: () => Record<string, unknown>
}) {
  return defineComponent({
    components: {
      FieldLabel,
      FieldDescription,
      FieldRoot,
      Form,
      SliderControl,
      SliderIndicator,
      SliderLabel,
      SliderRoot,
      SliderThumb,
      SliderTrack,
      SliderValue,
    },
    setup: options.setup,
    template: options.template,
  })
}

describe('<SliderRoot />', () => {
  it.skipIf(typeof Touch === 'undefined')('should not break when initial value is out of range', () => {
    render(createSliderApp({
      template: `
        <SliderRoot :value="[19, 41]" :min="20" :max="40">
          <SliderValue data-testid="value" />
          <SliderControl data-testid="control">
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb :index="0" data-testid="thumb" />
              <SliderThumb :index="1" data-testid="thumb" />
            </SliderTrack>
          </SliderControl>
        </SliderRoot>
      `,
    }))

    const control = screen.getByTestId('control')
    vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

    fireEvent.touchStart(
      control,
      createTouches([{ identifier: 1, clientX: 100, clientY: 0 }]),
    )
    fireEvent.touchMove(
      document.body,
      createTouches([{ identifier: 1, clientX: 20, clientY: 0 }]),
    )
  })

  describe('aRIA attributes', () => {
    it('has the correct ARIA attributes', () => {
      render(createSliderApp({
        template: `
          <SliderRoot default-value="30" aria-labelledby="labelId" data-testid="root">
            <SliderValue />
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb />
              </SliderTrack>
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')

      expect(slider).toHaveAttribute('aria-valuenow', '30')
      expect(slider).toHaveAttribute('aria-orientation', 'horizontal')
      expect(slider).toHaveAttribute('aria-labelledby', 'labelId')
      expect(slider).toHaveAttribute('step', '1')
    })

    it('forwards aria-label to the input', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50">
            <SliderControl>
              <SliderThumb aria-label="Volume" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      expect(screen.getByRole('slider')).toHaveAttribute('aria-label', 'Volume')
    })

    it('should update aria-valuenow', async () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50">
            <SliderValue />
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb />
              </SliderTrack>
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '51' } })
      await nextTick()

      expect(slider).toHaveAttribute('aria-valuenow', '51')
    })

    it('should set default aria-valuetext on range slider thumbs', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="[44, 50]">
            <SliderControl>
              <SliderThumb :index="0" data-testid="thumb" />
              <SliderThumb :index="1" data-testid="thumb" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const [thumb1, thumb2] = screen.getAllByTestId('thumb')
      expect(thumb1.querySelector('input')).toHaveAttribute('aria-valuetext', '44 start range')
      expect(thumb2.querySelector('input')).toHaveAttribute('aria-valuetext', '50 end range')
    })

    it('does not set aria-labelledby when getAriaLabel is provided', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50">
            <SliderLabel>Volume</SliderLabel>
            <SliderControl>
              <SliderThumb :get-aria-label="() => 'Volume thumb'" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-label', 'Volume thumb')
      expect(slider).not.toHaveAttribute('aria-labelledby')
    })

    it('does not set fallback aria-labelledby when no label is rendered', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50">
            <SliderControl>
              <SliderThumb />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      expect(screen.getByRole('slider')).not.toHaveAttribute('aria-labelledby')
    })
  })

  describe('prop: disabled', () => {
    it('renders data-disabled on all subcomponents', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50" disabled>
            <SliderValue data-testid="value" />
            <SliderControl data-testid="control">
              <SliderTrack data-testid="track">
                <SliderIndicator data-testid="indicator" />
                <SliderThumb data-testid="thumb" />
              </SliderTrack>
            </SliderControl>
          </SliderRoot>
        `,
      }))

      expect(screen.getByRole('group')).toHaveAttribute('data-disabled')
      expect(screen.getByTestId('value')).toHaveAttribute('data-disabled')
      expect(screen.getByTestId('control')).toHaveAttribute('data-disabled')
      expect(screen.getByTestId('track')).toHaveAttribute('data-disabled')
      expect(screen.getByTestId('indicator')).toHaveAttribute('data-disabled')
      expect(screen.getByTestId('thumb')).toHaveAttribute('data-disabled')
      expect(screen.getByRole('slider')).toBeDisabled()
    })

    it.skipIf(typeof Touch === 'undefined')('should not respond to drag events if disabled', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="21" disabled>
            <SliderValue data-testid="value" />
            <SliderControl data-testid="control">
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb aria-label="Volume" />
              </SliderTrack>
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      const control = screen.getByTestId('control')
      vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

      fireEvent.touchStart(
        control,
        createTouches([{ identifier: 1, clientX: 21, clientY: 0 }]),
      )
      fireEvent.touchMove(
        document.body,
        createTouches([{ identifier: 1, clientX: 30, clientY: 0 }]),
      )
      fireEvent.touchEnd(
        document.body,
        createTouches([{ identifier: 1, clientX: 30, clientY: 0 }]),
      )

      expect(slider).toHaveAttribute('aria-valuenow', '21')
    })
  })

  describe('prop: orientation', () => {
    it('sets the `aria-orientation` attribute', () => {
      render(createSliderApp({
        template: `
          <SliderRoot orientation="vertical">
            <SliderControl>
              <SliderThumb aria-label="Volume" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical')
    })

    it('sets the data-orientation attribute', () => {
      render(createSliderApp({
        template: `
          <SliderRoot>
            <SliderValue data-testid="value" />
            <SliderControl data-testid="control">
              <SliderThumb aria-label="Volume" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('data-orientation', 'horizontal')
      expect(screen.getByTestId('control')).toHaveAttribute('data-orientation', 'horizontal')
      expect(screen.getByTestId('value')).toHaveAttribute('data-orientation', 'horizontal')
    })

    it.skipIf(typeof Touch === 'undefined')('should report the right position', () => {
      const onValueChange = vi.fn()

      render(createSliderApp({
        setup() {
          return { onValueChange }
        },
        template: `
          <SliderRoot orientation="vertical" :default-value="20" @value-change="onValueChange">
            <SliderValue data-testid="value" />
            <SliderControl data-testid="control">
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb aria-label="Volume" />
              </SliderTrack>
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const control = screen.getByTestId('control')
      vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => ({
        width: 10,
        height: 100,
        bottom: 100,
        left: 0,
        x: 0,
        y: 0,
        top: 0,
        right: 10,
        toJSON() {},
      }))

      fireEvent.touchStart(
        control,
        createTouches([{ identifier: 1, clientX: 0, clientY: 20 }]),
      )
      fireEvent.touchMove(
        document.body,
        createTouches([{ identifier: 1, clientX: 0, clientY: 22 }]),
      )

      expect(onValueChange).toHaveBeenCalledTimes(2)
      expect(onValueChange.mock.calls[0]?.[0]).toBe(80)
      expect(onValueChange.mock.calls[1]?.[0]).toBe(78)
    })
  })

  describe('prop: step', () => {
    it('supports non-integer values', () => {
      render(createSliderApp({
        template: `
          <div>
            <SliderRoot :value="51.1" :min="-100" :max="100" :step="0.00000001">
              <SliderControl><SliderThumb /></SliderControl>
            </SliderRoot>
            <SliderRoot :value="0.00000005" :min="-100" :max="100" :step="0.00000001">
              <SliderControl><SliderThumb /></SliderControl>
            </SliderRoot>
            <SliderRoot :value="0.0000001" :min="-100" :max="100" :step="0.00000001">
              <SliderControl><SliderThumb /></SliderControl>
            </SliderRoot>
          </div>
        `,
      }))

      const [slider1, slider2, slider3] = screen.getAllByRole('slider')
      expect(slider1).toHaveAttribute('aria-valuenow', '51.1')
      expect(slider2).toHaveAttribute('aria-valuenow', '5e-8')
      expect(slider3).toHaveAttribute('aria-valuenow', '1e-7')
    })

    it.skipIf(typeof Touch === 'undefined')('should round value to step precision', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="0.2" :min="0" :max="1" :step="0.1">
            <SliderValue data-testid="value" />
            <SliderControl data-testid="control">
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb aria-label="Volume" />
              </SliderTrack>
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      const control = screen.getByTestId('control')
      vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

      expect(slider).toHaveAttribute('aria-valuenow', '0.2')

      fireEvent.touchStart(
        control,
        createTouches([{ identifier: 1, clientX: 20, clientY: 0 }]),
      )
      fireEvent.touchMove(
        document.body,
        createTouches([{ identifier: 1, clientX: 80, clientY: 0 }]),
      )
      expect(slider).toHaveAttribute('aria-valuenow', '0.8')

      fireEvent.touchMove(
        document.body,
        createTouches([{ identifier: 1, clientX: 40, clientY: 0 }]),
      )
      expect(slider).toHaveAttribute('aria-valuenow', '0.4')
    })
  })

  describe('prop: max', () => {
    it('sets the max attribute on the input', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="150" :step="100" :max="750">
            <SliderControl><SliderThumb /></SliderControl>
          </SliderRoot>
        `,
      }))

      expect(screen.getByRole('slider')).toHaveAttribute('max', '750')
    })

    it('should not go more than the max', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <SliderRoot :default-value="100" :step="100" :max="200">
            <SliderControl><SliderThumb /></SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      await user.tab()

      await user.keyboard('[ArrowRight]')
      expect(slider).toHaveAttribute('aria-valuenow', '200')
      await user.keyboard('[ArrowRight]')
      expect(slider).toHaveAttribute('aria-valuenow', '200')
    })

    it.skipIf(typeof Touch === 'undefined')('should reach right edge value', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="90" :min="6" :max="108" :step="10">
            <SliderValue data-testid="value" />
            <SliderControl data-testid="control">
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb aria-label="Volume" />
              </SliderTrack>
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      const control = screen.getByTestId('control')
      vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

      expect(slider).toHaveAttribute('aria-valuenow', '90')

      fireEvent.touchStart(
        control,
        createTouches([{ identifier: 1, clientX: 20, clientY: 0 }]),
      )
      fireEvent.touchMove(
        document.body,
        createTouches([{ identifier: 1, clientX: 100, clientY: 0 }]),
      )
      expect(slider).toHaveAttribute('aria-valuenow', '106')

      fireEvent.touchMove(
        document.body,
        createTouches([{ identifier: 1, clientX: 200, clientY: 0 }]),
      )
      expect(slider).toHaveAttribute('aria-valuenow', '106')

      fireEvent.touchMove(
        document.body,
        createTouches([{ identifier: 1, clientX: 50, clientY: 0 }]),
      )
      expect(slider).toHaveAttribute('aria-valuenow', '56')

      fireEvent.touchMove(
        document.body,
        createTouches([{ identifier: 1, clientX: -100, clientY: 0 }]),
      )
      expect(slider).toHaveAttribute('aria-valuenow', '6')
    })
  })

  describe('prop: min', () => {
    it('sets the min attribute on the input', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="150" :step="100" :min="150" :max="200">
            <SliderControl><SliderThumb /></SliderControl>
          </SliderRoot>
        `,
      }))

      expect(screen.getByRole('slider')).toHaveAttribute('min', '150')
    })

    it('should use min as the step origin', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="150" :step="100" :max="750" :min="150">
            <SliderControl><SliderThumb /></SliderControl>
          </SliderRoot>
        `,
      }))

      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '150')
    })

    it('should not go less than the min', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <SliderRoot :default-value="1" :step="1" :min="0">
            <SliderControl><SliderThumb /></SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      await user.tab()

      await user.keyboard('[ArrowLeft]')
      expect(slider).toHaveAttribute('aria-valuenow', '0')
      await user.keyboard('[ArrowLeft]')
      expect(slider).toHaveAttribute('aria-valuenow', '0')
    })
  })

  describe('prop: minStepsBetweenValues', () => {
    it('should enforce a minimum difference between range slider values', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(createSliderApp({
        setup() {
          return { onValueChange }
        },
        template: `
          <SliderRoot
            :default-value="[44, 50]"
            :step="2"
            :min-steps-between-values="2"
            @value-change="onValueChange"
          >
            <SliderControl>
              <SliderThumb :index="0" />
              <SliderThumb :index="1" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      await user.tab()

      await user.keyboard('[ArrowUp]')
      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0]?.[0]).toEqual([46, 50])

      await user.keyboard('[ArrowUp]')
      expect(onValueChange).toHaveBeenCalledTimes(1)

      await user.tab()

      await user.keyboard('[ArrowUp]')
      expect(onValueChange).toHaveBeenCalledTimes(2)
      expect(onValueChange.mock.calls[1]?.[0]).toEqual([46, 52])

      await user.keyboard('[ArrowDown]')
      await user.keyboard('[ArrowDown]')
      expect(onValueChange).toHaveBeenCalledTimes(3)
      expect(onValueChange.mock.calls[2]?.[0]).toEqual([46, 50])
    })
  })

  describe('prop: onValueCommitted', () => {
    it('single value', () => {
      const onValueCommitted = vi.fn()

      render(createSliderApp({
        setup() {
          return { onValueCommitted }
        },
        template: `
          <SliderRoot :default-value="0" @value-committed="onValueCommitted">
            <SliderControl>
              <SliderThumb aria-label="Volume" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: 23 } })

      expect(onValueCommitted).toHaveBeenCalledTimes(1)
      expect(onValueCommitted.mock.calls[0]?.[0]).toBe(23)
      expect(onValueCommitted.mock.calls[0]?.[1].reason).toBe('input-change')
    })

    it('array value', () => {
      const onValueCommitted = vi.fn()

      render(createSliderApp({
        setup() {
          return { onValueCommitted }
        },
        template: `
          <SliderRoot :default-value="[10, 20]" @value-committed="onValueCommitted">
            <SliderControl>
              <SliderThumb :index="0" />
              <SliderThumb :index="1" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const [, secondThumb] = screen.getAllByRole('slider')
      fireEvent.change(secondThumb, { target: { value: 30 } })

      expect(onValueCommitted).toHaveBeenCalledTimes(1)
      expect(onValueCommitted.mock.calls[0]?.[0]).toEqual([10, 30])
      expect(onValueCommitted.mock.calls[0]?.[1].reason).toBe('input-change')
    })
  })

  describe('events', () => {
    it('should call handlers', async () => {
      const onValueChange = vi.fn()
      const onValueCommitted = vi.fn()

      render(createSliderApp({
        setup() {
          return { onValueChange, onValueCommitted }
        },
        template: `
          <SliderRoot
            :value="0"
            @value-change="onValueChange"
            @value-committed="onValueCommitted"
          >
            <SliderControl data-testid="control">
              <SliderThumb />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const control = screen.getByTestId('control')
      vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

      fireEvent.pointerDown(control, {
        buttons: 1,
        clientX: 10,
      })
      fireEvent.pointerUp(control, {
        buttons: 1,
        clientX: 10,
      })

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0]?.[0]).toBe(10)
      expect(onValueChange.mock.calls[0]?.[1].reason).toBe('track-press')
      expect(onValueCommitted).toHaveBeenCalledTimes(1)
      expect(onValueCommitted.mock.calls[0]?.[0]).toBe(10)
      expect(onValueCommitted.mock.calls[0]?.[1].reason).toBe('track-press')
    })

    it('should focus the slider when dragging', async () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="30" :step="10">
            <SliderControl data-testid="control">
              <SliderThumb data-testid="thumb" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      const thumb = screen.getByTestId('thumb')
      const control = screen.getByTestId('control')
      vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

      fireEvent.pointerDown(thumb, {
        buttons: 1,
        clientX: 1,
      })

      await waitFor(() => {
        expect(slider).toHaveFocus()
      })
    })
  })

  describe('prop: onValueChange', () => {
    it('is not called when clicking on the thumb', () => {
      const onValueChange = vi.fn()

      render(createSliderApp({
        setup() {
          return { onValueChange }
        },
        template: `
          <SliderRoot :default-value="50" @value-change="onValueChange">
            <SliderControl data-testid="control">
              <SliderThumb data-testid="thumb" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const control = screen.getByTestId('control')
      const thumb = screen.getByTestId('thumb')
      vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

      fireEvent.pointerDown(thumb, {
        buttons: 1,
        clientX: 51,
      })

      expect(onValueChange).toHaveBeenCalledTimes(0)
    })

    it('should not react to right clicks', () => {
      const onValueChange = vi.fn()

      render(createSliderApp({
        setup() {
          return { onValueChange }
        },
        template: `
          <SliderRoot :default-value="50" @value-change="onValueChange">
            <SliderControl data-testid="control">
              <SliderThumb />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const control = screen.getByTestId('control')
      vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

      fireEvent.pointerDown(control, {
        button: 2,
        buttons: 2,
        clientX: 41,
      })

      expect(onValueChange).toHaveBeenCalledTimes(0)
    })

    it('provides the change reason for input events', () => {
      const onValueChange = vi.fn()

      render(createSliderApp({
        setup() {
          return { onValueChange }
        },
        template: `
          <SliderRoot :default-value="30" @value-change="onValueChange">
            <SliderControl>
              <SliderThumb />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '35' } })

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0]?.[1].reason).toBe('input-change')
      expect(onValueChange.mock.calls[0]?.[1].activeThumbIndex).toBe(0)
    })

    it('provides the change reason for keyboard interactions', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(createSliderApp({
        setup() {
          return { onValueChange }
        },
        template: `
          <SliderRoot :default-value="40" @value-change="onValueChange">
            <SliderControl>
              <SliderThumb />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      await user.tab()
      await user.keyboard('[ArrowRight]')

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0]?.[1].reason).toBe('keyboard')
    })

    it('provides the change reason for track presses', () => {
      const onValueChange = vi.fn()

      render(createSliderApp({
        setup() {
          return { onValueChange }
        },
        template: `
          <SliderRoot :default-value="0" @value-change="onValueChange">
            <SliderControl data-testid="control">
              <SliderThumb />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const control = screen.getByTestId('control')
      vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

      fireEvent.pointerDown(control, {
        pointerId: 1,
        pointerType: 'mouse',
        button: 0,
        buttons: 1,
        clientX: 80,
        clientY: 0,
      })

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0]?.[1].reason).toBe('track-press')
    })

    it('should pass "name" and "value" as part of the event.target for onValueChange', () => {
      const onValueChange = vi.fn((value, details) => details.event.target)

      render(createSliderApp({
        setup() {
          return { onValueChange }
        },
        template: `
          <SliderRoot name="change-testing" :value="3" @value-change="onValueChange">
            <SliderControl>
              <SliderThumb aria-label="Volume" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: 4 } })

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.results[0]?.value).toEqual({
        name: 'change-testing',
        value: 4,
      })
    })

    it.skipIf(typeof Touch === 'undefined')('should support touch events', () => {
      const onValueChange = vi.fn()

      render(createSliderApp({
        setup() {
          return { onValueChange }
        },
        template: `
          <SliderRoot :default-value="[20, 30]" style="width: 100px" @value-change="onValueChange">
            <SliderControl data-testid="control">
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb :index="0" />
                <SliderThumb :index="1" />
              </SliderTrack>
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const control = screen.getByTestId('control')
      vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

      fireEvent.touchStart(
        control,
        createTouches([{ identifier: 1, clientX: 20, clientY: 0 }]),
      )

      fireEvent.touchMove(
        document.body,
        createTouches([{ identifier: 1, clientX: 21, clientY: 0 }]),
      )

      fireEvent.touchEnd(
        document.body,
        createTouches([{ identifier: 1, clientX: 21, clientY: 0 }]),
      )

      fireEvent.touchStart(
        control,
        createTouches([{ identifier: 1, clientX: 21, clientY: 0 }]),
      )

      fireEvent.touchMove(
        document.body,
        createTouches([{ identifier: 1, clientX: 22, clientY: 0 }]),
      )

      fireEvent.touchEnd(
        document.body,
        createTouches([{ identifier: 1, clientX: 22, clientY: 0 }]),
      )

      fireEvent.touchStart(
        control,
        createTouches([{ identifier: 1, clientX: 22, clientY: 0 }]),
      )

      fireEvent.touchMove(
        document.body,
        createTouches([{ identifier: 1, clientX: 22.1, clientY: 0 }]),
      )

      fireEvent.touchEnd(
        document.body,
        createTouches([{ identifier: 1, clientX: 22.1, clientY: 0 }]),
      )

      expect(onValueChange).toHaveBeenCalledTimes(2)
      expect(onValueChange.mock.calls[0]?.[0]).toEqual([21, 30])
      expect(onValueChange.mock.calls[1]?.[0]).toEqual([22, 30])
    })

    it.skipIf(typeof Touch === 'undefined')('should only listen to changes from the same touchpoint', () => {
      const onValueChange = vi.fn()
      const onValueCommitted = vi.fn()

      render(createSliderApp({
        setup() {
          return { onValueChange, onValueCommitted }
        },
        template: `
          <SliderRoot :value="0" @value-change="onValueChange" @value-committed="onValueCommitted">
            <SliderControl data-testid="control">
              <SliderThumb aria-label="Volume" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const control = screen.getByTestId('control')
      vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

      fireEvent.touchStart(
        control,
        createTouches([{ identifier: 1, clientX: 0, clientY: 0 }]),
      )
      expect(onValueChange).toHaveBeenCalledTimes(0)
      expect(onValueCommitted).toHaveBeenCalledTimes(0)

      fireEvent.touchStart(
        document.body,
        createTouches([{ identifier: 2, clientX: 40, clientY: 0 }]),
      )
      expect(onValueChange).toHaveBeenCalledTimes(0)
      expect(onValueCommitted).toHaveBeenCalledTimes(0)

      fireEvent.touchMove(
        document.body,
        createTouches([{ identifier: 1, clientX: 1, clientY: 0 }]),
      )
      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueCommitted).toHaveBeenCalledTimes(0)

      fireEvent.touchMove(
        document.body,
        createTouches([{ identifier: 2, clientX: 41, clientY: 0 }]),
      )
      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueCommitted).toHaveBeenCalledTimes(0)

      fireEvent.touchEnd(
        document.body,
        createTouches([{ identifier: 1, clientX: 2, clientY: 0 }]),
      )
      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueCommitted).toHaveBeenCalledTimes(1)
      expect(onValueCommitted.mock.calls[0]?.[1].reason).toBe('drag')
    })
  })

  describe('keyboard interactions', () => {
    it('key: ArrowLeft decrements the value', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50">
            <SliderControl><SliderThumb /></SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      await user.tab()
      await user.keyboard('[ArrowLeft]')
      expect(slider).toHaveAttribute('aria-valuenow', '49')
    })

    it('key: ArrowRight increments the value', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50">
            <SliderControl><SliderThumb /></SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      await user.tab()
      await user.keyboard('[ArrowRight]')
      expect(slider).toHaveAttribute('aria-valuenow', '51')
    })

    it('key: ArrowRight increments the value by largeStep when Shift is pressed', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50" :large-step="10">
            <SliderControl><SliderThumb /></SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      await user.tab()
      await user.keyboard('{Shift>}[ArrowRight]{/Shift}')
      expect(slider).toHaveAttribute('aria-valuenow', '60')
    })

    it('key: End sets value to max in a single value slider', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50">
            <SliderControl><SliderThumb /></SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      await user.tab()
      await user.keyboard('[End]')
      expect(slider).toHaveAttribute('aria-valuenow', '100')
    })

    it('key: Home sets value to min in a single value slider', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50">
            <SliderControl><SliderThumb /></SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      await user.tab()
      await user.keyboard('[Home]')
      expect(slider).toHaveAttribute('aria-valuenow', '0')
    })

    it('key: PageUp increments the value by largeStep', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50" :large-step="10">
            <SliderControl><SliderThumb /></SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      await user.tab()
      await user.keyboard('[PageUp]')
      expect(slider).toHaveAttribute('aria-valuenow', '60')
    })

    it('key: PageDown decrements the value by largeStep', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50" :large-step="10">
            <SliderControl><SliderThumb /></SliderControl>
          </SliderRoot>
        `,
      }))

      const slider = screen.getByRole('slider')
      await user.tab()
      await user.keyboard('[PageDown]')
      expect(slider).toHaveAttribute('aria-valuenow', '40')
    })
  })

  describe('value rendering', () => {
    it('renders a single value', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="40">
            <SliderValue data-testid="output" />
          </SliderRoot>
        `,
      }))

      expect(screen.getByTestId('output')).toHaveTextContent('40')
    })

    it('renders a range', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="[40, 65]">
            <SliderValue data-testid="output" />
          </SliderRoot>
        `,
      }))

      expect(screen.getByTestId('output')).toHaveTextContent('40 – 65')
    })
  })

  describe('prop: format', () => {
    it('formats the value', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="40" :format="{ style: 'currency', currency: 'USD' }">
            <SliderValue data-testid="value" />
            <SliderControl>
              <SliderThumb />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      expect(screen.getByTestId('value')).toHaveTextContent(
        new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(40),
      )
    })

    it('formats range values', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="[40, 60]" :format="{ style: 'currency', currency: 'USD' }">
            <SliderValue data-testid="value" />
            <SliderControl>
              <SliderThumb :index="0" />
              <SliderThumb :index="1" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })
      expect(screen.getByTestId('value')).toHaveTextContent(
        `${formatter.format(40)} – ${formatter.format(60)}`,
      )
    })
  })

  describe('prop: locale', () => {
    it('sets the locale when formatting a single value', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="1234.56" :max="5000" locale="de-DE" :format="{ style: 'currency', currency: 'EUR' }">
            <SliderValue data-testid="value" />
          </SliderRoot>
        `,
      }))

      const expected = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
        .format(1234.56)
        .replace(/\u00A0/g, ' ')
      expect(screen.getByTestId('value')).toHaveTextContent(expected)
    })

    it('sets the locale when formatting a range value', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="[1234.56, 2345.67]" :max="5000" locale="de-DE" :format="{ style: 'currency', currency: 'EUR' }">
            <SliderValue data-testid="value" />
          </SliderRoot>
        `,
      }))

      const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
      const expected = `${formatter.format(1234.56)} – ${formatter.format(2345.67)}`.replace(/\u00A0/g, ' ')
      expect(screen.getByTestId('value')).toHaveTextContent(expected)
    })
  })

  describe('form', () => {
    it('should include the slider value', () => {
      render(createSliderApp({
        template: `
          <Form>
            <SliderRoot name="volume" :default-value="25">
              <SliderControl>
                <SliderThumb />
              </SliderControl>
            </SliderRoot>
          </Form>
        `,
      }))

      const form = screen.getByRole('group').closest('form')
      const formData = new FormData(form!)
      expect(formData.get('volume')).toBe('25')
    })

    it('should include range slider value', () => {
      render(createSliderApp({
        template: `
          <Form>
            <SliderRoot name="volume" :default-value="[25, 75]">
              <SliderControl>
                <SliderThumb :index="0" />
                <SliderThumb :index="1" />
              </SliderControl>
            </SliderRoot>
          </Form>
        `,
      }))

      const form = screen.getByRole('group').closest('form')
      const formData = new FormData(form!)
      expect(formData.getAll('volume')).toEqual(['25', '75'])
    })

    it('submits to an external form when `form` is provided', () => {
      render(createSliderApp({
        template: `
          <div>
            <SliderRoot form="external-form" name="volume" :default-value="25">
              <SliderControl>
                <SliderThumb />
              </SliderControl>
            </SliderRoot>
            <form id="external-form" data-testid="form" />
          </div>
        `,
      }))

      const formData = new FormData(screen.getByTestId('form') as HTMLFormElement)
      expect(formData.get('volume')).toBe('25')
    })
  })

  describe('field', () => {
    it('sets aria-labelledby from Field label', async () => {
      render(createSliderApp({
        template: `
          <FieldRoot>
            <FieldLabel>Volume</FieldLabel>
            <SliderRoot :default-value="50">
              <SliderControl>
                <SliderThumb />
              </SliderControl>
            </SliderRoot>
          </FieldRoot>
        `,
      }))

      await nextTick()
      expect(screen.getByRole('slider')).toHaveAttribute('aria-labelledby')
    })

    it('should receive disabled prop from FieldRoot', () => {
      render(createSliderApp({
        template: `
          <FieldRoot disabled>
            <SliderRoot :default-value="50">
              <SliderControl>
                <SliderThumb />
              </SliderControl>
            </SliderRoot>
          </FieldRoot>
        `,
      }))

      expect(screen.getByRole('slider')).toBeDisabled()
    })

    it('should receive name prop from Field.Root', () => {
      render(createSliderApp({
        template: `
          <Form>
            <FieldRoot name="field-volume">
              <SliderRoot :default-value="50">
                <SliderControl>
                  <SliderThumb />
                </SliderControl>
              </SliderRoot>
            </FieldRoot>
          </Form>
        `,
      }))

      const form = screen.getByRole('group').closest('form')
      const formData = new FormData(form!)
      expect(formData.get('field-volume')).toBe('50')
    })

    it('fieldDescription', async () => {
      render(createSliderApp({
        template: `
          <FieldRoot>
            <FieldDescription>Help text</FieldDescription>
            <SliderRoot :default-value="50">
              <SliderControl>
                <SliderThumb />
              </SliderControl>
            </SliderRoot>
          </FieldRoot>
        `,
      }))

      await nextTick()
      expect(screen.getByRole('slider')).toHaveAttribute('aria-describedby')
    })

    it('[data-dirty]', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <FieldRoot>
            <SliderRoot :default-value="50" data-testid="root">
              <SliderControl>
                <SliderThumb />
              </SliderControl>
            </SliderRoot>
          </FieldRoot>
        `,
      }))

      const root = screen.getByTestId('root')
      expect(root).not.toHaveAttribute('data-dirty')
      await user.tab()
      await user.keyboard('[ArrowRight]')
      expect(root).toHaveAttribute('data-dirty')
    })

    it('[data-touched]', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <FieldRoot>
            <SliderRoot :default-value="50" data-testid="root">
              <SliderControl>
                <SliderThumb />
              </SliderControl>
            </SliderRoot>
            <button data-testid="after">After</button>
          </FieldRoot>
        `,
      }))

      const root = screen.getByTestId('root')
      expect(root).not.toHaveAttribute('data-touched')
      await user.tab()
      await user.tab()
      expect(root).toHaveAttribute('data-touched')
    })

    it('[data-focused]', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <FieldRoot>
            <SliderRoot :default-value="50" data-testid="root">
              <SliderControl>
                <SliderThumb />
              </SliderControl>
            </SliderRoot>
            <button data-testid="after">After</button>
          </FieldRoot>
        `,
      }))

      const root = screen.getByTestId('root')
      expect(root).not.toHaveAttribute('data-focused')
      await user.tab()
      expect(root).toHaveAttribute('data-focused')
      await user.tab()
      expect(root).not.toHaveAttribute('data-focused')
    })
  })
})
