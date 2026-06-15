import type { Component } from 'vue'
import type { Align, Side } from '../../utils/useAnchorPositioning'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type { TooltipPositionerContext } from '../positioner/TooltipPositionerContext'
import type { TooltipInstantType, TooltipTrackCursorAxis } from '../root/TooltipRoot.vue'
import type { TooltipRootContext } from '../root/TooltipRootContext'
import { fireEvent, render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, nextTick, provide, shallowRef } from 'vue'
import { createFloatingRootContext } from '../../floating-ui-vue/components/FloatingRootStore'
import { Slot } from '../../utils/slot'
import TooltipPortal from '../portal/TooltipPortal.vue'
import TooltipPositioner from '../positioner/TooltipPositioner.vue'
import { tooltipPositionerContextKey } from '../positioner/TooltipPositionerContext'
import TooltipRoot from '../root/TooltipRoot.vue'
import { tooltipRootContextKey } from '../root/TooltipRootContext'
import { TooltipStore } from '../store/TooltipHandle'
import TooltipTrigger from '../trigger/TooltipTrigger.vue'
import TooltipPopup from './TooltipPopup.vue'

interface TooltipPopupTestOptions {
  open?: boolean
  instant?: TooltipInstantType
  positionerSide?: Side
  positionerAlign?: Align
  transitionStatus?: TransitionStatus
  trackCursorAxis?: TooltipTrackCursorAxis
  props?: Record<string, unknown>
}

function createTooltipContexts(options: TooltipPopupTestOptions = {}) {
  const store = new TooltipStore()
  const open = shallowRef(options.open ?? true)
  const popupRef = shallowRef<HTMLElement | null>(null)
  const transitionStatus = shallowRef(options.transitionStatus)
  const positionerSide = shallowRef<Side>(options.positionerSide ?? 'top')
  const positionerAlign = shallowRef<Align>(options.positionerAlign ?? 'center')
  const requestOpenChange = vi.fn()
  const clearCloseTimer = vi.fn()

  const root = {
    store,
    floatingRootContext: createFloatingRootContext({
      open,
      transitionStatus,
      domReferenceElement: () => null,
      referenceElement: () => null,
      floatingElement: () => popupRef.value,
      floatingId: () => undefined,
      triggerElements: store.triggerElements,
      clearCloseTimer,
      onOpenChange: requestOpenChange,
    }),
    open,
    mounted: shallowRef(true),
    transitionStatus,
    disabled: shallowRef(false),
    disableHoverablePopup: shallowRef(false),
    trackCursorAxis: shallowRef(options.trackCursorAxis ?? 'none'),
    hasViewport: shallowRef(false),
    instantType: shallowRef(options.instant),
    activeTriggerId: shallowRef(null),
    activeTrigger: computed(() => undefined),
    payload: computed(() => undefined),
    popupId: shallowRef(undefined),
    popupRef,
    positionerRef: shallowRef(null),
    popupWidth: shallowRef(undefined),
    popupHeight: shallowRef(undefined),
    requestOpenChange,
    getOpenDelay: vi.fn(() => ({ delay: 0, instant: false })),
    getCloseDelay: vi.fn((delay: number | undefined) => delay ?? 0),
    scheduleClose: vi.fn(),
    clearCloseTimer,
    completeOpenChange: vi.fn(),
    setMounted: vi.fn(),
    setPopupId: vi.fn(),
    setHasViewport: vi.fn(),
  } as unknown as TooltipRootContext

  const positioner: TooltipPositionerContext = {
    side: computed(() => positionerSide.value),
    align: computed(() => positionerAlign.value),
    arrowRef: shallowRef(null),
    arrowStyles: computed(() => ({
      position: 'absolute',
    })),
    arrowUncentered: computed(() => false),
  }

  return {
    root,
    positioner,
    popupRef,
  }
}

function renderTooltipPopup(options: TooltipPopupTestOptions = {}) {
  const contexts = createTooltipContexts(options)

  const TestComponent = defineComponent({
    components: { TooltipPopup },
    setup() {
      provide(tooltipRootContextKey, contexts.root)
      provide(tooltipPositionerContextKey, contexts.positioner)

      return {
        popupProps: options.props ?? {},
      }
    },
    template: `
      <TooltipPopup data-testid="popup" v-bind="popupProps">
        Content
      </TooltipPopup>
    `,
  })

  return {
    ...render(TestComponent),
    ...contexts,
  }
}

