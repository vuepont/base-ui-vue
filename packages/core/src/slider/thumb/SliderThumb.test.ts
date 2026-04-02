import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import {
  SliderControl,
  SliderIndicator,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from '..'
import { Slot } from '../../utils/slot'
import { createTouches, getHorizontalSliderRect } from '../utils/test-utils'

function createSliderApp(options: {
  template: string
  setup?: () => Record<string, unknown>
}) {
  return defineComponent({
    components: {
      SliderControl,
      SliderIndicator,
      SliderRoot,
      SliderThumb,
      SliderTrack,
      Slot,
    },
    setup: options.setup,
    template: options.template,
  })
}

function getThumbRect(size = 10) {
  return () => ({
    width: size,
    height: size,
    bottom: size,
    left: 0,
    right: size,
    top: 0,
    x: 0,
    y: 0,
    toJSON() {},
  })
}

describe('<SliderThumb />', () => {
  describe('aRIA attributes', () => {
    (['aria-label', 'aria-labelledby', 'aria-describedby'] as const).forEach((attr) => {
      it(`forwards ${attr} to the input`, () => {
        render(createSliderApp({
          template: `
            <SliderRoot :default-value="50">
              <SliderControl>
                <SliderThumb ${attr}="test" />
              </SliderControl>
            </SliderRoot>
          `,
        }))

        expect(screen.getByRole('slider')).toHaveAttribute(attr, 'test')
      })
    })
  })

  describe('events', () => {
    describe('focus and blur', () => {
      it('single thumb', async () => {
        const user = userEvent.setup()
        const focusAndBlurSpy = vi.fn((event: FocusEvent) => event.target)

        render(createSliderApp({
          setup: () => ({ focusAndBlurSpy }),
          template: `
            <SliderRoot :default-value="50">
              <SliderControl>
                <SliderThumb @focus="focusAndBlurSpy" @blur="focusAndBlurSpy" />
              </SliderControl>
            </SliderRoot>
          `,
        }))

        expect(document.body).toHaveFocus()
        const input = screen.getByRole('slider')
        expect(input.tagName).toBe('INPUT')
        expect(input).toHaveAttribute('type', 'range')

        await user.tab()
        expect(input).toHaveFocus()
        expect(focusAndBlurSpy).toHaveBeenCalledTimes(1)
        expect(focusAndBlurSpy.mock.results[0]?.value).toBe(input)

        await user.tab()
        expect(document.body).toHaveFocus()
        expect(focusAndBlurSpy).toHaveBeenCalledTimes(2)
        expect(focusAndBlurSpy.mock.results.at(-1)?.value).toBe(input)
      })

      it('multiple thumbs', async () => {
        const user = userEvent.setup()
        const focusSpy = vi.fn((event: FocusEvent) => event.target)
        const blurSpy = vi.fn((event: FocusEvent) => event.target)

        render(createSliderApp({
          setup: () => ({ focusSpy, blurSpy }),
          template: `
            <SliderRoot :default-value="[50, 70]">
              <SliderControl>
                <SliderThumb @focus="focusSpy" @blur="blurSpy" />
                <SliderThumb @focus="focusSpy" @blur="blurSpy" />
              </SliderControl>
            </SliderRoot>
          `,
        }))

        expect(document.body).toHaveFocus()
        const [slider1, slider2] = screen.getAllByRole('slider')
        expect(slider1).toHaveProperty('tagName', 'INPUT')
        expect(slider1).toHaveAttribute('type', 'range')
        expect(slider2).toHaveProperty('tagName', 'INPUT')
        expect(slider2).toHaveAttribute('type', 'range')

        await user.tab()
        expect(slider1).toHaveFocus()
        expect(focusSpy).toHaveBeenCalledTimes(1)
        expect(focusSpy.mock.results.at(-1)?.value).toBe(slider1)

        await user.tab()
        expect(blurSpy).toHaveBeenCalledTimes(1)
        expect(blurSpy.mock.results.at(-1)?.value).toBe(slider1)
        expect(slider2).toHaveFocus()
        expect(focusSpy).toHaveBeenCalledTimes(2)
        expect(focusSpy.mock.results.at(-1)?.value).toBe(slider2)

        await user.tab()
        expect(blurSpy).toHaveBeenCalledTimes(2)
        expect(blurSpy.mock.results.at(-1)?.value).toBe(slider2)
        expect(document.body).toHaveFocus()
      })

      it('does not emit extra blur and focus events when restoring focus-visible', async () => {
        const focusSpy = vi.fn((event: FocusEvent) => event.target)
        const blurSpy = vi.fn((event: FocusEvent) => event.target)

        render(createSliderApp({
          setup: () => ({ focusSpy, blurSpy }),
          template: `
            <SliderRoot :default-value="40">
              <SliderControl data-testid="control">
                <SliderThumb @focus="focusSpy" @blur="blurSpy" />
              </SliderControl>
            </SliderRoot>
          `,
        }))

        const sliderControl = screen.getByTestId('control')
        vi.spyOn(sliderControl, 'getBoundingClientRect').mockImplementation(() => getHorizontalSliderRect())

        const slider = screen.getByRole('slider')

        fireEvent.pointerDown(sliderControl, {
          pointerId: 1,
          pointerType: 'mouse',
          button: 0,
          buttons: 1,
          clientX: 40,
          clientY: 0,
        })

        await waitFor(() => {
          expect(slider).toHaveFocus()
        })
        expect(focusSpy).toHaveBeenCalledTimes(1)
        expect(focusSpy.mock.results[0]?.value).toBe(slider)
        expect(blurSpy).not.toHaveBeenCalled()

        fireEvent.keyDown(slider, { key: 'ArrowRight' })

        expect(focusSpy).toHaveBeenCalledTimes(1)
        expect(blurSpy).not.toHaveBeenCalled()
      })
    })

    describe('change', () => {
      it('handles change events', async () => {
        const onValueChange = vi.fn()

        render(createSliderApp({
          setup: () => ({ onValueChange }),
          template: `
            <SliderRoot :default-value="50" @value-change="onValueChange">
              <SliderControl>
                <SliderThumb />
              </SliderControl>
            </SliderRoot>
          `,
        }))

        const slider = screen.getByRole('slider')
        expect(slider).toHaveAttribute('aria-valuenow', '50')

        fireEvent.change(slider, { target: { value: '51' } })
        await nextTick()

        expect(onValueChange).toHaveBeenCalledTimes(1)
        expect(slider).toHaveAttribute('aria-valuenow', '51')
      })

      it('does not change the value beyond min and max', async () => {
        const onValueChange = vi.fn()

        render(createSliderApp({
          setup: () => ({ onValueChange }),
          template: `
            <SliderRoot :default-value="50" :min="40" :max="60" @value-change="onValueChange">
              <SliderControl>
                <SliderThumb />
              </SliderControl>
            </SliderRoot>
          `,
        }))

        const slider = screen.getByRole('slider')
        expect(slider).toHaveAttribute('aria-valuenow', '50')

        fireEvent.change(slider, { target: { value: '30' } })
        await nextTick()
        expect(slider).toHaveAttribute('aria-valuenow', '40')
        expect(onValueChange).toHaveBeenCalledTimes(1)

        fireEvent.change(slider, { target: { value: '30' } })
        await nextTick()
        expect(onValueChange).toHaveBeenCalledTimes(1)

        fireEvent.change(slider, { target: { value: '70' } })
        await nextTick()
        expect(slider).toHaveAttribute('aria-valuenow', '60')
        expect(onValueChange).toHaveBeenCalledTimes(2)

        fireEvent.change(slider, { target: { value: '70' } })
        await nextTick()
        expect(onValueChange).toHaveBeenCalledTimes(2)
      })

      it('handles non-integer values', async () => {
        const onValueChange = vi.fn()

        render(createSliderApp({
          setup: () => ({ onValueChange }),
          template: `
            <SliderRoot
              :default-value="50"
              :min="-100"
              :max="100"
              :step="0.00000001"
              @value-change="onValueChange"
            >
              <SliderControl>
                <SliderThumb />
              </SliderControl>
            </SliderRoot>
          `,
        }))

        const slider = screen.getByRole('slider')
        expect(slider).toHaveAttribute('aria-valuenow', '50')
        expect(slider).toHaveAttribute('step', '1e-8')

        fireEvent.change(slider, { target: { value: '51.1' } })
        await nextTick()
        expect(slider).toHaveAttribute('aria-valuenow', '51.1')

        fireEvent.change(slider, { target: { value: '0.00000005' } })
        await nextTick()
        expect(slider).toHaveAttribute('aria-valuenow', '5e-8')

        fireEvent.change(slider, { target: { value: '1e-7' } })
        await nextTick()
        expect(slider).toHaveAttribute('aria-valuenow', '1e-7')
      })
    })
  })

  describe('prop: tabIndex', () => {
    it('does not apply tabIndex to the thumb element by default', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50">
            <SliderControl>
              <SliderThumb data-testid="thumb" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      expect(screen.getByTestId('thumb')).not.toHaveAttribute('tabindex')
      expect(screen.getByRole('slider')).toHaveProperty('tabIndex', 0)
    })

    it('can be removed from the tab sequence', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50">
            <SliderControl>
              <SliderThumb :tab-index="-1" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      expect(screen.getByRole('slider')).toHaveProperty('tabIndex', -1)
      expect(document.body).toHaveFocus()

      await user.tab()
      expect(document.body).toHaveFocus()
    })
  })

  describe('prop: children', () => {
    it('renders the nested input as a sibling to children', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="50">
            <SliderControl>
              <SliderThumb data-testid="thumb">
                <span data-testid="child" />
              </SliderThumb>
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const thumb = screen.getByTestId('thumb')
      expect(thumb.querySelector('input[type="range"]')).toBe(screen.getByRole('slider'))
      expect(thumb.querySelector('[data-testid="child"]')).toBe(screen.getByTestId('child'))
    })

    it.skip('renders the nested input when using renderless mode via Slot', () => {
      render(createSliderApp({
        setup: () => ({ Slot }),
        template: `
          <SliderRoot :default-value="50">
            <SliderControl>
              <SliderThumb :as="Slot" v-slot="{ props, ref }">
                <div data-testid="thumb" v-bind="props" :ref="ref">
                  <span data-testid="child" />
                </div>
              </SliderThumb>
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const thumb = screen.getByTestId('thumb')
      expect(thumb.querySelector('input[type="range"]')).toBe(screen.getByRole('slider'))
      expect(thumb.querySelector('[data-testid="child"]')).toBe(screen.getByTestId('child'))
    })
  })

  describe('prop: inputRef', () => {
    it('can focus the input element', async () => {
      const user = userEvent.setup()

      render(defineComponent({
        components: {
          SliderControl,
          SliderRoot,
          SliderThumb,
        },
        setup() {
          let inputRef: HTMLInputElement | null = null

          return {
            setInputRef(node: HTMLInputElement | null) {
              inputRef = node
            },
            focusInput() {
              inputRef?.focus()
            },
          }
        },
        template: `
          <div>
            <SliderRoot :default-value="50">
              <SliderControl>
                <SliderThumb :input-ref="setInputRef" />
              </SliderControl>
            </SliderRoot>
            <button @click="focusInput">Button</button>
          </div>
        `,
      }))

      expect(document.body).toHaveFocus()
      await user.click(screen.getByText('Button'))
      expect(screen.getByRole('slider')).toHaveFocus()
    })
  })

  describe('stacking order', () => {
    it('relies on DOM order before any thumb is used', () => {
      render(createSliderApp({
        template: `
          <SliderRoot :default-value="[20, 20]">
            <SliderControl>
              <SliderThumb data-testid="thumb-0" />
              <SliderThumb data-testid="thumb-1" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      expect(screen.getByTestId('thumb-0').style.zIndex).toBe('')
      expect(screen.getByTestId('thumb-1').style.zIndex).toBe('')
    })

    it('keeps the most recently active thumb on top after focus moves away', async () => {
      const user = userEvent.setup()

      render(createSliderApp({
        template: `
          <SliderRoot :default-value="[20, 20]">
            <SliderControl>
              <SliderThumb data-testid="thumb-0" />
              <SliderThumb data-testid="thumb-1" />
            </SliderControl>
          </SliderRoot>
        `,
      }))

      const thumb0 = screen.getByTestId('thumb-0')
      const thumb1 = screen.getByTestId('thumb-1')

      await user.tab()
      expect(screen.getAllByRole('slider')[0]).toHaveFocus()
      expect(thumb0.style.zIndex).toBe('2')

      await user.tab()
      expect(screen.getAllByRole('slider')[1]).toHaveFocus()
      expect(thumb1.style.zIndex).toBe('2')

      await user.tab()
      expect(document.body).toHaveFocus()
      expect(thumb1.style.zIndex).toBe('1')
      expect(thumb0.style.zIndex).toBe('')
    })
  })

  describe('prop: thumbAlignment', () => {
    it('recomputes inset positions when the slider becomes visible', async () => {
      const user = userEvent.setup()
      const resizeCallbacks: Array<() => void> = []
      let visible = false

      class ResizeObserverMock {
        callback: () => void

        constructor(callback: () => void) {
          this.callback = callback
          resizeCallbacks.push(callback)
        }

        observe() {}
        disconnect() {}
      }

      vi.stubGlobal('ResizeObserver', ResizeObserverMock)

      render(createSliderApp({
        setup: () => {
          const isVisible = ref(false)

          return {
            isVisible,
            show() {
              visible = true
              isVisible.value = true
            },
          }
        },
        template: `
          <div>
            <button type="button" @click="show">show</button>
            <div :style="{ display: isVisible ? 'block' : 'none' }">
              <SliderRoot :default-value="30" thumb-alignment="edge" style="width: 100px">
                <SliderControl data-testid="control" style="position: relative; width: 100%; height: 10px">
                  <SliderTrack style="position: relative; width: 100%; height: 10px">
                    <SliderIndicator data-testid="indicator" />
                    <SliderThumb data-testid="thumb" style="width: 10px; height: 10px" />
                  </SliderTrack>
                </SliderControl>
              </SliderRoot>
            </div>
          </div>
        `,
      }))

      try {
        const control = screen.getByTestId('control')
        const thumb = screen.getByTestId('thumb')
        const indicator = screen.getByTestId('indicator')

        vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() =>
          visible
            ? getHorizontalSliderRect(100)
            : getHorizontalSliderRect(0))
        vi.spyOn(thumb, 'getBoundingClientRect').mockImplementation(() =>
          visible
            ? getThumbRect(10)()
            : getThumbRect(0)())

        await waitFor(() => {
          expect(thumb.style.visibility).toBe('hidden')
          expect(thumb.style.getPropertyValue('--position')).toBe('0%')
          expect(indicator.style.visibility).toBe('hidden')
          expect(indicator.style.getPropertyValue('--start-position')).toBe('0%')
        })

        await user.click(screen.getByRole('button', { name: 'show' }))
        resizeCallbacks.forEach(callback => callback())

        await waitFor(() => {
          expect(thumb.style.visibility).toBe('')
          expect(thumb.style.getPropertyValue('--position')).toBe('32%')
          expect(indicator.style.visibility).toBe('')
          expect(indicator.style.getPropertyValue('--start-position')).toBe('32%')
        })
      }
      finally {
        vi.unstubAllGlobals()
      }
    })

    it('recomputes range inset positions when the slider becomes visible', async () => {
      const user = userEvent.setup()
      const resizeCallbacks: Array<() => void> = []
      let visible = false

      class ResizeObserverMock {
        callback: () => void

        constructor(callback: () => void) {
          this.callback = callback
          resizeCallbacks.push(callback)
        }

        observe() {}
        disconnect() {}
      }

      vi.stubGlobal('ResizeObserver', ResizeObserverMock)

      render(createSliderApp({
        setup: () => {
          const isVisible = ref(false)

          return {
            isVisible,
            show() {
              visible = true
              isVisible.value = true
            },
          }
        },
        template: `
          <div>
            <button type="button" @click="show">show</button>
            <div :style="{ display: isVisible ? 'block' : 'none' }">
              <SliderRoot :default-value="[30, 70]" thumb-alignment="edge" style="width: 100px">
                <SliderControl data-testid="control" style="position: relative; width: 100%; height: 10px">
                  <SliderTrack style="position: relative; width: 100%; height: 10px">
                    <SliderIndicator data-testid="indicator" />
                    <SliderThumb data-testid="start-thumb" :index="0" style="width: 10px; height: 10px" />
                    <SliderThumb data-testid="end-thumb" :index="1" style="width: 10px; height: 10px" />
                  </SliderTrack>
                </SliderControl>
              </SliderRoot>
            </div>
          </div>
        `,
      }))

      try {
        const control = screen.getByTestId('control')
        const startThumb = screen.getByTestId('start-thumb')
        const endThumb = screen.getByTestId('end-thumb')
        const indicator = screen.getByTestId('indicator')

        vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() =>
          visible
            ? getHorizontalSliderRect(100)
            : getHorizontalSliderRect(0))
        vi.spyOn(startThumb, 'getBoundingClientRect').mockImplementation(() =>
          visible
            ? getThumbRect(10)()
            : getThumbRect(0)())
        vi.spyOn(endThumb, 'getBoundingClientRect').mockImplementation(() =>
          visible
            ? getThumbRect(10)()
            : getThumbRect(0)())

        await waitFor(() => {
          expect(startThumb.style.visibility).toBe('hidden')
          expect(startThumb.style.getPropertyValue('--position')).toBe('0%')
          expect(endThumb.style.visibility).toBe('hidden')
          expect(endThumb.style.getPropertyValue('--position')).toBe('0%')
          expect(indicator.style.visibility).toBe('hidden')
          expect(indicator.style.getPropertyValue('--start-position')).toBe('0%')
          expect(indicator.style.getPropertyValue('--relative-size')).toBe('0%')
        })

        await user.click(screen.getByRole('button', { name: 'show' }))
        resizeCallbacks.forEach(callback => callback())

        await waitFor(() => {
          expect(startThumb.style.visibility).toBe('')
          expect(startThumb.style.getPropertyValue('--position')).toBe('32%')
          expect(endThumb.style.visibility).toBe('')
          expect(endThumb.style.getPropertyValue('--position')).toBe('68%')
          expect(indicator.style.visibility).toBe('')
          expect(indicator.style.getPropertyValue('--start-position')).toBe('32%')
          expect(indicator.style.getPropertyValue('--relative-size')).toBe('36%')
        })
      }
      finally {
        vi.unstubAllGlobals()
      }
    })
  })

  /**
   * Browser tests render with 1024px width by default, so most tests here set
   * the component to `width: 100px` to make the asserted values more readable.
   */
  describe.skipIf(typeof Touch === 'undefined')('positioning styles', () => {
    describe('positions the thumb when dragged', () => {
      it('single thumb', () => {
        render(createSliderApp({
          template: `
            <SliderRoot style="width: 1000px">
              <SliderControl data-testid="control">
                <SliderTrack>
                  <SliderIndicator />
                  <SliderThumb data-testid="thumb" />
                </SliderTrack>
              </SliderControl>
            </SliderRoot>
          `,
        }))

        const sliderControl = screen.getByTestId('control')
        const thumbStyles = getComputedStyle(screen.getByTestId('thumb'))

        vi.spyOn(sliderControl, 'getBoundingClientRect').mockImplementation(() =>
          getHorizontalSliderRect(1000))

        fireEvent.touchStart(
          sliderControl,
          createTouches([{ identifier: 1, clientX: 20, clientY: 0 }]),
        )
        fireEvent.touchMove(
          document.body,
          createTouches([{ identifier: 1, clientX: 199, clientY: 0 }]),
        )
        fireEvent.touchMove(
          document.body,
          createTouches([{ identifier: 1, clientX: 199, clientY: 0 }]),
        )
        fireEvent.touchMove(
          document.body,
          createTouches([{ identifier: 1, clientX: 199, clientY: 0 }]),
        )

        expect(thumbStyles.getPropertyValue('left')).toBe('200px')
        fireEvent.touchEnd(
          document.body,
          createTouches([{ identifier: 1, clientX: 0, clientY: 0 }]),
        )
        expect(thumbStyles.getPropertyValue('left')).toBe('200px')
      })

      it('multiple thumbs', () => {
        render(createSliderApp({
          template: `
            <SliderRoot :default-value="[20, 40]" style="width: 1000px">
              <SliderControl data-testid="control">
                <SliderTrack>
                  <SliderIndicator />
                  <SliderThumb data-testid="thumb" />
                  <SliderThumb data-testid="thumb" />
                </SliderTrack>
              </SliderControl>
            </SliderRoot>
          `,
        }))

        const sliderControl = screen.getByTestId('control')
        const [thumb1, thumb2] = screen.getAllByTestId('thumb')
        const computedStyles = {
          thumb1: getComputedStyle(thumb1),
          thumb2: getComputedStyle(thumb2),
        }

        vi.spyOn(sliderControl, 'getBoundingClientRect').mockImplementation(() =>
          getHorizontalSliderRect(1000))

        fireEvent.touchStart(
          sliderControl,
          createTouches([{ identifier: 1, clientX: 400, clientY: 0 }]),
        )
        fireEvent.touchMove(
          document.body,
          createTouches([{ identifier: 1, clientX: 699, clientY: 0 }]),
        )
        fireEvent.touchMove(
          document.body,
          createTouches([{ identifier: 1, clientX: 699, clientY: 0 }]),
        )
        fireEvent.touchMove(
          document.body,
          createTouches([{ identifier: 1, clientX: 699, clientY: 0 }]),
        )

        expect(computedStyles.thumb2.getPropertyValue('left')).toBe('700px')
        fireEvent.touchEnd(
          document.body,
          createTouches([{ identifier: 1, clientX: 0, clientY: 0 }]),
        )
        expect(computedStyles.thumb1.getPropertyValue('left')).toBe('200px')
        expect(computedStyles.thumb2.getPropertyValue('left')).toBe('700px')
      })

      describe('prop: thumbCollisionBehavior', () => {
        function getSliderValues() {
          return screen
            .getAllByRole('slider')
            .map(input => Number(input.getAttribute('aria-valuenow')))
        }

        it('prevents thumbs from passing each other when set to "none"', () => {
          render(createSliderApp({
            template: `
              <SliderRoot
                :default-value="[20, 40]"
                thumb-collision-behavior="none"
                style="width: 1000px"
              >
                <SliderControl data-testid="control">
                  <SliderTrack>
                    <SliderIndicator />
                    <SliderThumb :index="0" data-testid="thumb1" />
                    <SliderThumb :index="1" />
                  </SliderTrack>
                </SliderControl>
              </SliderRoot>
            `,
          }))

          const sliderControl = screen.getByTestId('control')

          vi.spyOn(sliderControl, 'getBoundingClientRect').mockImplementation(() =>
            getHorizontalSliderRect(1000))

          fireEvent.touchStart(
            sliderControl,
            createTouches([{ identifier: 1, clientX: 200, clientY: 0 }]),
          )
          fireEvent.touchMove(
            document.body,
            createTouches([{ identifier: 1, clientX: 600, clientY: 0 }]),
          )
          fireEvent.touchEnd(
            document.body,
            createTouches([{ identifier: 1, clientX: 600, clientY: 0 }]),
          )

          expect(getSliderValues()).toEqual([40, 40])
        })

        it('pushes adjacent thumbs forward when set to "push"', () => {
          render(createSliderApp({
            template: `
              <SliderRoot
                :default-value="[20, 40]"
                thumb-collision-behavior="push"
                style="width: 1000px"
              >
                <SliderControl data-testid="control">
                  <SliderTrack>
                    <SliderIndicator />
                    <SliderThumb :index="0" data-testid="thumb1" />
                    <SliderThumb :index="1" />
                  </SliderTrack>
                </SliderControl>
              </SliderRoot>
            `,
          }))

          const sliderControl = screen.getByTestId('control')

          vi.spyOn(sliderControl, 'getBoundingClientRect').mockImplementation(() =>
            getHorizontalSliderRect(1000))

          fireEvent.touchStart(
            sliderControl,
            createTouches([{ identifier: 1, clientX: 200, clientY: 0 }]),
          )
          fireEvent.touchMove(
            document.body,
            createTouches([{ identifier: 1, clientX: 650, clientY: 0 }]),
          )
          fireEvent.touchEnd(
            document.body,
            createTouches([{ identifier: 1, clientX: 650, clientY: 0 }]),
          )

          expect(getSliderValues()).toEqual([65, 65])
        })

        it('allows thumbs to swap when set to "swap"', () => {
          render(createSliderApp({
            template: `
              <SliderRoot
                :default-value="[20, 40]"
                thumb-collision-behavior="swap"
                style="width: 1000px"
              >
                <SliderControl data-testid="control">
                  <SliderTrack>
                    <SliderIndicator />
                    <SliderThumb :index="0" data-testid="thumb1" />
                    <SliderThumb :index="1" />
                  </SliderTrack>
                </SliderControl>
              </SliderRoot>
            `,
          }))

          const sliderControl = screen.getByTestId('control')

          vi.spyOn(sliderControl, 'getBoundingClientRect').mockImplementation(() =>
            getHorizontalSliderRect(1000))

          fireEvent.touchStart(
            sliderControl,
            createTouches([{ identifier: 1, clientX: 200, clientY: 0 }]),
          )
          fireEvent.touchMove(
            document.body,
            createTouches([{ identifier: 1, clientX: 700, clientY: 0 }]),
          )
          fireEvent.touchEnd(
            document.body,
            createTouches([{ identifier: 1, clientX: 700, clientY: 0 }]),
          )

          expect(getSliderValues()).toEqual([40, 70])
        })

        it('maintains minimum steps between values when swapping', () => {
          render(createSliderApp({
            template: `
              <SliderRoot
                :default-value="[20, 40, 60]"
                :min-steps-between-values="10"
                thumb-collision-behavior="swap"
                style="width: 1000px"
              >
                <SliderControl data-testid="control">
                  <SliderTrack>
                    <SliderIndicator />
                    <SliderThumb :index="0" data-testid="thumb1" />
                    <SliderThumb :index="1" />
                    <SliderThumb :index="2" />
                  </SliderTrack>
                </SliderControl>
              </SliderRoot>
            `,
          }))

          const sliderControl = screen.getByTestId('control')

          vi.spyOn(sliderControl, 'getBoundingClientRect').mockImplementation(() =>
            getHorizontalSliderRect(1000))

          fireEvent.touchStart(
            sliderControl,
            createTouches([{ identifier: 1, clientX: 200, clientY: 0 }]),
          )
          fireEvent.touchMove(
            sliderControl,
            createTouches([{ identifier: 1, clientX: 500, clientY: 0 }]),
          )
          fireEvent.touchMove(
            sliderControl,
            createTouches([{ identifier: 1, clientX: 550, clientY: 0 }]),
          )
          fireEvent.touchMove(
            sliderControl,
            createTouches([{ identifier: 1, clientX: 800, clientY: 0 }]),
          )
          fireEvent.touchEnd(
            sliderControl,
            createTouches([{ identifier: 1, clientX: 800, clientY: 0 }]),
          )

          expect(getSliderValues()).toEqual([30, 50, 80])
        })
      })
    })
  })
})
