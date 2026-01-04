import { Component } from 'solid-js'
import { HiSolidBars3 } from 'solid-icons/hi'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'

import BrowserActionList from './BrowserActionList'
import { WebviewButton } from './WebviewButton'

const ProfileFooter: Component = () => {
  const context = useBrowserProfileContext()

  return (
    <div class="shrink-0 flex flex-wrap items-center justify-between p-1 gap-2">
      <div class="border border-slate-200 dark:border-slate-600 rounded-full p-1 px-2 overflow-auto">
        <BrowserActionList
          partition={`persist:profile-${context.profile().id}`}
          tab={context.activeTab()?.webContentsId}
        />
      </div>
      <WebviewButton>
        <HiSolidBars3 />
      </WebviewButton>
    </div>
  )
}

export { ProfileFooter }
