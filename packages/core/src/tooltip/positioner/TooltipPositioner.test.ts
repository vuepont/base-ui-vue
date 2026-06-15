import type { OffsetFunction, Side } from '../../utils/useAnchorPositioning'
import { render, screen, waitFor } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import DirectionProvider from '../../direction-provider/DirectionProvider.vue'
import TooltipPortal from '../portal/TooltipPortal.vue'
import TooltipRoot from '../root/TooltipRoot.vue'
import TooltipViewport from '../viewport/TooltipViewport.vue'
import TooltipPositioner from './TooltipPositioner.vue'

function createRect(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  } as DOMRect
}

function mockPositionerRect() {
  const original = HTMLElement.prototype.getBoundingClientRect

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    if ((this as HTMLElement).dataset.testid === 'positioner') {
      return createRect(0, 0, 50, 20)
    }

    return original.call(this)
  })
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function () {
    return (this as HTMLElement).dataset.testid === 'positioner' ? 50 : 0
  })
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function () {
    return (this as HTMLElement).dataset.testid === 'positioner' ? 20 : 0
  })
}

function renderPositioner(options: {
  direction?: 'ltr' | 'rtl'
  side?: Side
  sideOffset?: unknown
  anchorRect?: DOMRect
  viewport?: boolean
} = {}) {
  const anchor = {
    getBoundingClientRect: () => options.anchorRect ?? createRect(100, 100, 20, 20),
  }
  const collisionBoundary = createRect(0, 0, 1000, 1000)
  const collisionAvoidance = {
    side: 'none',
    align: 'none',
    fallbackAxisSide: 'none',
  }

  return render(defineComponent({
    components: {
      DirectionProvider,
      TooltipPortal,
      TooltipPositioner,
      TooltipRoot,
      TooltipViewport,
    },
    setup() {
      return {
        anchor,
        direction: options.direction ?? 'ltr',
        side: options.side ?? 'top',
        sideOffset: options.sideOffset ?? 0,
        collisionBoundary,
        collisionAvoidance,
        viewport: options.viewport ?? false,
      }
    },
    template: `
      <DirectionProvider :direction="direction">
        <TooltipRoot default-open>
          <TooltipPortal disabled>
            <TooltipPositioner
              data-testid="positioner"
              :anchor="anchor"
              :side="side"
              :side-offset="sideOffset"
              :collision-boundary="collisionBoundary"
              :collision-avoidance="collisionAvoidance"
            >
              <TooltipViewport v-if="viewport" />
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      </DirectionProvider>
    `,
  }))
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('<TooltipPositioner />', () => {
  it.each([
    ['ltr', 'translate(50px, 100px)'],
    ['rtl', 'translate(120px, 100px)'],
  ] as const)(
    'maps logical sides to physical placements using the current %s direction',
    async (direction, expectedTransform) => {
      mockPositionerRect()
      renderPositioner({
        direction,
        side: 'inline-start',
      })

      const positioner = screen.getByTestId('positioner')

      await waitFor(() => {
        expect(positioner).toHaveAttribute('data-side', 'inline-start')
        expect(positioner.style.transform).toBe(expectedTransform)
      })
    },
  )

  it('passes logical placement data to side offset functions', async () => {
    mockPositionerRect()
    let observedData: Parameters<OffsetFunction>[0] | undefined

    renderPositioner({
      side: 'inline-start',
      sideOffset(data) {
        observedData = data
        return 7
      },
    })

    await waitFor(() => {
      expect(observedData).toMatchObject({
        side: 'inline-start',
        align: 'center',
        anchor: { width: 20, height: 20 },
        positioner: { width: 50, height: 20 },
      })
    })
  })

  it('marks the anchor as hidden when its rect is empty', async () => {
    mockPositionerRect()
    renderPositioner({
      anchorRect: createRect(0, 0, 0, 0),
    })

    const positioner = screen.getByTestId('positioner')

    await waitFor(() => {
      expect(positioner).toHaveAttribute('data-anchor-hidden')
    })
  })

  it('uses adaptive origin positioning when a viewport is present', async () => {
    mockPositionerRect()
    renderPositioner({
      side: 'inline-start',
      viewport: true,
    })

    const positioner = screen.getByTestId('positioner')

    await waitFor(() => {
      expect(positioner.style.transform).toBe('')
      expect(positioner.style.left).toBe('50px')
      expect(positioner.style.top).toBe('100px')
    })
  })
})
