import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { AvatarRoot } from '../index'

describe('<AvatarRoot />', () => {
  it('renders a span by default', () => {
    const wrapper = mount(AvatarRoot)
    expect(wrapper.element.tagName).toBe('SPAN')
  })

  it('renders a custom element when `as` is provided', () => {
    const wrapper = mount(AvatarRoot, {
      props: {
        as: 'div',
      },
    })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('provides imageLoadingStatus context', () => {
    const wrapper = mount(AvatarRoot, {
      slots: {
        default: '<span data-testid="child"></span>',
      },
    })
    expect(wrapper.find('[data-testid="child"]').exists()).toBe(true)
  })
})
