import { ProfileExtension } from 'src/types'
import { UseQueryResult, useQuery } from '@tanstack/react-query'

const useExtensionsQuery = (profileDir: string): UseQueryResult<ProfileExtension[]> =>
  useQuery({
    queryKey: ['get-extensions', profileDir],
    queryFn: () => window.electron.ipcRenderer.invoke('get-extensions', profileDir)
  })

export { useExtensionsQuery }
