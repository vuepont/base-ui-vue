import type { CSSProperties } from 'vue'

export const DISABLED_TRANSITIONS_STYLE = { style: { transition: 'none' } } as const

export const ownerVisuallyHidden: CSSProperties = {
  clipPath: 'inset(50%)',
  position: 'fixed',
  top: 0,
  left: 0,
}

export { EMPTY_ARRAY, EMPTY_OBJECT } from './empty'
