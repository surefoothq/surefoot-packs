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
        <For each={context.tabs()}>
          {(item, index) => (
            <div class={cn('absolute inset-0 flex flex-col', !item.active && 'invisible')}>
              <BrowserTab index={index()} tab={item} />
            </div>
          )}
        </For>
      </div>

      {/* Action Popup */}
      <Show when={context.action()}>
        <ActionPopup />
      </Show>
    </div>
  )
}

export { Browser }
