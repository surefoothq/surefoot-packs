import {} from 'solid-icons/hi'

import {} from './WebviewButton'

import { Component, Show } from 'solid-js'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'

import BrowserActionList from './BrowserActionList'

const ProfileFooter: Component = () => {
  const context = useBrowserProfileContext()

  return (
    <Show when={context.selectedTab()}>
      <div class="shrink-0 flex flex-wrap items-center justify-center p-1 gap-2">
        <div class="border border-slate-200 dark:border-slate-600 rounded-full p-1 px-2 overflow-auto">
          <BrowserActionList
            partition={`persist:profile-${context.profile().id}`}
            tab={context.selectedTab()?.webContentsId}
          />
        </div>
      </div>
    </Show>
  )
}

export { ProfileFooter }
