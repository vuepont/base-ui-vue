export function stopEvent(event: Event) {
  event.preventDefault()
  event.stopPropagation()
}
