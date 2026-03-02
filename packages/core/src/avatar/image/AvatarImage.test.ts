import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { AvatarImage, AvatarRoot } from '../index'
import * as useImageLoadingStatusModule from './useImageLoadingStatus'

vi.mock('./useImageLoadingStatus')

describe('<AvatarImage />', () => {
  const useImageLoadingStatusMock = vi.mocked(
    useImageLoadingStatusModule.useImageLoadingStatus,
  )

  beforeEach(() => {
    useImageLoadingStatusMock.mockReturnValue({ value: 'loaded' } as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders an img by default when loaded', () => {
    const TestComponent = defineComponent({
      components: { AvatarRoot, AvatarImage },
      template: `
        <AvatarRoot>
          <AvatarImage />
        </AvatarRoot>
      `,
    })

    const wrapper = mount(TestComponent)

    const image = wrapper.find('img')
    expect(image.exists()).toBe(true)
  })

  it('does not render if not loaded', () => {
    useImageLoadingStatusMock.mockReturnValue({ value: 'idle' } as any)

    const TestComponent = defineComponent({
      components: { AvatarRoot, AvatarImage },
      template: `
        <AvatarRoot>
          <AvatarImage />
        </AvatarRoot>
      `,
    })

    const wrapper = mount(TestComponent)

    const image = wrapper.find('img')
    expect(image.exists()).toBe(false)
  })
})
