import { Dialog } from '@kobalte/core'
import { cn } from '../lib/utils'
import { addProfile, store } from '../store'
import { Component, createSignal } from 'solid-js'
import { HiOutlinePlus } from 'solid-icons/hi'
import { Input } from './Input'

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
        class={cn(
          'fixed inset-y-0 left-0',
          'w-5/6 max-w-xs',
          'bg-white dark:bg-slate-800',
          'flex flex-col'
        )}
      >
        <div class="p-4 flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <div class="flex flex-col grow">
              <Dialog.Title
                class={cn('leading-none font-bold font-turret-road', 'text-lg text-blue-500')}
              >
                Profiles ({profiles.length})
              </Dialog.Title>
              <Dialog.Description class="text-slate-500 dark:text-slate-400 leading-none">
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
                  'bg-blue-100 text-blue-700',
                  'dark:bg-blue-200 dark:text-blue-500',
                  'flex items-center gap-2',
                  'p-2 px-3 rounded-xl text-left',
                  'font-bold'
                )}
              >
                <HiOutlinePlus class="size-5 text-blue-500" />
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
          List of Profiles goes here
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  )
}

export { ProfileListDialog }
