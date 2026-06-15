export function mergeCleanups(...cleanups: Array<(() => void) | undefined>) {
  return () => {
    for (const cleanup of cleanups) {
      cleanup?.()
    }
  }
}
