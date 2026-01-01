import { Dialog } from '@kobalte/core'

import Icon from '../assets/images/icon.svg'
import {
  HiOutlineArrowPath,
  HiOutlineArrowsPointingOut,
  HiOutlineBars3,
  HiOutlineCog6Tooth
} from 'solid-icons/hi'
import { Component } from 'solid-js'

const SideMenu: Component = () => {
  /** Toggle FullScreen */
  const toggleFullScreen = (): void => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }

  return (
    <div class="shrink-0 w-14 p-2 h-full flex flex-col gap-2 items-center">
      {/* Account List */}
      <Dialog.Root>
        <Dialog.Trigger title="Accounts" class="p-2 cursor-pointer">
          <HiOutlineBars3 class="size-5 text-blue-500" />
        </Dialog.Trigger>
      </Dialog.Root>

      {/* Settings */}
      <Dialog.Root>
        <Dialog.Trigger title="Settings" class="p-2 cursor-pointer">
          <HiOutlineCog6Tooth class="size-5 text-blue-500" />
        </Dialog.Trigger>
      </Dialog.Root>

      {/* Fullscreen Toggle */}
      <button title="Toggle Fullscreen" class="p-2 cursor-pointer" onClick={toggleFullScreen}>
        <HiOutlineArrowsPointingOut class="size-5 text-blue-500" />
      </button>

      {/* App Icon */}
      <Dialog.Root>
        <Dialog.Trigger class="mt-auto size-10 relative flex cursor-pointer">
          <img src={Icon} alt="Packs" class="size-full rounded-full" />
        </Dialog.Trigger>
      </Dialog.Root>

      {/* Reload */}
      <button
        title="Reload App"
        class="p-2 cursor-pointer"
        onClick={() => window.location.reload()}
      >
        <HiOutlineArrowPath class="size-5 text-blue-500" />
      </button>
    </div>
  )
}

export { SideMenu }
