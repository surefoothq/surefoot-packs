import { cn } from '../lib/utils'
import { Component, Show } from 'solid-js'
import type { Profile } from '../types'
import { ProfileHeader } from './ProfileHeader'
import { ProfileViewContainer } from './ProfileViewContainer'
import { BrowserProfileContext } from '@renderer/contexts/BrowserProfileContext'
import { useBrowserProfile } from '@renderer/hooks/useBrowserProfile'
import { Browser } from './Browser'
import { EmptyView } from './EmptyView'
import { CgSpinnerTwo } from 'solid-icons/cg'
import { ProfileFooter } from './ProfileFooter'

interface ProfileProps {
  profile: Profile
}

const Profile: Component<ProfileProps> = (props) => {
  const getProfile = (): Profile => props.profile
  const context = useBrowserProfile(getProfile)

  return (
    <BrowserProfileContext.Provider value={context}>
      {/* Profile Content */}

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

        <Show
          when={context.store.ready}
          fallback={
            <EmptyView class="grow">
              <CgSpinnerTwo class="size-10 animate-spin" />
            </EmptyView>
          }
        >
          {/* Farmer and Browser */}
          <ProfileViewContainer>
            {/* Profile View */}
            <Browser />
          </ProfileViewContainer>

          {/* Profile Footer */}
          <ProfileFooter />
        </Show>
      </div>
    </BrowserProfileContext.Provider>
  )
}

export { Profile }
