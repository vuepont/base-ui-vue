export function formatNumber(
  value: number,
  locale?: Intl.LocalesArgument,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(locale, options).format(value)
}

/**
 * Formats a numeric value for display inside Base UI Vue components.
 *
 * When no `format` is provided, the value is interpreted as a percentage
 * in the 0-100 range (matching React's Base UI semantics for
 * `<Meter.Root>` / `<Progress.Root>`).
 *
 * Returns an empty string when the value is `null`.
 */
export function formatNumberValue(
  value: number | null,
  locale?: Intl.LocalesArgument,
  format?: Intl.NumberFormatOptions,
): string {
  if (value == null) {
    return ''
  }

  if (!format) {
    return formatNumber(value / 100, locale, { style: 'percent' })
  }

  return formatNumber(value, locale, format)
}
