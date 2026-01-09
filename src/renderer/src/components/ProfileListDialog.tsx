import { Component, For, Show, createSignal } from 'solid-js'
import { Dialog } from '@kobalte/core'
import { HiOutlineUserPlus, HiSolidCheckBadge } from 'solid-icons/hi'

import UserIcon from '../assets/images/user@100.png'
import { Input } from './Input'
import { addProfile, launchProfile, store } from '../store'
import { cn } from '../lib/utils'

const ProfileListDialog: Component = () => {
  const [search, setSearch] = createSignal('')
  const profiles = store.profiles

  const handleAddProfile = (): void => {
    addProfile({
      id: crypto.randomUUID(),
      name: `Profile ${store.profiles.length + 1}`,
      active: true
    })
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay class="fixed inset-0 bg-black/50" />
      <Dialog.Content
        onOpenAutoFocus={(ev) => ev.preventDefault()}
        class={cn('fixed inset-y-0 left-0', 'w-5/6 max-w-xs', 'bg-neutral-950', 'flex flex-col')}
      >
        <div class="p-4 flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <div class="flex flex-col grow">
              <Dialog.Title
                class={cn('leading-none font-bold font-turret-road', 'text-lg text-blue-400')}
              >
                Profiles ({profiles.length})
              </Dialog.Title>
              <Dialog.Description class="text-neutral-400 leading-none">
                Select a profile
              </Dialog.Description>
            </div>

            {/* Add Profile */}
            <Dialog.Root>
              <Dialog.Trigger
                title="Add Profile"
                onClick={handleAddProfile}
                class={cn(
                  'shrink-0',
                  'bg-neutral-900 text-blue-300 cursor-pointer',
                  'flex items-center gap-2',
                  'p-2 px-3 rounded-xl text-left',
                  'font-bold'
                )}
              >
                <HiOutlineUserPlus class="size-5" />
              </Dialog.Trigger>
            </Dialog.Root>
          </div>

          <Input
            type="search"
            placeholder={'Search'}
            value={search()}
            onInput={(ev) => setSearch(ev.currentTarget.value)}
          />
        </div>

        <div class="flex flex-col px-4 pb-4 gap-2 grow overflow-auto">
          <For each={store.profiles}>
            {(profile) => (
              <button
                class={cn(
                  'bg-neutral-900 hover:bg-neutral-800',
                  'text-left rounded-xl p-2',
                  'flex items-center gap-2',
                  'cursor-pointer'
                )}
                onClick={() => launchProfile(profile.id)}
              >
                <img src={UserIcon} class="size-8 shrink-0" />
                <div class="grow min-w-0">
                  <span class="font-bold">{profile.name}</span>
                </div>

                <Show when={profile.active}>
                  <HiSolidCheckBadge class="text-blue-400 size-4 shrink-0" />
                </Show>
              </button>
            )}
          </For>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  )
}

export { ProfileListDialog }
