import type {
  Placement,
  VirtualElement,
} from '@floating-ui/vue'
import type { ComputedRef, Ref } from 'vue'
import type { BaseUIChangeEventDetails } from '../utils/createBaseUIEventDetails'
import type { TransitionStatus } from '../utils/useTransitionStatus'
import type { FloatingTreeStore } from './components/FloatingTreeStore'

export type { Coords, Dimensions } from '@floating-ui/dom'

export type ReferenceType = Element | VirtualElement
export type Delay = number | Partial<{ open: number, close: number }>

export interface FloatingEvents {
  emit: <T extends string>(event: T, data?: any) => void
  on: (event: string, handler: (data: any) => void) => void
  off: (event: string, handler: (data: any) => void) => void
}

export interface ContextData {
  openEvent?: Event
  floatingContext?: FloatingContext
  [key: string]: any
}

export interface FloatingUIOpenChangeDetails {
  open: boolean
  reason: string
  nativeEvent: Event
  nested: boolean
  triggerElement: Element | undefined
}

export interface FloatingTriggerMap {
  hasElement: (element: Element) => boolean
  entries: () => IterableIterator<[string, HTMLElement]>
}

export interface FloatingRootState {
  open: boolean
  transitionStatus: TransitionStatus
  domReferenceElement: Element | null
  referenceElement: ReferenceType | null
  floatingElement: HTMLElement | null
  floatingId: string | undefined
}

export interface FloatingRootStoreContext {
  dataRef: Ref<ContextData>
  events: FloatingEvents
  nested: boolean
  triggerElements: FloatingTriggerMap
  clearCloseTimer?: () => void
}

export interface FloatingRootContext {
  context: FloatingRootStoreContext
  useState: <K extends keyof FloatingRootState>(key: K) => ComputedRef<FloatingRootState[K]>
  select: <K extends keyof FloatingRootState>(key: K) => FloatingRootState[K]
  setOpen: (open: boolean, eventDetails: BaseUIChangeEventDetails<string, any>) => void
  dispatchOpenChange: (open: boolean, eventDetails: BaseUIChangeEventDetails<string, any>) => void
}

export interface FloatingContext {
  open: ComputedRef<boolean>
  nodeId: string | undefined
  floatingId: string | undefined
  rootStore: FloatingRootContext
}

export interface FloatingNodeType {
  id: string | undefined
  parentId: string | null
  context?: FloatingContext
}

export type FloatingTreeType = FloatingTreeStore

export interface HandleCloseOptions {
  blockPointerEvents?: boolean
  getScope?: (() => HTMLElement | SVGSVGElement | null)
}

export interface HandleCloseContext {
  x: number | null
  y: number | null
  placement: Placement | null
  elements: {
    domReference: Element | null
    floating: HTMLElement | null
  }
  onClose: () => void
  nodeId?: string
  tree?: FloatingTreeType | null
  leave?: boolean
}

export type HandleCloseContextBase = Omit<HandleCloseContext, 'onClose' | 'tree' | 'x' | 'y'>

export interface HandleClose {
  (context: HandleCloseContext): (event: MouseEvent) => void
  __options?: HandleCloseOptions
}
