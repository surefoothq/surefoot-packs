import { BrowserList } from 'src/types'
import { UseQueryResult, useQuery } from '@tanstack/react-query'

const useBrowsersQuery = (): UseQueryResult<BrowserList> =>
  useQuery({
    queryKey: ['get-browsers'],
    queryFn: () => window.electron.ipcRenderer.invoke('get-browsers')
  })

export { useBrowsersQuery }
