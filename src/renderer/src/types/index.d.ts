import { Accessor } from 'solid-js'
import { SetStoreFunction } from 'solid-js/store'

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
}

export interface BrowserProfileStore {
  tabs: Tab[]
  isDesktop: boolean
  showAside: boolean
  ready: boolean
}

export interface BrowserProfileContextType {
  profile: Accessor<Profile>
  store: BrowserProfileStore
  setStore: SetStoreFunction<BrowserProfileStore>
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
}
