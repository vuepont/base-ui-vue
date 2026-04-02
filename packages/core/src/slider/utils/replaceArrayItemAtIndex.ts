import { asc } from './asc'

export function replaceArrayItemAtIndex(
  array: readonly number[],
  index: number,
  newValue: number,
): number[] {
  if (!Number.isInteger(index) || index < 0 || index >= array.length) {
    throw new RangeError(`replaceArrayItemAtIndex index out of bounds: ${index}`)
  }

  const output = array.slice()
  output[index] = newValue
  return output.sort(asc)
}
