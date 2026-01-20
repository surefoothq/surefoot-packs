import { BrowserKey, BrowserProfile } from 'src/types'
import { UseQueryResult, useQuery } from '@tanstack/react-query'

const useProfilesQuery = (browser: BrowserKey): UseQueryResult<BrowserProfile[]> =>
  useQuery({
    queryKey: ['get-browsers', browser],
    queryFn: () => window.electron.ipcRenderer.invoke('get-profiles', browser)
  })

export { useProfilesQuery }
