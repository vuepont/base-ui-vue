const formatterCache = new Map<string, Intl.NumberFormat>()

/**
 * Returns a memoized `Intl.NumberFormat` for the given locale/options.
 */
export function getFormatter(locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
  const optionsString = JSON.stringify({ locale, options })
  const cachedFormatter = formatterCache.get(optionsString)

  if (cachedFormatter) {
    return cachedFormatter
  }

  const formatter = new Intl.NumberFormat(locale, options)
  formatterCache.set(optionsString, formatter)

  return formatter
}

export function formatNumber(
  value: number | null,
  locale?: Intl.LocalesArgument,
  options?: Intl.NumberFormatOptions,
) {
  if (value == null) {
    return ''
  }
  return getFormatter(locale, options).format(value)
}

export function formatNumberMaxPrecision(
  value: number | null,
  locale?: Intl.LocalesArgument,
  options?: Intl.NumberFormatOptions,
) {
  return formatNumber(value, locale, {
    ...options,
    maximumFractionDigits: 20,
  })
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
