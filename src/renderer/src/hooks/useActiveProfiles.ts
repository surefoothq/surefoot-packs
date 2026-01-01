import { createMemo, Accessor } from 'solid-js'
import { store } from '../store'
import { Profile } from '../types'

const useActiveProfiles = (): Accessor<Profile[]> => {
  const activeProfiles = createMemo(() => store.profiles.filter((p) => p.active))
  return activeProfiles
}

export { useActiveProfiles }
