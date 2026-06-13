import type { Ref, ShallowRef } from 'vue'
import type { FloatingTriggerMap } from '../../floating-ui-vue/types'
import type {
  TooltipInstantType,
  TooltipRootChangeEventDetails,
  TooltipRootChangeEventReason,
  TooltipTrackCursorAxis,
} from '../root/TooltipRoot.vue'
import { shallowRef } from 'vue'
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import { REASONS } from '../../utils/reasons'

export interface TooltipTriggerRecord<Payload = unknown> {
  id: string
  element: HTMLElement
  payload: Payload | undefined
  closeOnClick: boolean
  closeDelay: number | undefined
}

export interface TooltipRootController {
  open: Readonly<Ref<boolean>>
  activeTriggerId: Ref<string | null>
  disabled: Readonly<Ref<boolean>>
  disableHoverablePopup: Readonly<Ref<boolean>>
  trackCursorAxis: Readonly<Ref<TooltipTrackCursorAxis>>
  instantType: Ref<TooltipInstantType>
  popupId: Ref<string | undefined>
  requestOpenChange: (
    nextOpen: boolean,
    details: TooltipRootChangeEventDetails,
    triggerId?: string | null,
  ) => void
  getOpenDelay: (triggerDelay: number | undefined) => { delay: number, instant: boolean }
  getCloseDelay: (triggerCloseDelay: number | undefined) => number
  scheduleClose: (
    delay: number,
    details: TooltipRootChangeEventDetails,
    triggerId?: string | null,
  ) => void
  clearCloseTimer: () => void
  forceUnmount: () => void
  maybeActivateTrigger: (id: string) => void
}

export class TooltipStore<Payload = unknown> {
  readonly controller: ShallowRef<TooltipRootController | null> = shallowRef(null)

  private readonly triggers = new Map<string, TooltipTriggerRecord<Payload>>()

  readonly triggerElements: FloatingTriggerMap = {
    hasElement: (element: Element) => {
      return Array.from(this.triggers.values()).some(record => record.element === element)
    },
    entries: () => {
      const entries = Array.from(this.triggers.entries())
        .map(([id, record]) => [id, record.element] as [string, HTMLElement])

      return entries[Symbol.iterator]()
    },
  }

  readonly version = shallowRef(0)

  registerTrigger(record: TooltipTriggerRecord<Payload>) {
    this.triggers.set(record.id, record)
    this.version.value += 1
    this.controller.value?.maybeActivateTrigger(record.id)
  }

  unregisterTrigger(id: string, element: HTMLElement) {
    const existing = this.triggers.get(id)

    if (existing?.element !== element) {
      return
    }

    this.triggers.delete(id)
    this.version.value += 1
  }

  getTrigger(id: string | null | undefined): TooltipTriggerRecord<Payload> | undefined {
    // Keep Map mutations visible to Vue computed refs that read trigger data.
    void this.version.value

    if (id == null) {
      return undefined
    }

    return this.triggers.get(id)
  }

  open(triggerId: string) {
    const trigger = this.getTrigger(triggerId)

    if (!trigger) {
      throw new Error(`Base UI Vue: TooltipHandle.open: No trigger found with id "${triggerId}".`)
    }

    this.controller.value?.requestOpenChange(
      true,
      createTooltipChangeEventDetails(REASONS.imperativeAction, undefined, trigger.element),
      triggerId,
    )
  }

  close() {
    this.controller.value?.requestOpenChange(
      false,
      createTooltipChangeEventDetails(REASONS.imperativeAction),
    )
  }

  get isOpen() {
    return this.controller.value?.open.value ?? false
  }
}

export function createTooltipHandle<Payload = unknown>(): TooltipHandle<Payload> {
  return new TooltipHandle<Payload>()
}

/**
 * A handle to control a tooltip imperatively and to associate detached triggers with it.
 */
export class TooltipHandle<Payload = unknown> {
  readonly store = new TooltipStore<Payload>()

  open(triggerId: string) {
    this.store.open(triggerId)
  }

  close() {
    this.store.close()
  }

  get isOpen() {
    return this.store.isOpen
  }
}

export function createTooltipChangeEventDetails(
  reason: TooltipRootChangeEventReason,
  event?: any,
  trigger?: HTMLElement,
): TooltipRootChangeEventDetails {
  return createChangeEventDetails<
    TooltipRootChangeEventReason,
    { preventUnmountOnClose: () => void }
  >(
    reason,
    event,
    trigger,
    {
      preventUnmountOnClose() {},
    },
  ) as TooltipRootChangeEventDetails
}
