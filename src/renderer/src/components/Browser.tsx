import { Component, For, Show } from 'solid-js'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'

import { ActionPopup } from './ActionPopup'
import { BrowserTab } from './BrowserTab'
import { BrowserTabButtonList } from './BrowserTabButtonList'
import { cn } from '../lib/utils'

const Browser: Component = () => {
  const context = useBrowserProfileContext()

  return (
    <div class="grow flex flex-col relative">
      {/* Tab Buttons */}
      <BrowserTabButtonList />

      {/* Tabs */}
      <div class="relative grow">
        <For each={context.store.tabs}>
          {(tab, index) => (
            <div class={cn('absolute inset-0 flex flex-col', !tab.isActive && 'invisible')}>
              <BrowserTab index={index()} tab={tab} />
            </div>
          )}
        </For>
      </div>

      {/* Action Popup */}
      <Show when={context.store.action}>
        <ActionPopup />
      </Show>
    </div>
  )
}

export { Browser }
