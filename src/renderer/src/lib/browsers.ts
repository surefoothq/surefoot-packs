import { BrowserKey } from 'src/types'

import BrowserBraveIcon from '../assets/images/browsers/brave.svg'
import BrowserChromiumLogo from '../assets/images/browsers/chromium.svg'
import BrowserGoogleChromeIcon from '../assets/images/browsers/chrome.svg'
import BrowserMicrosoftEdgeIcon from '../assets/images/browsers/edge.svg'

export const browsers: Record<BrowserKey, { name: string; icon: string }> = {
  'google-chrome': {
    name: 'Google Chrome',
    icon: BrowserGoogleChromeIcon
  },
  chromium: { name: 'Chromium', icon: BrowserChromiumLogo },
  brave: { name: 'Brave', icon: BrowserBraveIcon },
  edge: { name: 'Microsoft Edge', icon: BrowserMicrosoftEdgeIcon }
}
