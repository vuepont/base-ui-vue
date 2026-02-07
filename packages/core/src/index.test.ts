import { expect, it } from 'vitest'
import * as BaseUI from './index'

it('should export package name and version', () => {
  expect(BaseUI.name).toBe('base-ui-vue')
  expect(BaseUI.version).toBe('0.0.0')
})
