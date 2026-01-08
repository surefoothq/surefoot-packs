import { Component, createEffect } from 'solid-js'
import { HiOutlineXMark } from 'solid-icons/hi'
import { Tab } from '@renderer/types'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'

import BrowserIcon from '../assets/images/browser.png'
import { cn } from '../lib/utils'

/** Browser Tab Button Props */
interface BrowserTabButtonProps {
  tab: Tab
  scrollToTabButton: (element: HTMLDivElement) => void
}

/** Browser Tab Button Component */
const BrowserTabButton: Component<BrowserTabButtonProps> = (props) => {
  let ref!: HTMLDivElement

  /* Get Context */
  const context = useBrowserProfileContext()

  /** Button Click Handler */
  const handleTabButtonClick = (): void => context.sendIpc('select-tab', props.tab.id)

  /** Close Button Click Handler */
  const handleCloseButtonClick = (ev: MouseEvent): void => {
    /** Stop Propagation */
    ev.stopPropagation()

    /** Close Tab */
    context.sendIpc('remove-tab', props.tab.id)
  }

  /** Scroll into View */
  createEffect(() => {
    if (props.tab.isActive) {
      props.scrollToTabButton(ref)
    }
  })

  return (
    <div
      ref={ref}
      onClick={handleTabButtonClick}
      class={cn(
        props.tab.isActive && 'bg-slate-100 dark:bg-slate-700',
        'p-1.5 rounded-full shrink-0',
        'flex gap-2 items-center',
        'cursor-pointer'
      )}
    >
      {/* Icon */}
      <img src={props.tab.faviconUrl || BrowserIcon} class="size-6 rounded-full" />

      {/* Title */}
      <h1 class={cn('font-bold', 'max-w-10 truncate')}>{props.tab.title}</h1>

      {/* Close Button */}
      <button
        onClick={handleCloseButtonClick}
        class={cn(
          'p-1 rounded-full cursor-pointer',
          'flex items-center justify-center',
          props.tab.isActive && 'bg-slate-200 dark:bg-slate-600'
        )}
      >
        <HiOutlineXMark class="size-4" />
      </button>
    </div>
  )
}

export { BrowserTabButton }
