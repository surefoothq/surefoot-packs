import {} from 'solid-icons/hi'

import {} from './WebviewButton'

import { Component, Show } from 'solid-js'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'

import BrowserActionList from './BrowserActionList'

const ProfileFooter: Component = () => {
  const context = useBrowserProfileContext()

  return (
    <Show when={context.activeTab()?.webContentsId}>
      <div class="shrink-0 flex flex-wrap items-center justify-center p-1 gap-2">
        <div class="border border-neutral-800 rounded-full p-1 px-2 overflow-auto">
          <BrowserActionList
            partition={context.partition()}
            tab={context.activeTab()?.webContentsId}
          />
        </div>
      </div>
    </Show>
  )
}

export { ProfileFooter }
