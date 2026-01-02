import { Accessor } from 'solid-js'
import { SetStoreFunction } from 'solid-js/store'

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'browser-action-list': { partition?: string; alignment?: string; tab?: string }
    }
  }
}

export interface ProfileConfig {
  newTabURL?: string
}

export interface Profile {
  id: string
  name: string
  active: boolean
}

export interface AppStore {
  profiles: Profile[]
  page: number
  rows: number
  columns: number
}

export interface Tab {
  id: string
  active: boolean
  title: string
  url: string
  icon?: string
  webContentsId?: number
}

export interface BrowserProfileStore {
  config: ProfileConfig
  tabs: Tab[]
  isDesktop: boolean
  showAside: boolean
  ready: boolean
}

export interface BrowserProfileContextType {
  profile: Accessor<Profile>
  store: BrowserProfileStore
  setStore: SetStoreFunction<BrowserProfileStore>
  setConfig: (config: Partial<ProfileConfig>) => void
  setReady: (ready: boolean) => void
  getContainerRef: () => HTMLElement | null
  setContainerRef: (el: HTMLElement | null) => void
  toggleFullScreen: () => void
  toggleAside: () => void
  setActiveTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  addTab: () => void
  updateTab: (tabId: string, updates: Partial<Tab>) => void
  updateTitle: (tabId: string, title: string) => void
  updateIcon: (tabId: string, icon: string[]) => void
  updateWebContentsId: (tabId: string, webContentsId: number) => void
}
