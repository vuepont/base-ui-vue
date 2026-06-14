import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import TooltipArrow from '../arrow/TooltipArrow.vue'
import TooltipPopup from '../popup/TooltipPopup.vue'
import TooltipPortal from '../portal/TooltipPortal.vue'
import TooltipPositioner from '../positioner/TooltipPositioner.vue'
import TooltipProvider from '../provider/TooltipProvider.vue'
import { createTooltipHandle } from '../store/TooltipHandle'
import TooltipTrigger from '../trigger/TooltipTrigger.vue'
import { HOVERABLE_CLOSE_GRACE_DELAY } from '../utils/constants'
import TooltipRoot from './TooltipRoot.vue'

const CONTENT = 'Tooltip content'

afterEach(() => {
  vi.useRealTimers()
})

function renderBasicTooltip(options: {
  delay?: number
  closeDelay?: number
  providerDelay?: number
  providerCloseDelay?: number
  defaultOpen?: boolean
} = {}) {
  return render(defineComponent({
    components: {
      TooltipArrow,
      TooltipPopup,
      TooltipPortal,
      TooltipPositioner,
      TooltipProvider,
      TooltipRoot,
      TooltipTrigger,
    },
    setup() {
      return {
        options,
      }
    },
    template: `
      <TooltipProvider :delay="options.providerDelay" :close-delay="options.providerCloseDelay">
        <TooltipRoot :default-open="options.defaultOpen">
          <TooltipTrigger
            aria-label="Bold"
            :delay="options.delay"
            :close-delay="options.closeDelay"
          >
            B
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipPositioner data-testid="positioner" :side-offset="4">
              <TooltipPopup>
                <TooltipArrow data-testid="arrow" />
                ${CONTENT}
              </TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      </TooltipProvider>
    `,
  }))
}

