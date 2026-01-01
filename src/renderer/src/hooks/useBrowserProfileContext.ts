import { BrowserProfileContext } from '@renderer/contexts/BrowserProfileContext'
import { BrowserProfileContextType } from '@renderer/types'
import { useContext } from 'solid-js'

const useBrowserProfileContext = (): BrowserProfileContextType => {
  return useContext(BrowserProfileContext)!
}
export { useBrowserProfileContext }
