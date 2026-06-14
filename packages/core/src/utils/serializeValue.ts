export function serializeValue(value: unknown): string {
  if (value == null) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  try {
    const serializedValue = JSON.stringify(value)
    return serializedValue === undefined ? 'null' : serializedValue
  }
  catch {
    return String(value)
  }
}
