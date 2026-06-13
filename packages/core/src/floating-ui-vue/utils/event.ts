export function stopEvent(event: Event) {
  event.preventDefault()
  event.stopPropagation()
}

export function isMouseLikePointerType(pointerType: string | undefined, strict?: boolean) {
  const values: Array<string | undefined> = ['mouse', 'pen']

  if (!strict) {
    values.push('', undefined)
  }

  return values.includes(pointerType)
}

export function isClickLikeEvent(event: Event) {
  const type = event.type
  return type === 'click' || type === 'mousedown' || type === 'keydown' || type === 'keyup'
}
