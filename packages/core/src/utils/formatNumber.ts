export function formatNumber(
  value: number,
  locale?: Intl.LocalesArgument,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(locale, options).format(value)
}
