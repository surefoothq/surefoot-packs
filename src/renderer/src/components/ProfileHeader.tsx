import { Component } from 'solid-js'
import { WebviewButton } from './WebviewButton'
import { Dialog } from '@kobalte/core'
import { TbEdit } from 'solid-icons/tb'
import { HiOutlineGlobeAlt, HiOutlineXCircle } from 'solid-icons/hi'
import { BsFullscreen } from 'solid-icons/bs'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'
import { cn } from '@renderer/lib/utils'

const ProfileHeader: Component = () => {
  const context = useBrowserProfileContext()

  return (
    <div class="flex gap-2 items-center justify-between p-2">
      <div class="flex gap-1">
        {/* Toggle Browser */}
        <WebviewButton
          title="Toggle Browser"
          onClick={() => context.toggleAside()}
          class={context.store.showAside ? 'text-blue-500' : ''}
        >
          <HiOutlineGlobeAlt class="size-4" />
        </WebviewButton>

        {/* Toggle Fullscreen */}
        <WebviewButton
          title="Toggle Fullscreen"
          onClick={() => context.toggleFullScreen()}
          class={context.store.isDesktop ? 'text-blue-500' : ''}
        >
          <BsFullscreen class="size-4" />
        </WebviewButton>
      </div>

      {/* Name */}
      <h1 class={cn('text-blue-500 text-sm', 'truncate font-bold text-center')}>
        {context.profile().name}
      </h1>

      <div class="flex gap-1">
        {/* Edit Dialog */}
        <Dialog.Root>
          {/* Edit Button */}
          <Dialog.Trigger
            disabled={context.store.isDesktop}
            as={WebviewButton}
            title="Edit Account"
          >
            <TbEdit class="size-4" />
          </Dialog.Trigger>
        </Dialog.Root>

        {/* Close Button */}
        <WebviewButton title="Close Account">
          <HiOutlineXCircle class="size-4" />
        </WebviewButton>
      </div>
    </div>
  )
}

export { ProfileHeader }
