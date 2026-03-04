import type { Mock } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { computed, defineComponent, ref } from 'vue'
import * as useImageLoadingStatusModule from '../image/useImageLoadingStatus'
import { AvatarFallback, AvatarImage, AvatarRoot } from '../index'

vi.mock('../image/useImageLoadingStatus')

describe('<AvatarFallback />', () => {
  const useImageLoadingStatusMock = vi.mocked(
    useImageLoadingStatusModule.useImageLoadingStatus,
  )

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders a span by default', () => {
    useImageLoadingStatusMock.mockReturnValue({ value: 'error' } as any)

    const TestComponent = defineComponent({
      components: { AvatarRoot, AvatarFallback },
      template: `
        <AvatarRoot>
          <AvatarFallback />
        </AvatarRoot>
      `,
    })

    const wrapper = mount(TestComponent)
    const fallback = wrapper.find('span')
    expect(fallback.exists()).toBe(true)
  })

  it('should not render the children if the image loaded', () => {
    (useImageLoadingStatusMock as Mock).mockReturnValue({
      value: 'loaded',
    })

    const TestComponent = defineComponent({
      components: { AvatarRoot, AvatarImage, AvatarFallback },
      template: `
        <AvatarRoot>
          <AvatarImage />
          <AvatarFallback data-testid="fallback" />
        </AvatarRoot>
      `,
    })

    const wrapper = mount(TestComponent)
    expect(wrapper.find('[data-testid="fallback"]').exists()).toBe(false)
  })

  it('should render the fallback if the image fails to load', () => {
    (useImageLoadingStatusMock as Mock).mockReturnValue({ value: 'error' })

    const TestComponent = defineComponent({
      components: { AvatarRoot, AvatarImage, AvatarFallback },
      template: `
        <AvatarRoot>
          <AvatarImage />
          <AvatarFallback>AC</AvatarFallback>
        </AvatarRoot>
      `,
    })

    const wrapper = mount(TestComponent)
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

      const TestComponent = defineComponent({
        components: { AvatarRoot, AvatarImage, AvatarFallback },
        template: `
          <AvatarRoot>
            <AvatarImage />
            <AvatarFallback :delay="100">AC</AvatarFallback>
          </AvatarRoot>
        `,
      })

      const wrapper = mount(TestComponent)
      expect(wrapper.text()).not.toContain('AC')

      vi.advanceTimersByTime(100)
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('AC')
    })
  })

  it('keeps fallback mounted and image unmounted while the image is loading', async () => {
    (useImageLoadingStatusMock as Mock).mockImplementation((src: any) =>
      computed(() => (src() ? 'loading' : 'error')),
    )

    const TestComponent = defineComponent({
      components: { AvatarRoot, AvatarImage, AvatarFallback },
      setup() {
        const showImage = ref(false)
        return { showImage }
      },
      template: `
        <div>
          <button @click="showImage = true">Show image</button>
          <AvatarRoot>
            <AvatarImage data-testid="image" :src="showImage ? 'avatar.png' : undefined" />
            <AvatarFallback data-testid="fallback">AC</AvatarFallback>
          </AvatarRoot>
        </div>
      `,
    })

    const wrapper = mount(TestComponent)

    expect(wrapper.find('[data-testid="image"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="fallback"]').exists()).toBe(true)

    await wrapper.find('button').trigger('click')

    expect(wrapper.find('[data-testid="image"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="fallback"]').exists()).toBe(true)
  })

  describe('regression', () => {
    afterEach(() => {
      (globalThis as any).BASE_UI_ANIMATIONS_DISABLED = true
    })

    it('keeps only one of image or fallback mounted when switching to image', async () => {
      (globalThis as any).BASE_UI_ANIMATIONS_DISABLED = false;

      (useImageLoadingStatusMock as Mock).mockImplementation(src =>
        computed(() => (src() ? 'loaded' : 'error')),
      )

      const TestComponent = defineComponent({
        components: { AvatarRoot, AvatarImage, AvatarFallback },
        setup() {
          const showImage = ref(false)
          return { showImage }
        },
        template: `
          <div>
            <button @click="showImage = true">Show image</button>
            <AvatarRoot>
              <AvatarImage data-testid="image" :src="showImage ? 'avatar.png' : undefined" />
              <AvatarFallback class="animation-test-fallback" data-testid="fallback">
                AC
              </AvatarFallback>
            </AvatarRoot>
          </div>
        `,
      })

      const wrapper = mount(TestComponent, {
        attachTo: document.body,
      })

      const style = document.createElement('style')
      style.textContent = `
        @keyframes test-exit {
          to {
            opacity: 0;
          }
        }
        .animation-test-fallback[data-ending-style] {
          animation: test-exit 2s;
        }
      `
      document.head.appendChild(style)

      expect(wrapper.find('[data-testid="image"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="fallback"]').exists()).toBe(true)

      await wrapper.find('button').trigger('click')

      expect(wrapper.find('[data-testid="image"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="fallback"]').exists()).toBe(false)

      document.head.removeChild(style)
      wrapper.unmount()
    })
  })
})
