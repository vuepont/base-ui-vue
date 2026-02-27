import type { HTMLAttributes, VNodeRef } from 'vue'

export type HTMLProps = HTMLAttributes & {
  ref?: VNodeRef
}

export type BaseUIEvent<E extends Event = Event> = E & {
  baseUIHandlerPrevented?: boolean
  preventBaseUIHandler: () => void
}
