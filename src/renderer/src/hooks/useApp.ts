import { BrowserKey, BrowserProfile } from 'src/types'
import { useCallback, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useApp = () => {
  const [browserKey, setBrowserKey] = useState<BrowserKey | null>(null)
  const [profile, setProfile] = useState<BrowserProfile | null>(null)

  const launchProfile = useCallback(
    (profileDir: string): void => {
      window.electron.ipcRenderer.invoke('launch-profile', browserKey, profileDir)
    },
    [browserKey]
  )

  return {
    browserKey,
    setBrowserKey,
    profile,
    setProfile,
    launchProfile
  }
}

export { useApp }
