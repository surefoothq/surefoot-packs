import { HiArrowLeft, HiOutlineArrowUpRight } from 'react-icons/hi2'
import { cn } from '@renderer/lib/utils'
import { useAppContext } from '@renderer/hooks/useAppContext'
import { useExtensionsQuery } from '@renderer/hooks/useExtensionsQuery'
import { useMemo } from 'react'

import { ProfileAvatar } from './ProfileAvatar'

const ProfileDetails = (): React.JSX.Element => {
  const app = useAppContext()
  const profile = app.profile!

  const extensionsQuery = useExtensionsQuery(profile.path)
  const extensions = useMemo(() => {
    return extensionsQuery.data || []
  }, [extensionsQuery.data])

  console.log('Extensions:', extensions)

  return (
    <>
      <div
        className={cn(
          'shrink-0 p-1',
          'flex items-center justify-between gap-2',
          'sticky top-0 bg-neutral-900',
          'border-b border-neutral-700'
        )}
      >
        {/* Return button */}
        <button
          className="shrink-0 p-2 cursor-pointer rounded-full hover:bg-neutral-800"
          onClick={() => app.setProfile(null)}
        >
          <HiArrowLeft className="size-5" />
        </button>

        {/* Launch button */}
        <button
          onClick={() => app.launchProfile(profile['directory'])}
          className={cn(
            'rounded-full bg-blue-500 text-white',
            'font-bold px-4 py-2 cursor-pointer',
            'flex gap-2 items-center'
          )}
        >
          <HiOutlineArrowUpRight />
          Launch
        </button>
      </div>
      <div className="flex flex-col gap-4 p-10">
        {/* Profile info */}
        <div className="flex flex-col justify-center items-center gap-4 text-center">
          {/* Profile avatar */}
          {profile.picture ? (
            <img
              src={`file://${profile.picture}`}
              className="size-20 shrink-0 rounded-full"
              loading="lazy"
            />
          ) : (
            <ProfileAvatar profile={profile} className="size-20 shrink-0 rounded-full" />
          )}

          {/* Profile details */}
          <div className="flex flex-col gap-1 px-2 w-full">
            <span className="font-boldonse truncate text-lg">{profile['name']}</span>
            {profile['gaia_name'] ? <span className="truncate">{profile['gaia_name']}</span> : null}
            {profile['user_name'] ? (
              <span className="truncate text-neutral-400">{profile['user_name']}</span>
            ) : null}
          </div>
        </div>

        {/* Extensions */}
        <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
          {extensions.map((item) => (
            <button
              key={item.id}
              className={cn(
                'flex p-2 gap-2 rounded-xl text-left cursor-pointer',
                'bg-neutral-800 hover:bg-neutral-700'
              )}
            >
              <img src={`file://${item.icon}`} className="size-10 shrink-0 bg-white rounded-full" />
              <div className="grow min-w-0 flex flex-col">
                <div className="font-bold truncate">{item.name}</div>
                <p className="text-neutral-400 truncate">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export { ProfileDetails }
