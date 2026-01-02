import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'
import { HiSolidBars3 } from 'solid-icons/hi'
import { Component } from 'solid-js'
import { WebviewButton } from './WebviewButton'

const ProfileFooter: Component = () => {
  const context = useBrowserProfileContext()
  return (
    <div class="shrink-0 flex flex-wrap items-center justify-between p-1 gap-2">
      <div class="border border-neutral-200 dark:border-neutral-600 rounded-full p-1 px-2 overflow-auto">
        <browser-action-list partition={`persist:profile-${context.profile().id}`} />
      </div>
      <WebviewButton>
        <HiSolidBars3 />
      </WebviewButton>
    </div>
  )
}

export { ProfileFooter }
