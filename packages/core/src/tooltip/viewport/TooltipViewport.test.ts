import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import TooltipPopup from '../popup/TooltipPopup.vue'
import TooltipPortal from '../portal/TooltipPortal.vue'
import TooltipPositioner from '../positioner/TooltipPositioner.vue'
import TooltipRoot from '../root/TooltipRoot.vue'
import TooltipTrigger from '../trigger/TooltipTrigger.vue'
import TooltipViewport from './TooltipViewport.vue'

const originalGetAnimations = window.HTMLElement.prototype.getAnimations

afterEach(() => {
  if (originalGetAnimations) {
    Object.defineProperty(window.HTMLElement.prototype, 'getAnimations', {
      configurable: true,
      value: originalGetAnimations,
    })
  }
  else {
    Reflect.deleteProperty(window.HTMLElement.prototype, 'getAnimations')
  }

  vi.restoreAllMocks()
})

describe('<Tooltip.Viewport />', () => {
  it('should render children in the `current` container by default', async () => {
    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
        TooltipTrigger,
        TooltipViewport,
      },
      template: `
        <TooltipRoot default-open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipPortal disabled>
            <TooltipPositioner>
              <TooltipPopup>
                <TooltipViewport>
                  <div data-testid="content">Content</div>
                </TooltipViewport>
              </TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    const currentContainer = screen.getByTestId('content').closest('[data-current]')

    expect(currentContainer).not.toBeNull()
    expect(currentContainer).toHaveTextContent('Content')
  })

  it('should remount the `current` container when the active trigger changes', async () => {
    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
        TooltipTrigger,
        TooltipViewport,
      },
      template: `
        <TooltipRoot v-slot="{ payload }">
          <TooltipTrigger payload="first" :delay="0" data-testid="trigger1">
            Trigger 1
          </TooltipTrigger>
          <TooltipTrigger payload="second" :delay="0" data-testid="trigger2">
            Trigger 2
          </TooltipTrigger>
          <TooltipPortal disabled>
            <TooltipPositioner>
              <TooltipPopup>
                <TooltipViewport>
                  <img
                    v-if="payload === 'first'"
                    data-testid="payload-image-1"
                    src="about:blank"
                    alt="Preview 1"
                  >
                  <img
                    v-if="payload === 'second'"
                    data-testid="payload-image-2"
                    src="about:blank"
                    alt="Preview 2"
                  >
                </TooltipViewport>
              </TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    await fireEvent.focus(screen.getByTestId('trigger1'))

    const firstImage = await screen.findByTestId('payload-image-1')
    const firstContainer = firstImage.closest('[data-current]')

    expect(firstContainer).not.toBeNull()

    await fireEvent.focus(screen.getByTestId('trigger2'))

    await waitFor(() => {
      const secondImage = screen.getByTestId('payload-image-2')
      const secondContainer = secondImage.closest('[data-current]')

      expect(secondContainer).not.toBeNull()
      expect(secondContainer).not.toBe(firstContainer)
    })
  })

  it('should create morphing containers during transitions', async () => {
    const animation = createDeferred<void>()

    Object.defineProperty(window.HTMLElement.prototype, 'getAnimations', {
      configurable: true,
      value: vi.fn(() => [
        {
          finished: animation.promise,
          pending: false,
          playState: 'running',
        },
      ]),
    })

    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
        TooltipTrigger,
        TooltipViewport,
      },
      template: `
        <TooltipRoot v-slot="{ payload }">
          <TooltipTrigger :payload="0" :delay="0" data-testid="trigger1">
            Trigger 1
          </TooltipTrigger>
          <TooltipTrigger :payload="1" :delay="0" data-testid="trigger2">
            Trigger 2
          </TooltipTrigger>
          <TooltipPortal disabled>
            <TooltipPositioner>
              <TooltipPopup>
                <TooltipViewport data-testid="viewport">
                  <div data-testid="content">Content {{ payload }}</div>
                </TooltipViewport>
              </TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    const trigger1 = screen.getByTestId('trigger1')
    const trigger2 = screen.getByTestId('trigger2')

    await fireEvent.focus(trigger1)

    expect(await screen.findByText('Content 0')).toBeInTheDocument()

    const currentContainer = screen.getByText('Content 0').closest('[data-current]') as HTMLElement
    vi.spyOn(currentContainer, 'getBoundingClientRect').mockReturnValue(
      createDOMRect({ width: 120, height: 80 }),
    )

    await fireEvent.focus(trigger2)

    let previousContainer: HTMLElement | null = null
    await waitFor(() => {
      previousContainer = document.querySelector('[data-previous]')
      expect(previousContainer).not.toBeNull()
    })

    expect(screen.getByTestId('viewport')).toHaveAttribute('data-transitioning')
    expect(previousContainer).toHaveAttribute('inert')
    expect(previousContainer).toHaveTextContent('Content 0')
    expect(previousContainer!.style.getPropertyValue('--popup-width')).toBe('120px')
    expect(previousContainer!.style.getPropertyValue('--popup-height')).toBe('80px')

    const nextContainer = document.querySelector('[data-current]')
    expect(nextContainer).not.toBeNull()
    expect(nextContainer).toHaveTextContent('Content 1')

    animation.resolve()

    await waitFor(() => {
      expect(document.querySelector('[data-previous]')).toBeNull()
    })
  })

  it('should resize the popup and positioner when the active trigger changes', async () => {
    const animation = createDeferred<void>()
    const rafCallbacks: FrameRequestCallback[] = []

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      rafCallbacks.push(callback)
      return rafCallbacks.length
    })

    Object.defineProperty(window.HTMLElement.prototype, 'getAnimations', {
      configurable: true,
      value: vi.fn(function (this: HTMLElement) {
        if (this.getAttribute('role') !== 'tooltip') {
          return []
        }

        return [
          {
            finished: animation.promise,
            pending: false,
            playState: 'running',
          },
        ]
      }),
    })

    vi.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute('role') !== 'tooltip') {
          return 0
        }

        const currentText = this.querySelector('[data-current]')?.textContent ?? this.textContent
        return currentText?.includes('Content 1') ? 240 : 120
      })

    vi.spyOn(window.HTMLElement.prototype, 'offsetHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute('role') !== 'tooltip') {
          return 0
        }

        const currentText = this.querySelector('[data-current]')?.textContent ?? this.textContent
        return currentText?.includes('Content 1') ? 80 : 40
      })

    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
        TooltipTrigger,
        TooltipViewport,
      },
      template: `
        <TooltipRoot v-slot="{ payload }">
          <TooltipTrigger :payload="0" :delay="0" data-testid="trigger1">
            Trigger 1
          </TooltipTrigger>
          <TooltipTrigger :payload="1" :delay="0" data-testid="trigger2">
            Trigger 2
          </TooltipTrigger>
          <TooltipPortal disabled>
            <TooltipPositioner data-testid="positioner">
              <TooltipPopup data-testid="popup">
                <TooltipViewport data-testid="viewport">
                  <div data-testid="content">Content {{ payload }}</div>
                </TooltipViewport>
              </TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    await fireEvent.focus(screen.getByTestId('trigger1'))
    expect(await screen.findByText('Content 0')).toBeInTheDocument()

    const popup = screen.getByTestId('popup')
    const positioner = screen.getByTestId('positioner')

    await waitFor(() => {
      expect(positioner.style.getPropertyValue('--positioner-width')).toBe('120px')
      expect(positioner.style.getPropertyValue('--positioner-height')).toBe('40px')
    })

    await fireEvent.focus(screen.getByTestId('trigger2'))

    expect(await screen.findByText('Content 1')).toBeInTheDocument()

    expect(popup.style.getPropertyValue('--popup-width')).toBe('120px')
    expect(popup.style.getPropertyValue('--popup-height')).toBe('40px')
    expect(positioner.style.getPropertyValue('--positioner-width')).toBe('240px')
    expect(positioner.style.getPropertyValue('--positioner-height')).toBe('80px')

    flushAnimationFrames(rafCallbacks)

    expect(popup.style.getPropertyValue('--popup-width')).toBe('240px')
    expect(popup.style.getPropertyValue('--popup-height')).toBe('80px')

    animation.resolve()
    flushAnimationFrames(rafCallbacks)

    await waitFor(() => {
      expect(popup.style.getPropertyValue('--popup-width')).toBe('auto')
      expect(popup.style.getPropertyValue('--popup-height')).toBe('auto')
    })
  })

  it.each([
    {
      name: 'should calculate "right down" direction',
      trigger1: { top: 10, left: 10 },
      trigger2: { top: 100, left: 200 },
      expectedDirection: ['right', 'down'],
    },
    {
      name: 'should calculate "left up" direction',
      trigger1: { top: 100, left: 200 },
      trigger2: { top: 10, left: 10 },
      expectedDirection: ['left', 'up'],
    },
    {
      name: 'should calculate "right" direction (horizontal only)',
      trigger1: { top: 50, left: 10 },
      trigger2: { top: 52, left: 200 },
      expectedDirection: ['right'],
    },
    {
      name: 'should calculate "down" direction (vertical only)',
      trigger1: { top: 10, left: 50 },
      trigger2: { top: 100, left: 52 },
      expectedDirection: ['down'],
    },
    {
      name: 'should handle tolerance for small differences',
      trigger1: { top: 50, left: 50 },
      trigger2: { top: 52, left: 52 },
      expectedDirection: [],
    },
    {
      name: 'should calculate "left down" direction',
      trigger1: { top: 10, left: 200 },
      trigger2: { top: 100, left: 10 },
      expectedDirection: ['left', 'down'],
    },
    {
      name: 'should calculate "right up" direction',
      trigger1: { top: 100, left: 10 },
      trigger2: { top: 10, left: 200 },
      expectedDirection: ['right', 'up'],
    },
  ])('$name', async ({ trigger1, trigger2, expectedDirection }) => {
    const animation = createDeferred<void>()

    Object.defineProperty(window.HTMLElement.prototype, 'getAnimations', {
      configurable: true,
      value: vi.fn(() => [
        {
          finished: animation.promise,
          pending: false,
          playState: 'running',
        },
      ]),
    })

    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
        TooltipTrigger,
        TooltipViewport,
      },
      template: `
        <TooltipRoot v-slot="{ payload }">
          <TooltipTrigger :payload="0" :delay="0" data-testid="trigger1">
            Trigger 1
          </TooltipTrigger>
          <TooltipTrigger :payload="1" :delay="0" data-testid="trigger2">
            Trigger 2
          </TooltipTrigger>
          <TooltipPortal disabled>
            <TooltipPositioner>
              <TooltipPopup>
                <TooltipViewport data-testid="viewport">
                  <div data-testid="content">Content {{ payload }}</div>
                </TooltipViewport>
              </TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    const triggerElement1 = screen.getByTestId('trigger1')
    const triggerElement2 = screen.getByTestId('trigger2')

    vi.spyOn(triggerElement1, 'getBoundingClientRect').mockReturnValue(
      createDOMRect({ top: trigger1.top, left: trigger1.left, width: 100, height: 50 }),
    )
    vi.spyOn(triggerElement2, 'getBoundingClientRect').mockReturnValue(
      createDOMRect({ top: trigger2.top, left: trigger2.left, width: 100, height: 50 }),
    )

    await fireEvent.focus(triggerElement1)

    expect(await screen.findByText('Content 0')).toBeInTheDocument()

    await fireEvent.focus(triggerElement2)

    const viewport = screen.getByTestId('viewport')

    await waitFor(() => {
      expect(viewport).toHaveAttribute('data-activation-direction')
    })

    const direction = viewport.getAttribute('data-activation-direction')

    if (expectedDirection.length === 0) {
      expect(direction?.trim()).toBe('')
    }
    else {
      expectedDirection.forEach((dir) => {
        expect(direction).toContain(dir)
      })
    }

    animation.resolve()
  })
})

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return {
    promise,
    resolve,
    reject,
  }
}

function createDOMRect(rect: Partial<DOMRectReadOnly>) {
  const left = rect.left ?? 0
  const top = rect.top ?? 0
  const width = rect.width ?? 0
  const height = rect.height ?? 0

  return {
    x: rect.x ?? left,
    y: rect.y ?? top,
    top,
    left,
    width,
    height,
    right: rect.right ?? left + width,
    bottom: rect.bottom ?? top + height,
    toJSON() {
      return this
    },
  } as DOMRect
}

function flushAnimationFrames(callbacks: FrameRequestCallback[]) {
  while (callbacks.length > 0) {
    callbacks.shift()?.(performance.now())
  }
}
