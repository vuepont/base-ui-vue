const DISABLE_SCROLLBAR_CLASS_NAME = 'base-ui-disable-scrollbar'
const STYLE_ELEMENT_ID = `style-${DISABLE_SCROLLBAR_CLASS_NAME}`

export const styleDisableScrollbar = {
  className: DISABLE_SCROLLBAR_CLASS_NAME,

  inject(nonce?: string, disableStyleElements?: boolean) {
    if (disableStyleElements) {
      return
    }

    if (typeof document === 'undefined') {
      return
    }

    if (document.getElementById(STYLE_ELEMENT_ID)) {
      return
    }

    const style = document.createElement('style')
    style.id = STYLE_ELEMENT_ID
    if (nonce) {
      style.nonce = nonce
    }
    style.textContent = `.${DISABLE_SCROLLBAR_CLASS_NAME}{scrollbar-width:none}.${DISABLE_SCROLLBAR_CLASS_NAME}::-webkit-scrollbar{display:none}`
    document.head.appendChild(style)
  },
}
