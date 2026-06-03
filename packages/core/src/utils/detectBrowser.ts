const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const platform = typeof navigator !== 'undefined' ? navigator.platform : ''
const maxTouchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0

export const isWebKit
  = typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    ? CSS.supports('-webkit-backdrop-filter:none') && !/chrome|android/i.test(ua)
    : /\b(?:iphone|ipad|ipod)\b/i.test(ua)

export const isFirefox = /firefox/i.test(ua)

export const isIOS
  = /\b(?:iphone|ipad|ipod)\b/i.test(ua)
    // iPadOS reports as "MacIntel" but exposes touch points.
    || (platform === 'MacIntel' && maxTouchPoints > 1)