describe('<TooltipRoot />', () => {
  it('opens on hover after the configured delay and closes on mouse leave', async () => {
    vi.useFakeTimers()
    renderBasicTooltip({ delay: 25 })

    const trigger = screen.getByRole('button', { name: 'Bold' })
    await fireEvent.mouseEnter(trigger)

    vi.advanceTimersByTime(24)
    await nextTick()
    expect(screen.queryByText(CONTENT)).toBeNull()

    vi.advanceTimersByTime(1)
    await nextTick()

    expect(screen.getByRole('tooltip')).toHaveTextContent(CONTENT)
    expect(trigger).toHaveAttribute('data-popup-open')
    expect(screen.getByTestId('positioner')).toHaveAttribute('data-open')
    expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', 'top')
    expect(screen.getByTestId('arrow')).toHaveAttribute('data-side', 'top')

    await fireEvent.mouseLeave(trigger)
    vi.advanceTimersByTime(HOVERABLE_CLOSE_GRACE_DELAY)
    await nextTick()
    await nextTick()

    expect(trigger).not.toHaveAttribute('data-popup-open')
    expect(screen.queryByText(CONTENT)).toBeNull()
  })

  it('opens on focus and closes on blur', async () => {
    renderBasicTooltip()

    const trigger = screen.getByRole('button', { name: 'Bold' })

    await fireEvent.focus(trigger)
    await nextTick()

    expect(screen.getByRole('tooltip')).toHaveTextContent(CONTENT)

    await fireEvent.blur(trigger)
    await nextTick()
    await nextTick()

    expect(screen.queryByText(CONTENT)).toBeNull()
  })

  it('uses provider delay and close delay', async () => {
    vi.useFakeTimers()
    renderBasicTooltip({ providerDelay: 40, providerCloseDelay: 30 })

    const trigger = screen.getByRole('button', { name: 'Bold' })

    await fireEvent.mouseEnter(trigger)
    vi.advanceTimersByTime(39)
    await nextTick()
    expect(screen.queryByText(CONTENT)).toBeNull()

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(screen.getByText(CONTENT)).toBeInTheDocument()

    await fireEvent.mouseLeave(trigger)
    vi.advanceTimersByTime(29)
    await nextTick()
    expect(screen.getByText(CONTENT)).toBeInTheDocument()

    vi.advanceTimersByTime(1)
    await nextTick()
    await nextTick()
    expect(screen.queryByText(CONTENT)).toBeNull()
  })

  it('emits cancelable open-change details', async () => {
    vi.useFakeTimers()
    const handleOpenChange = vi.fn((nextOpen, details) => {
      details.cancel()
    })

    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
        TooltipTrigger,
      },
      setup() {
        return { handleOpenChange }
      },
      template: `
        <TooltipRoot @open-change="handleOpenChange">
          <TooltipTrigger :delay="0">Trigger</TooltipTrigger>
          <TooltipPortal>
            <TooltipPositioner>
              <TooltipPopup>${CONTENT}</TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    await fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger' }))
    vi.advanceTimersByTime(0)
    await nextTick()

    expect(handleOpenChange).toHaveBeenCalledTimes(1)
    expect(handleOpenChange.mock.calls[0][0]).toBe(true)
    expect(handleOpenChange.mock.calls[0][1].reason).toBe('trigger-hover')
    expect(screen.queryByText(CONTENT)).toBeNull()
  })

  it('supports controlled open and trigger id state', async () => {
    const user = userEvent.setup()

    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
        TooltipTrigger,
      },
      setup() {
        const open = ref(false)
        const triggerId = ref<string | null>(null)

        function handleOpenChange(nextOpen: boolean, details: any) {
          open.value = nextOpen
          triggerId.value = details.trigger?.id ?? null
        }

        return {
          open,
          triggerId,
          handleOpenChange,
        }
      },
      template: `
        <TooltipRoot
          :open="open"
          :trigger-id="triggerId"
          @open-change="handleOpenChange"
        >
          <TooltipTrigger id="trigger-1" :delay="0">One</TooltipTrigger>
          <TooltipPortal>
            <TooltipPositioner>
              <TooltipPopup>${CONTENT}</TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
        <button @click="open = true; triggerId = 'trigger-1'">Open externally</button>
      `,
    }))

    await user.click(screen.getByRole('button', { name: 'Open externally' }))
    await nextTick()

    expect(screen.getByText(CONTENT)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'One' })).toHaveAttribute('data-popup-open')
  })

  it('supports detached triggers and payload scoped slots', async () => {
    const handle = createTooltipHandle<{ label: string }>()

    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
        TooltipTrigger,
      },
      setup() {
        return { handle }
      },
      template: `
        <TooltipTrigger :handle="handle" :payload="{ label: 'First trigger' }" :delay="0">
          First
        </TooltipTrigger>
        <TooltipTrigger :handle="handle" :payload="{ label: 'Second trigger' }" :delay="0">
          Second
        </TooltipTrigger>
        <TooltipRoot :handle="handle" v-slot="{ payload }">
          <TooltipPortal>
            <TooltipPositioner>
              <TooltipPopup>
                {{ payload ? payload.label : '' }}
              </TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    await fireEvent.mouseEnter(screen.getByRole('button', { name: 'First' }))
    await nextTick()
    expect(screen.getByRole('tooltip')).toHaveTextContent('First trigger')

    await fireEvent.mouseLeave(screen.getByRole('button', { name: 'First' }))
    await nextTick()
    await nextTick()

    await fireEvent.mouseEnter(screen.getByRole('button', { name: 'Second' }))
    await nextTick()
    expect(screen.getByRole('tooltip')).toHaveTextContent('Second trigger')
  })

  it('should close when the active trigger unmounts', async () => {
    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
        TooltipTrigger,
      },
      setup() {
        const showFirstTrigger = ref(true)

        return {
          showFirstTrigger,
        }
      },
      template: `
        <TooltipRoot default-open default-trigger-id="trigger-1" v-slot="{ payload }">
          <TooltipTrigger
            v-if="showFirstTrigger"
            id="trigger-1"
            :payload="1"
            :delay="0"
          >
            Trigger 1
          </TooltipTrigger>
          <TooltipTrigger id="trigger-2" :payload="2" :delay="0">
            Trigger 2
          </TooltipTrigger>
          <button @click="showFirstTrigger = false">Remove first</button>
          <TooltipPortal>
            <TooltipPositioner>
              <TooltipPopup>
                <span data-testid="content">{{ payload }}</span>
              </TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    await nextTick()
    expect(await screen.findByTestId('content')).toHaveTextContent('1')

    await fireEvent.click(screen.getByRole('button', { name: 'Remove first' }))
    await nextTick()
    await Promise.resolve()
    await nextTick()

    const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

    expect(screen.queryByRole('button', { name: 'Trigger 1' })).toBeNull()
    expect(trigger2).not.toHaveAttribute('data-popup-open')
    expect(screen.queryByTestId('content')).toBeNull()
  })

  it('should remain open when the active trigger unmount close is canceled', async () => {
    const handleOpenChange = vi.fn((nextOpen, details) => {
      if (!nextOpen) {
        details.cancel()
      }
    })

    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
        TooltipTrigger,
      },
      setup() {
        const showFirstTrigger = ref(true)

        return {
          handleOpenChange,
          showFirstTrigger,
        }
      },
      template: `
        <TooltipRoot
          default-open
          default-trigger-id="trigger-1"
          @open-change="handleOpenChange"
          v-slot="{ payload }"
        >
          <TooltipTrigger
            v-if="showFirstTrigger"
            id="trigger-1"
            :payload="1"
            :delay="0"
          >
            Trigger 1
          </TooltipTrigger>
          <TooltipTrigger id="trigger-2" :payload="2" :delay="0">
            Trigger 2
          </TooltipTrigger>
          <button @click="showFirstTrigger = false">Remove first</button>
          <TooltipPortal>
            <TooltipPositioner>
              <TooltipPopup>
                <span data-testid="content">{{ payload }}</span>
              </TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    await nextTick()
    expect(await screen.findByTestId('content')).toHaveTextContent('1')

    await fireEvent.click(screen.getByRole('button', { name: 'Remove first' }))
    await nextTick()
    await Promise.resolve()
    await nextTick()

    const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

    expect(screen.queryByRole('button', { name: 'Trigger 1' })).toBeNull()
    expect(handleOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'none' }),
    )
    expect(trigger2).not.toHaveAttribute('data-popup-open')
    expect(screen.getByTestId('content')).toHaveTextContent('1')
  })
})
