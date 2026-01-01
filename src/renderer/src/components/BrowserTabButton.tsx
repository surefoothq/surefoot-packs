import { HiOutlineXMark } from 'solid-icons/hi'
import BrowserIcon from '../assets/images/browser.png'
import { cn } from '../lib/utils'
import { Tab } from '@renderer/types'
import { Component, createEffect } from 'solid-js'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'

/** Browser Tab Button Props */
interface BrowserTabButtonProps {
  tab: Tab
  scrollToTabButton: (element: HTMLDivElement) => void
}

/** Browser Tab Button Component */
const BrowserTabButton: Component<BrowserTabButtonProps> = (props) => {
  let ref!: HTMLDivElement

  const context = useBrowserProfileContext()

  /** Button Click Handler */
  const handleTabButtonClick = (): void => context.setActiveTab(props.tab.id)

  /** Close Button Click Handler */
  const handleCloseButtonClick = (ev: MouseEvent): void => {
    /** Stop Propagation */
    ev.stopPropagation()

    /** Close Tab */
    context.closeTab(props.tab.id)
  }

  /** Scroll into View */
  createEffect(() => {
    if (props.tab.active) {
      props.scrollToTabButton(ref)
    }
  })

  return (
    <div
      ref={ref}
      onClick={handleTabButtonClick}
      class={cn(
        props.tab.active && 'bg-neutral-100 dark:bg-neutral-700',
        'p-1.5 rounded-full shrink-0',
        'flex gap-2 items-center',
        'cursor-pointer'
      )}
    >
      {/* Icon */}
      <img src={props.tab.icon || BrowserIcon} class="size-6 rounded-full" />

      {/* Title */}
      <h1 class={cn('font-bold', 'max-w-10 truncate')}>{props.tab.title}</h1>

      {/* Close Button */}
      <button
        onClick={handleCloseButtonClick}
        class={cn(
          'p-1 rounded-full cursor-pointer',
          'flex items-center justify-center',
          props.tab.active && 'bg-neutral-200 dark:bg-neutral-600'
        )}
      >
        <HiOutlineXMark class="size-4" />
      </button>
    </div>
  )
}

export { BrowserTabButton }
