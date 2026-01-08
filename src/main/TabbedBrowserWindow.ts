import { Profile } from './Profile'
import { Tabs } from './Tabs'
import { VirtualWindow } from './VirtualWindow'
import { WindowType } from './types'

class TabbedBrowserWindow {
  profile: Profile
  window: Electron.BaseWindow
  tabs: Tabs
  type: WindowType = 'normal'

  constructor(profile: Profile, type: WindowType = 'normal') {
    this.profile = profile
    this.type = type
    this.window = new VirtualWindow(this.profile.ctx.window!) as unknown as Electron.BaseWindow
    this.tabs = new Tabs(this)
  }

  destroy(): void {
    this.window.destroy()
  }

  isDestroyed(): boolean {
    return this.window.isDestroyed()
  }
}

export { TabbedBrowserWindow }
