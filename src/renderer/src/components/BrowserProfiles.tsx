import { HiArrowLeft } from 'react-icons/hi2'
import { MouseEvent, useMemo, useState } from 'react'
import { browsers } from '@renderer/lib/browsers'
import { cn } from '@renderer/lib/utils'
import { useAppContext } from '@renderer/hooks/useAppContext'
import { useProfilesQuery } from '@renderer/hooks/useProfilesQuery'

import { ProfileAvatar } from './ProfileAvatar'

const BrowserProfiles = (): React.JSX.Element => {
  const app = useAppContext()
  const browser = browsers[app.browserKey!]
  const [search, setSearch] = useState('')

  const profilesQuery = useProfilesQuery(app.browserKey!)
  const profiles = useMemo(
    () =>
      profilesQuery.data
        ? [...profilesQuery.data].sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [profilesQuery.data]
  )

  const filteredProfiles = useMemo(() => {
    const lowerCaseSearch = search.trim().toLowerCase()

    return lowerCaseSearch
      ? profiles.filter((item) =>
          ['name', 'user_name', 'gaia_name'].some((key) =>
            item[key]?.toLowerCase().includes(lowerCaseSearch)
          )
        )
      : profiles
  }, [profiles, search])

  console.log('Profiles:', profiles)

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
          onClick={() => app.setBrowserKey(null)}
        >
          <HiArrowLeft className="size-5" />
        </button>
      </div>
      <div className="flex flex-col gap-4 p-10">
        {/* Browser icon */}
        <img src={browser.icon} className="size-20 shrink-0 mx-auto" />

        {/* Browser name */}
        <h1 className="grow min-w-0 font-boldonse text-xl text-center">{browser.name}</h1>

        {/* Search */}
        <input
          type="search"
          className={cn('p-4 bg-neutral-800 rounded-full', 'w-full max-w-md mx-auto')}
          placeholder="Search profile"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredProfiles.length > 0 ? (
          <>
            <p className="text-center text-sm">
              Hold <kbd className="p-1 bg-neutral-800 rounded-full font-bold">Ctrl</kbd> to launch
              profile
            </p>
            <div className="grid grid-cols-4 gap-4 w-full mx-auto place-content-center">
              {filteredProfiles.map((profile, index) => (
                <button
                  onClick={(ev: MouseEvent<HTMLButtonElement>) => {
                    if (ev.ctrlKey) {
                      app.launchProfile(profile['directory'])
                    } else {
                      app.setProfile(profile)
                    }
                  }}
                  key={index}
                  className={cn(
                    'p-6 flex flex-col items-center justify-center',
                    'text-center gap-4 rounded-3xl cursor-pointer',
                    'bg-neutral-800 hover:bg-neutral-700'
                  )}
                >
                  {profile.picture ? (
                    <img
                      src={`file://${profile.picture}`}
                      className="size-16 shrink-0 rounded-full"
                      loading="lazy"
                    />
                  ) : (
                    <ProfileAvatar profile={profile} className="size-16 shrink-0 rounded-full" />
                  )}
                  <div className="flex flex-col px-2 w-full">
                    <span className="font-bold truncate">{profile['name']}</span>
                    {profile['gaia_name'] ? (
                      <span className="truncate">{profile['gaia_name']}</span>
                    ) : null}
                    {profile['user_name'] ? (
                      <span className="truncate text-neutral-400">{profile['user_name']}</span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center">No profile to display!</p>
        )}
      </div>
    </>
  )
}

export { BrowserProfiles }
