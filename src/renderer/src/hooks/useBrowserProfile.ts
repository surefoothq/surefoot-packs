import { Accessor, batch, createEffect, createMemo, onCleanup, onMount } from 'solid-js'
import {
  BrowserProfileContextType,
  BrowserProfileStore,
  Profile,
  ProfileConfig,
  Tab
} from '@renderer/types'
import { createStore } from 'solid-js/store'
import { uuid } from '@renderer/lib/utils'

import { useWebviewNewWindow } from './useWebviewNewWindow'

const useBrowserProfile = (profile: Accessor<Profile>): BrowserProfileContextType => {
  /* Container Ref */
  let containerRef: HTMLElement | null = null

  /* Store */
  const [store, setStore] = createStore<BrowserProfileStore>({
    config: {
      newTabURL: import.meta.env.VITE_DEFAULT_WEBVIEW_URL
    },
    ready: false,
    showAside: false,
    isDesktop: false,
    tabs: []
  })

  const activeTab = createMemo(() => store.tabs.find((tab) => tab.active))

  /** Setup Profile */
  const setupProfile = (config: ProfileConfig): void => {
    batch(() => {
      setConfig(config)
      setReady(true)
      addTab()
    })
  }

  /* Send IPC */
  const sendIpc = (channel: string, ...args: unknown[]): void =>
    window.electron.ipcRenderer.send(`${channel}-${profile().id}`, ...args)

  const invokeIpc = (channel: string, ...args: unknown[]): Promise<unknown> =>
    window.electron.ipcRenderer.invoke(`${channel}-${profile().id}`, ...args)

  /* Set Ready */
  const setReady = (ready: boolean): void => {
    setStore('ready', ready)
  }

  /* Set Config */
  const setConfig = (config: Partial<ProfileConfig>): void => {
    setStore('config', config)
  }

  /* Add Tab */
  const addTab = (newTab?: Tab): void => {
    /* Add new active tab */
    batch(() => {
      setStore('tabs', { from: 0, to: store.tabs.length - 1 }, 'active', false)
      setStore('tabs', store.tabs.length, {
        ...newTab,
        type: newTab?.type || 'normal',
        title: newTab?.title || 'New Tab',
        url: newTab?.url || store.config.newTabURL || import.meta.env.VITE_DEFAULT_WEBVIEW_URL,
        id: newTab?.id || uuid(),
        active: true
      })
    })
  }

  /* Set Active Tab */
  const setActiveTab = (tabId: string): void => {
    batch(() => {
      const index = store.tabs.findIndex((tab) => tab.id === tabId)
      setStore('tabs', { from: 0, to: store.tabs.length - 1 }, 'active', false)
      setStore('tabs', index, 'active', true)

      const tab = store.tabs[index]
      if (tab) {
        console.log('Set active tab:', tab)
      }
    })
  }

  /* Close Tab */
  const closeTab = (tabId: string): void => {
    batch(() => {
      const index = store.tabs.findIndex((tab) => tab.id === tabId)
      const isActive = store.tabs[index]?.active

      /** If closed tab was active, set another tab as active */
      if (isActive && store.tabs.length > 1) {
        const newActiveIndex = index === 0 ? 0 : index - 1
        setStore('tabs', newActiveIndex, 'active', true)
      }

      /** Remove Tab */
      setStore('tabs', (tabs) => tabs.filter((tab) => tab.id !== tabId))
    })
  }

  /* Update Tab */
  const updateTab = (tabId: string, updates: Partial<Tab>): void => {
    const index = store.tabs.findIndex((tab) => tab.id === tabId)
    if (index !== -1) {
      setStore('tabs', index, updates)
    }
  }

  /* Update Title */
  const updateTitle = (tabId: string, title: string): void => {
    updateTab(tabId, { title })
  }

  /* Update Icon */
  const updateIcon = (tabId: string, icon?: string): void => {
    console.log('Updating icon for tab:', tabId, icon)
    updateTab(tabId, { icon })
  }

  /* Update WebContents ID */
  const updateWebContentsId = (tabId: string, webContentsId: number): void => {
    /* Update Tab */
    updateTab(tabId, { webContentsId })

    /* Get Tab */
    const tab = store.tabs.find((t) => t.id === tabId)

    /* Notify Main Process that Tab is Ready */
    sendIpc('tab-ready', {
      tabId: tabId,
      webContentsId: webContentsId,
      type: tab?.type || 'normal'
    })
  }

  /* Set Container Ref */
  const setContainerRef = (el: HTMLElement | null): void => {
    containerRef = el
  }

  /* Get Container Ref */
  const getContainerRef = (): HTMLElement | null => {
    return containerRef
  }

  /* Toggle Fullscreen */
  const toggleFullScreen = (): void => {
    if (!document.fullscreenElement) {
      if (containerRef) {
        containerRef.requestFullscreen()
      }
    } else if (document.fullscreenElement === containerRef) {
      document.exitFullscreen()
    }
  }

  /* Toggle Aside */
  const toggleAside = (): void => {
    setStore('showAside', (prev) => !prev)
  }

  /** Setup and Teardown */
  createEffect(() => {
    window.electron.ipcRenderer.invoke('setup-profile', profile().id).then(setupProfile)

    onCleanup(() => {
      window.electron.ipcRenderer.invoke('destroy-profile', profile().id)
    })
  })

  /* Monitor Fullscreen Changes */
  onMount(() => {
    const handleFullscreenChange = (): void =>
      setStore('isDesktop', document.fullscreenElement === containerRef)

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    onCleanup(() => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    })
  })

  /* Handle New Window from Webview */
  useWebviewNewWindow(profile, addTab)

  return {
    profile,
    store,
    activeTab,
    setStore,
    setConfig,
    setReady,
    getContainerRef,
    setContainerRef,
    toggleFullScreen,
    toggleAside,
    addTab,
    setActiveTab,
    closeTab,
    updateTab,
    updateTitle,
    updateIcon,
    updateWebContentsId,
    sendIpc,
    invokeIpc
  }
}

export { useBrowserProfile }
