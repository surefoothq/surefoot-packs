import { cn } from '../lib/utils'
import { Component, onCleanup, onMount, Show } from 'solid-js'
import type { Profile } from '../types'
import { ProfileHeader } from './ProfileHeader'
import { ProfileViewContainer } from './ProfileViewContainer'
import { BrowserProfileContext } from '@renderer/contexts/BrowserProfileContext'
import { useBrowserProfile } from '@renderer/hooks/useBrowserProfile'
import { Browser } from './Browser'
import { EmptyView } from './EmptyView'

interface ProfileProps {
  profile: Profile
}

const Profile: Component<ProfileProps> = (props) => {
  const getProfile = (): Profile => props.profile
  const context = useBrowserProfile(getProfile)

  /** Setup and Teardown */
  onMount(() => {
    window.electron.ipcRenderer.invoke('setup-profile', props.profile.id).then(() => {
      context.setReady(true)
    })

    onCleanup(() => {
      window.electron.ipcRenderer.invoke('destroy-profile', props.profile.id)
    })
  })

  return (
    <BrowserProfileContext.Provider value={context}>
      {/* Profile Content */}
      <Show when={context.store.ready} fallback={<EmptyView class="grow" />}>
        <div
          ref={context.setContainerRef}
          class={cn(
            'grow flex flex-col shrink-0',
            'divide-y dark:divide-neutral-700',
            'bg-white dark:bg-neutral-800 dark:text-white'
          )}
        >
          {/* Profile Header */}
          <ProfileHeader />

          {/* Farmer and Browser */}
          <ProfileViewContainer>
            {/* Profile View */}
            <Browser />
          </ProfileViewContainer>
        </div>
      </Show>
    </BrowserProfileContext.Provider>
  )
}

export { Profile }
