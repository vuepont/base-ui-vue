import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as useImageLoadingStatusModule from '../image/useImageLoadingStatus'
import { AvatarFallback, AvatarImage, AvatarRoot } from '../index'

vi.mock('../image/useImageLoadingStatus')

describe('<AvatarFallback />', () => {
  const useImageLoadingStatusMock = vi.mocked(useImageLoadingStatusModule.useImageLoadingStatus)

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders a span by default', () => {
    useImageLoadingStatusMock.mockReturnValue({ value: 'error' } as any)
    const wrapper = mount(AvatarRoot, {
      slots: {
        default: () => mount(AvatarFallback).vnode,
      },
    })

    const fallback = wrapper.find('span')
    expect(fallback.exists()).toBe(true)
  })

  it('should not render if the image loaded', () => {
    useImageLoadingStatusMock.mockReturnValue({ value: 'loaded' } as any)

    const wrapper = mount(AvatarRoot, {
      slots: {
        default: () => [mount(AvatarImage).vnode, mount(AvatarFallback).vnode],
      },
    })

    const fallback = wrapper.findComponent(AvatarFallback)
    expect(fallback.html()).toBe('')
  })

  it('should render the fallback if the image fails to load', () => {
    useImageLoadingStatusMock.mockReturnValue({ value: 'error' } as any)

    const wrapper = mount(AvatarRoot, {
      slots: {
        default: () => [mount(AvatarImage).vnode, mount(AvatarFallback, { slots: { default: 'AC' } }).vnode],
      },
    })

    expect(wrapper.text()).toContain('AC')
  })

  describe('prop: delay', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('shows the fallback when the delay has elapsed', async () => {
      useImageLoadingStatusMock.mockReturnValue({ value: 'error' } as any)

      const wrapper = mount(AvatarRoot, {
        slots: {
          default: () => mount(AvatarFallback, { props: { delay: 100 }, slots: { default: 'AC' } }).vnode,
        },
      })

      expect(wrapper.text()).not.toContain('AC')

      vi.advanceTimersByTime(100)
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('AC')
    })
  })
})
