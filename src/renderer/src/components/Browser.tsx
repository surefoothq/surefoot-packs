import { cn } from '../lib/utils'
import { Component, For } from 'solid-js'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'
import { BrowserTab } from './BrowserTab'
import { BrowserTabButtonList } from './BrowserTabButtonList'

const Browser: Component = () => {
  const context = useBrowserProfileContext()

  return (
    <div class="grow flex flex-col">
      {/* Tab Buttons */}
      <BrowserTabButtonList />

      {/* Tabs */}
      <div class="relative grow">
        <For each={context.store.tabs}>
          {(item, index) => (
            <div class={cn('absolute inset-0 flex flex-col', !item.active && 'invisible')}>
              <BrowserTab index={index()} tab={item} />
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

export { Browser }
