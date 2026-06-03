import type { WatchSource } from 'vue'
import { watch } from 'vue'

/**
 * Runs `onChange` whenever the watched value changes, passing the previous value.
 *
 * Mirrors the React `useValueChanged` helper: the callback fires after the DOM has
 * been updated (`flush: 'post'`), which makes it safe to read or move focus inside it.
 */
export function useValueChanged<T>(
  source: WatchSource<T>,
  onChange: (previousValue: T) => void,
): void {
  watch(
    source,
    (_newValue, previousValue) => {
      onChange(previousValue)
    },
    { flush: 'post' },
  )
}
