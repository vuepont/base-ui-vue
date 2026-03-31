import type { CSSProperties } from 'vue'

const visuallyHiddenBase: CSSProperties = {
  clipPath: 'inset(50%)',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  border: 0,
  padding: 0,
  width: 1,
  height: 1,
  margin: -1,
}

export const visuallyHidden: CSSProperties = {
  ...visuallyHiddenBase,
  position: 'fixed',
  top: 0,
  left: 0,
}

export const visuallyHiddenInput: CSSProperties = {
  ...visuallyHiddenBase,
  position: 'absolute',
}