function renderInteractiveTooltip(options: {
  disableHoverablePopup?: boolean
  onPopupMouseenter?: (event: any) => void
} = {}) {
  return render(defineComponent({
    components: {
      TooltipPopup,
      TooltipPortal,
      TooltipPositioner,
      TooltipRoot,
      TooltipTrigger,
    },
    setup() {
      return {
        disableHoverablePopup: options.disableHoverablePopup ?? false,
        onPopupMouseenter: options.onPopupMouseenter,
      }
    },
    template: `
      <TooltipRoot :disable-hoverable-popup="disableHoverablePopup">
        <TooltipTrigger :delay="0">Trigger</TooltipTrigger>
        <TooltipPortal disabled>
          <TooltipPositioner>
            <TooltipPopup
              v-if="onPopupMouseenter"
              @mouseenter="onPopupMouseenter"
            >
              Content
            </TooltipPopup>
            <TooltipPopup v-else>
              Content
            </TooltipPopup>
          </TooltipPositioner>
        </TooltipPortal>
      </TooltipRoot>
    `,
  }))
}

afterEach(() => {
  vi.useRealTimers()
})

describe('<Tooltip.Popup />', () => {
  it('should render the children', async () => {
    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
      },
      template: `
        <TooltipRoot default-open>
          <TooltipPortal disabled>
            <TooltipPositioner>
              <TooltipPopup>Content</TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    expect(screen.getByText('Content')).not.toBeNull()
  })

  describe('base UI component API', () => {
    describe('ref', () => {
      it('attaches the ref', () => {
        const { popupRef } = renderTooltipPopup()
        const popup = screen.getByTestId('popup')

        expect(popupRef.value).toBe(popup)
      })
    })

    describe('prop forwarding', () => {
      it('forwards custom props to the default element', () => {
        renderTooltipPopup({
          props: {
            'lang': 'fr',
            'data-foobar': 'custom-value',
          },
        })

        const popup = screen.getByTestId('popup')
        expect(popup).toHaveAttribute('lang', 'fr')
        expect(popup).toHaveAttribute('data-foobar', 'custom-value')
      })

      it('forwards the custom `style` attribute defined on the component', () => {
        renderTooltipPopup({
          props: {
            style: {
              color: 'green',
            },
          },
        })

        expect(screen.getByTestId('popup')).toHaveStyle({
          color: 'rgb(0, 128, 0)',
        })
      })
    })

    describe('prop: className', () => {
      it('should apply the className when passed as a string', () => {
        renderTooltipPopup({
          props: {
            class: 'test-class',
          },
        })

        expect(screen.getByTestId('popup')).toHaveClass('test-class')
      })
    })
  })

  it('renders a div by default', () => {
    renderTooltipPopup()

    expect(screen.getByTestId('popup').tagName).toBe('DIV')
  })

  it('uses the as prop instead of the default tag', () => {
    renderTooltipPopup({
      props: {
        as: 'section',
      },
    })

    expect(screen.getByTestId('popup').tagName).toBe('SECTION')
  })

  it('renders a customized root element with a component', () => {
    const CustomRoot = defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => h('article', attrs, slots.default?.())
      },
    })

    renderTooltipPopup({
      props: {
        as: CustomRoot as Component,
      },
    })

    expect(screen.getByTestId('popup').tagName).toBe('ARTICLE')
  })

  it('uses the TooltipPositioner context for placement state', () => {
    renderTooltipPopup({
      positionerSide: 'bottom',
      positionerAlign: 'end',
    })

    const popup = screen.getByTestId('popup')
    expect(popup).toHaveAttribute('data-side', 'bottom')
    expect(popup).toHaveAttribute('data-align', 'end')
  })

  it('applies state and transition attributes', () => {
    renderTooltipPopup({
      instant: 'delay',
      transitionStatus: 'starting',
    })

    const popup = screen.getByTestId('popup')
    expect(popup).toHaveAttribute('role', 'tooltip')
    expect(popup).toHaveAttribute('data-open')
    expect(popup).toHaveAttribute('data-side', 'top')
    expect(popup).toHaveAttribute('data-align', 'center')
    expect(popup).toHaveAttribute('data-instant', 'delay')
    expect(popup).toHaveAttribute('data-starting-style')
    expect(popup).toHaveStyle({ transition: 'none' })
  })

  it('applies closed state attributes', () => {
    renderTooltipPopup({
      open: false,
    })

    const popup = screen.getByTestId('popup')
    expect(popup).toHaveAttribute('data-closed')
    expect(popup).not.toHaveAttribute('data-open')
  })

  it('supports renderless mode and forwards the internal ref callback', () => {
    const contexts = createTooltipContexts({
      positionerSide: 'right',
      positionerAlign: 'start',
    })

    const TestComponent = defineComponent({
      components: { TooltipPopup },
      setup() {
        provide(tooltipRootContextKey, contexts.root)
        provide(tooltipPositionerContextKey, contexts.positioner)

        return { Slot }
      },
      template: `
        <TooltipPopup :as="Slot" v-slot="{ props, state, ref }">
          <span v-bind="props" :ref="ref" data-testid="renderless-popup">
            {{ state.side }} {{ state.align }}
          </span>
        </TooltipPopup>
      `,
    })

    render(TestComponent)

    const popup = screen.getByTestId('renderless-popup')
    expect(popup).toHaveAttribute('role', 'tooltip')
    expect(popup).toHaveAttribute('data-side', 'right')
    expect(popup).toHaveAttribute('data-align', 'start')
    expect(popup).toHaveTextContent('right start')
    expect(contexts.popupRef.value).toBe(popup)
  })

  it('does not define popup sizing or transform origin variables on the popup element', () => {
    renderTooltipPopup()

    const popup = screen.getByTestId('popup')
    expect(popup.style.getPropertyValue('--popup-width')).toBe('')
    expect(popup.style.getPropertyValue('--popup-height')).toBe('')
    expect(popup.style.getPropertyValue('--transform-origin')).toBe('')
  })

  it('keeps the tooltip open when moving from the trigger into the popup', async () => {
    vi.useFakeTimers()
    renderInteractiveTooltip()

    const trigger = screen.getByRole('button', { name: 'Trigger' })

    await fireEvent.mouseEnter(trigger)
    await nextTick()

    const popup = screen.getByRole('tooltip')
    expect(popup).toHaveTextContent('Content')

    await fireEvent.mouseLeave(trigger)
    vi.advanceTimersByTime(99)
    await nextTick()
    expect(screen.getByRole('tooltip')).toHaveTextContent('Content')

    await fireEvent.mouseEnter(popup)
    vi.advanceTimersByTime(1)
    await nextTick()
    expect(screen.getByRole('tooltip')).toHaveTextContent('Content')

    await fireEvent.mouseLeave(popup)
    await nextTick()
    await nextTick()
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('closes immediately on trigger leave when hoverable popup behavior is disabled', async () => {
    renderInteractiveTooltip({
      disableHoverablePopup: true,
    })

    const trigger = screen.getByRole('button', { name: 'Trigger' })

    await fireEvent.mouseEnter(trigger)
    await nextTick()
    expect(screen.getByRole('tooltip')).toHaveTextContent('Content')

    await fireEvent.mouseLeave(trigger)
    await nextTick()
    await nextTick()
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('runs the native hover interaction independently from consumer mouseenter handlers', async () => {
    vi.useFakeTimers()
    const handlePopupMouseenter = vi.fn((event) => {
      event.preventBaseUIHandler()
    })

    renderInteractiveTooltip({
      onPopupMouseenter: handlePopupMouseenter,
    })

    const trigger = screen.getByRole('button', { name: 'Trigger' })

    await fireEvent.mouseEnter(trigger)
    await nextTick()

    const popup = screen.getByRole('tooltip')
    await fireEvent.mouseLeave(trigger)
    await fireEvent.mouseEnter(popup)

    vi.advanceTimersByTime(100)
    await nextTick()
    await nextTick()

    expect(handlePopupMouseenter).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Content')
  })

  it('does not close a focus-opened tooltip when leaving the popup', async () => {
    renderInteractiveTooltip()

    const trigger = screen.getByRole('button', { name: 'Trigger' })

    await fireEvent.focus(trigger)
    await nextTick()

    const popup = screen.getByRole('tooltip')
    await fireEvent.mouseLeave(popup)
    await nextTick()

    expect(screen.getByRole('tooltip')).toHaveTextContent('Content')
  })
})
