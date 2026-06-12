import type { Component } from 'vue'
import type { Align, Side } from '../../utils/useAnchorPositioning'
import type { TooltipPositionerContext } from '../positioner/TooltipPositionerContext'
import type { TooltipInstantType, TooltipTrackCursorAxis } from '../root/TooltipRoot.vue'
import type { TooltipRootContext } from '../root/TooltipRootContext'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, provide, shallowRef } from 'vue'
import { Slot } from '../../utils/slot'
import TooltipPortal from '../portal/TooltipPortal.vue'
import TooltipPositioner from '../positioner/TooltipPositioner.vue'
import { tooltipPositionerContextKey } from '../positioner/TooltipPositionerContext'
import TooltipRoot from '../root/TooltipRoot.vue'
import { tooltipRootContextKey } from '../root/TooltipRootContext'
import { TooltipStore } from '../store/TooltipHandle'
import TooltipArrow from './TooltipArrow.vue'

interface TooltipArrowTestOptions {
  open?: boolean
  instant?: TooltipInstantType
  positionerSide?: Side
  positionerAlign?: Align
  arrowX?: number
  arrowY?: number
  uncentered?: boolean
  trackCursorAxis?: TooltipTrackCursorAxis
  props?: Record<string, unknown>
}

function createTooltipContexts(options: TooltipArrowTestOptions = {}) {
  const rootArrowRef = shallowRef<HTMLElement | null>(null)
  const positionerArrowRef = shallowRef<HTMLElement | null>(null)
  const positionerSide = shallowRef<Side>(options.positionerSide ?? 'top')
  const positionerAlign = shallowRef<Align>(options.positionerAlign ?? 'center')
  const arrowUncentered = shallowRef(options.uncentered ?? false)

  const root = {
    store: new TooltipStore(),
    open: shallowRef(options.open ?? true),
    mounted: shallowRef(true),
    transitionStatus: shallowRef('idle'),
    disabled: shallowRef(false),
    disableHoverablePopup: shallowRef(false),
    trackCursorAxis: shallowRef(options.trackCursorAxis ?? 'none'),
    hasViewport: shallowRef(false),
    instantType: shallowRef(options.instant),
    activeTriggerId: shallowRef(null),
    activeTrigger: computed(() => undefined),
    payload: computed(() => undefined),
    popupId: shallowRef(undefined),
    popupRef: shallowRef(null),
    positionerRef: shallowRef(null),
    popupWidth: shallowRef(undefined),
    popupHeight: shallowRef(undefined),
    requestOpenChange: vi.fn(),
    getOpenDelay: vi.fn(() => ({ delay: 0, instant: false })),
    getCloseDelay: vi.fn(() => 0),
    scheduleClose: vi.fn(),
    clearCloseTimer: vi.fn(),
    completeOpenChange: vi.fn(),
    setMounted: vi.fn(),
    setPopupId: vi.fn(),
    setHasViewport: vi.fn(),
  } as unknown as TooltipRootContext

  const positioner: TooltipPositionerContext = {
    side: computed(() => positionerSide.value),
    align: computed(() => positionerAlign.value),
    arrowRef: positionerArrowRef,
    arrowStyles: computed(() => ({
      position: 'absolute',
      left: options.arrowX == null ? undefined : `${options.arrowX}px`,
      top: options.arrowY == null ? undefined : `${options.arrowY}px`,
    })),
    arrowUncentered: computed(() => arrowUncentered.value),
  }

  return {
    root,
    positioner,
    rootArrowRef,
    positionerArrowRef,
  }
}

function renderTooltipArrow(options: TooltipArrowTestOptions = {}) {
  const contexts = createTooltipContexts(options)

  const TestComponent = defineComponent({
    components: { TooltipArrow },
    setup() {
      provide(tooltipRootContextKey, contexts.root)
      provide(tooltipPositionerContextKey, contexts.positioner)

      return {
        arrowProps: options.props ?? {},
      }
    },
    template: `
      <TooltipArrow data-testid="arrow" v-bind="arrowProps">
        Arrow
      </TooltipArrow>
    `,
  })

  return {
    ...render(TestComponent),
    ...contexts,
  }
}

