import { isIOS, isWebKit } from './detectBrowser'

const platformName = typeof navigator !== 'undefined' ? navigator.platform : ''
const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''

const isApplePlatform
  = isIOS
    || /mac/i.test(platformName)
    || /\b(?:macintosh|iphone|ipad|ipod)\b/i.test(userAgent)

export const platform = {
  engine: {
    webkit: isWebKit,
  },
  screenReader: {
    voiceOver: isApplePlatform,
  },
} as const
