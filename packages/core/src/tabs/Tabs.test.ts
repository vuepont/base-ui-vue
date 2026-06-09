import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import {
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsRoot,
  TabsTab,
} from '.'

function createTabsApp(template: string, setup?: () => Record<string, unknown>) {
  return defineComponent({
    components: {
      TabsIndicator,
      TabsList,
      TabsPanel,
      TabsRoot,
      TabsTab,
    },
    setup,
    template,
  })
}

describe('<Tabs />', () => {
  it('links tabs and panels with aria attributes', async () => {
    render(createTabsApp(`
      <TabsRoot default-value="overview">
        <TabsList>
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab id="projects-tab" value="projects">Projects</TabsTab>
        </TabsList>
        <TabsPanel value="projects" keep-mounted>Projects panel</TabsPanel>
        <TabsPanel value="overview" keep-mounted>Overview panel</TabsPanel>
      </TabsRoot>
    `))

    const tabs = screen.getAllByRole('tab')
    const panels = screen.getAllByRole('tabpanel', { hidden: true })

    await waitFor(() => {
      expect(tabs[0]).toHaveAttribute('aria-controls', panels[1].id)
      expect(tabs[1]).toHaveAttribute('aria-controls', panels[0].id)
      expect(panels[0]).toHaveAttribute('aria-labelledby', 'projects-tab')
      expect(panels[1]).toHaveAttribute('aria-labelledby', tabs[0].id)
    })
  })

  it('activates a tab on click', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot default-value="overview">
        <TabsList>
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="projects">Projects</TabsTab>
        </TabsList>
        <TabsPanel value="overview">Overview panel</TabsPanel>
        <TabsPanel value="projects">Projects panel</TabsPanel>
      </TabsRoot>
    `))

    await user.click(screen.getByRole('tab', { name: 'Projects' }))

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: 'Projects' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Projects panel')).toBeInTheDocument()
    expect(screen.queryByText('Overview panel')).not.toBeInTheDocument()
  })

  it('does not change controlled value unless the parent updates it', async () => {
    const user = userEvent.setup()
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot value="overview" @value-change="handleValueChange">
          <TabsList>
            <TabsTab value="overview">Overview</TabsTab>
            <TabsTab value="projects">Projects</TabsTab>
          </TabsList>
          <TabsPanel value="overview">Overview panel</TabsPanel>
          <TabsPanel value="projects">Projects panel</TabsPanel>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await user.click(screen.getByRole('tab', { name: 'Projects' }))

    expect(handleValueChange).toHaveBeenCalledTimes(1)
    expect(handleValueChange.mock.calls[0][0]).toBe('projects')
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByText('Projects panel')).not.toBeInTheDocument()
  })

  it('allows canceling a user-initiated value change', async () => {
    const user = userEvent.setup()
    const handleValueChange = vi.fn((_value, details) => {
      details.cancel()
    })

    render(createTabsApp(
      `
        <TabsRoot default-value="overview" @value-change="handleValueChange">
          <TabsList>
            <TabsTab value="overview">Overview</TabsTab>
            <TabsTab value="projects">Projects</TabsTab>
          </TabsList>
          <TabsPanel value="overview">Overview panel</TabsPanel>
          <TabsPanel value="projects">Projects panel</TabsPanel>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await user.click(screen.getByRole('tab', { name: 'Projects' }))

    expect(handleValueChange).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Overview panel')).toBeInTheDocument()
  })

  it('selects the first enabled tab when the implicit initial value is disabled', async () => {
    render(createTabsApp(`
      <TabsRoot>
        <TabsList>
          <TabsTab :value="0" disabled>Disabled</TabsTab>
          <TabsTab :value="1">Enabled</TabsTab>
        </TabsList>
        <TabsPanel :value="0" keep-mounted>Disabled panel</TabsPanel>
        <TabsPanel :value="1" keep-mounted>Enabled panel</TabsPanel>
      </TabsRoot>
    `))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Disabled' })).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByRole('tab', { name: 'Enabled' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('Disabled panel')).toHaveAttribute('hidden')
      expect(screen.getByText('Enabled panel')).not.toHaveAttribute('hidden')
    })
  })

  it('emits an initial automatic change when default value is omitted', async () => {
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot @value-change="handleValueChange">
          <TabsList>
            <TabsTab value="overview">Overview</TabsTab>
            <TabsTab value="projects">Projects</TabsTab>
          </TabsList>
          <TabsPanel value="overview">Overview panel</TabsPanel>
          <TabsPanel value="projects">Projects panel</TabsPanel>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalled()
      expect(handleValueChange.mock.calls[0][0]).toBe('overview')
      expect(handleValueChange.mock.calls[0][1].reason).toBe('initial')
    })
  })

  it('activates focused tabs during keyboard navigation when activate-on-focus is set', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot default-value="overview">
        <TabsList activate-on-focus>
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="projects">Projects</TabsTab>
        </TabsList>
        <TabsPanel value="overview">Overview panel</TabsPanel>
        <TabsPanel value="projects">Projects panel</TabsPanel>
      </TabsRoot>
    `))

    screen.getByRole('tab', { name: 'Overview' }).focus()
    await user.keyboard('{ArrowRight}')

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Projects' })).toHaveFocus()
      expect(screen.getByRole('tab', { name: 'Projects' })).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('applies orientation and activation direction data attributes', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot default-value="a" orientation="vertical" data-testid="root">
        <TabsList data-testid="list">
          <TabsTab value="a">A</TabsTab>
          <TabsTab value="b">B</TabsTab>
        </TabsList>
        <TabsPanel value="a">Panel A</TabsPanel>
        <TabsPanel value="b">Panel B</TabsPanel>
      </TabsRoot>
    `))

    const tabA = screen.getByRole('tab', { name: 'A' })
    const tabB = screen.getByRole('tab', { name: 'B' })
    vi.spyOn(tabA, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 80,
      bottom: 32,
      width: 80,
      height: 32,
      toJSON: () => {},
    })
    vi.spyOn(tabB, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 40,
      top: 40,
      left: 0,
      right: 80,
      bottom: 72,
      width: 80,
      height: 32,
      toJSON: () => {},
    })

    await user.click(screen.getByRole('tab', { name: 'B' }))

    expect(screen.getByTestId('root')).toHaveAttribute('data-orientation', 'vertical')
    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'down')
    expect(screen.getByTestId('list')).toHaveAttribute('data-orientation', 'vertical')
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('data-active')
  })
})