describe('<TooltipArrow />', () => {
  describe('base UI component API', () => {
    describe('ref', () => {
      it('attaches the ref', () => {
        const { positionerArrowRef, rootArrowRef } = renderTooltipArrow()
        const arrow = screen.getByTestId('arrow')

        expect(positionerArrowRef.value).toBe(arrow)
        expect(rootArrowRef.value).toBeNull()
      })
    })

    describe('prop forwarding', () => {
      it('forwards custom props to the default element', () => {
        renderTooltipArrow({
          props: {
            'lang': 'fr',
            'data-foobar': 'custom-value',
          },
        })

        const arrow = screen.getByTestId('arrow')
        expect(arrow).toHaveAttribute('lang', 'fr')
        expect(arrow).toHaveAttribute('data-foobar', 'custom-value')
      })

      it('forwards the custom `style` attribute defined on the component', () => {
        renderTooltipArrow({
          props: {
            style: {
              color: 'green',
            },
          },
        })

        expect(screen.getByTestId('arrow')).toHaveStyle({
          color: 'rgb(0, 128, 0)',
        })
      })
    })

    describe('prop: className', () => {
      it('should apply the className when passed as a string', () => {
        renderTooltipArrow({
          props: {
            class: 'test-class',
          },
        })

        expect(screen.getByTestId('arrow')).toHaveClass('test-class')
      })
    })
  })

  it('renders a div by default', () => {
    renderTooltipArrow()

    expect(screen.getByTestId('arrow').tagName).toBe('DIV')
  })

  it('uses the as prop instead of the default tag', () => {
    renderTooltipArrow({
      props: {
        as: 'span',
      },
    })

    expect(screen.getByTestId('arrow').tagName).toBe('SPAN')
  })

  it('renders a customized root element with a component', () => {
    const CustomRoot = defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => h('section', attrs, slots.default?.())
      },
    })

    renderTooltipArrow({
      props: {
        as: CustomRoot as Component,
      },
    })

    expect(screen.getByTestId('arrow').tagName).toBe('SECTION')
  })

  it('uses the TooltipPositioner context for placement state', () => {
    renderTooltipArrow({
      positionerSide: 'bottom',
      positionerAlign: 'end',
    })

    const arrow = screen.getByTestId('arrow')
    expect(arrow).toHaveAttribute('data-side', 'bottom')
    expect(arrow).toHaveAttribute('data-align', 'end')
  })

  it('applies state attributes and positioning styles', () => {
    renderTooltipArrow({
      arrowX: 12,
      arrowY: 8,
      instant: 'delay',
      positionerSide: 'right',
      positionerAlign: 'start',
      uncentered: true,
    })

    const arrow = screen.getByTestId('arrow')
    expect(arrow).toHaveAttribute('aria-hidden', 'true')
    expect(arrow).toHaveAttribute('data-open')
    expect(arrow).toHaveAttribute('data-side', 'right')
    expect(arrow).toHaveAttribute('data-align', 'start')
    expect(arrow).toHaveAttribute('data-uncentered')
    expect(arrow).toHaveAttribute('data-instant', 'delay')
    expect(arrow).toHaveStyle({
      left: '12px',
      position: 'absolute',
      top: '8px',
    })
  })

  it('applies closed state attributes', () => {
    renderTooltipArrow({
      open: false,
    })

    const arrow = screen.getByTestId('arrow')
    expect(arrow).toHaveAttribute('data-closed')
    expect(arrow).not.toHaveAttribute('data-open')
  })

  it('omits data-uncentered when the arrow is centered', () => {
    renderTooltipArrow({
      uncentered: false,
    })

    expect(screen.getByTestId('arrow')).not.toHaveAttribute('data-uncentered')
  })

  it('supports renderless mode and forwards the internal ref callback', () => {
    const contexts = createTooltipContexts({
      positionerSide: 'right',
      uncentered: true,
    })

    const TestComponent = defineComponent({
      components: { TooltipArrow },
      setup() {
        provide(tooltipRootContextKey, contexts.root)
        provide(tooltipPositionerContextKey, contexts.positioner)

        return { Slot }
      },
      template: `
        <TooltipArrow :as="Slot" v-slot="{ props, state, ref }">
          <span v-bind="props" :ref="ref" data-testid="renderless-arrow">
            {{ state.side }} {{ state.uncentered ? 'uncentered' : 'centered' }}
          </span>
        </TooltipArrow>
      `,
    })

    render(TestComponent)

    const arrow = screen.getByTestId('renderless-arrow')
    expect(arrow).toHaveAttribute('aria-hidden', 'true')
    expect(arrow).toHaveAttribute('data-side', 'right')
    expect(arrow).toHaveAttribute('data-uncentered')
    expect(arrow).toHaveTextContent('right uncentered')
    expect(contexts.positionerArrowRef.value).toBe(arrow)
  })

  it('throws when rendered without a TooltipPositioner ancestor', () => {
    const contexts = createTooltipContexts()

    const TestComponent = defineComponent({
      components: { TooltipArrow },
      setup() {
        provide(tooltipRootContextKey, contexts.root)
      },
      template: `<TooltipArrow />`,
    })

    expect(() => render(TestComponent)).toThrow(
      'Base UI Vue: TooltipPositionerContext is missing. <TooltipArrow> must be placed within <TooltipPositioner>.',
    )
  })

  it('does not expose tracking-cursor as arrow instant state', () => {
    render(defineComponent({
      components: {
        TooltipArrow,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
      },
      template: `
        <TooltipRoot default-open track-cursor-axis="x">
          <TooltipPortal disabled>
            <TooltipPositioner data-testid="positioner">
              <TooltipArrow data-testid="arrow" />
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    expect(screen.getByTestId('positioner')).toHaveAttribute(
      'data-instant',
      'tracking-cursor',
    )
    expect(screen.getByTestId('arrow')).not.toHaveAttribute('data-instant')
  })
})
