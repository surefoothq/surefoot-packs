import { Accessor } from 'solid-js'
import { SetStoreFunction } from 'solid-js/store'

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'browser-action-list': { partition?: string; alignment?: string; tab?: string | number }
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

export type TabId = string | number

export interface BrowserActionPopup {
  extension: Electron.Extension
  url: string
}

export interface Tab extends chrome.tabs.Tab {
  id: TabId
  isActive: boolean
  title: string
  url: string
  initialUrl: string
  faviconUrl?: string
  webContentsId?: number
  windowType: 'normal' | 'popup' | 'panel' | 'action'
  windowId: number
}

export interface BrowserProfileStore {
  config: ProfileConfig
  action: BrowserActionPopup | null
  tabs: Tab[]
  isDesktop: boolean
  showAside: boolean
  ready: boolean
}

export interface BrowserProfileContextType {
  profile: Accessor<Profile>
  store: BrowserProfileStore
  activeTab: Accessor<Tab | undefined>
  setStore: SetStoreFunction<BrowserProfileStore>
  setConfig: (config: Partial<ProfileConfig>) => void
  setReady: (ready: boolean) => void
  getContainerRef: () => HTMLElement | null
  setContainerRef: (el: HTMLElement | null) => void
  toggleFullScreen: () => void
  toggleAside: () => void
  setActiveTab: (tabId: TabId) => void
  closeTab: (tabId: TabId) => void
  addTab: () => void
  updateTab: (tabId: TabId, updates: Partial<Tab>) => void
  updateTitle: (tabId: TabId, title: string) => void
  updateIcon: (tabId: TabId, icon?: string) => void
  updateWebContentsId: (tabId: TabId, webContentsId: number) => void
  sendIpc: (channel: string, ...args: unknown[]) => void
  invokeIpc: (channel: string, ...args: unknown[]) => Promise<unknown>
}
