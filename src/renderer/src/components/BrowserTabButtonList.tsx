import { Component, For } from 'solid-js'
import { HiOutlinePlus } from 'solid-icons/hi'
import { cn } from '@renderer/lib/utils'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'

import { BrowserTabButton } from './BrowserTabButton'
import { WebviewButton } from './WebviewButton'

const BrowserTabButtonList: Component = () => {
  /* Get Context */
  const context = useBrowserProfileContext()

  /** Tab Buttons Container Ref */
  let containerRef!: HTMLDivElement

  /** Scroll to Tab Button */
  const scrollToTabButton = (element: HTMLElement): void => {
    const container = containerRef
    const containerRect = container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()

    const offsetLeft = elementRect.left - containerRect.left + container.scrollLeft
    const targetScrollLeft = offsetLeft - container.clientWidth / 2 + element.offsetWidth / 2

    container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' })
  }

  return (
    <div
      ref={containerRef}
      class={cn(
        'w-full relative z-0',
        'flex items-center shrink-0 py-1 pr-2',
        'overflow-auto scrollbar-thin'
      )}
    >
      {/* Main */}
      <div class="sticky left-0 py-1 px-2 bg-white z-1 dark:bg-slate-800 shrink-0">
        <WebviewButton
          onClick={() =>
            context.sendIpc('create-tab', { url: context.store.config.newTabURL || '' })
          }
        >
          <HiOutlinePlus class="size-4" />
        </WebviewButton>
      </div>

      {/* Tab Buttons */}
      <div class="flex gap-1 flex-nowrap shrink-0">
        <For each={context.store.tabs}>
          {(tab) => <BrowserTabButton tab={tab} scrollToTabButton={scrollToTabButton} />}
        </For>
      </div>
    </div>
  )
}

export { BrowserTabButtonList }
