export function addEventListener<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | SVGElement | Document | Window | null | undefined,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions | boolean,
) {
  if (!target) {
    return undefined
  }

  target.addEventListener(type, listener as EventListener, options)

  return () => {
    target.removeEventListener(type, listener as EventListener, options)
  }
}
