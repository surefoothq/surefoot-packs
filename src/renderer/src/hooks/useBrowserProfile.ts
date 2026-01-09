import {} from '@renderer/lib/utils'

import { Accessor, batch, createEffect, createMemo, onCleanup, onMount } from 'solid-js'
import {
  BrowserActionPopup,
  BrowserProfileContextType,
  BrowserProfileStore,
  Profile,
  ProfileConfig,
  Tab,
  TabId
} from '@renderer/types'
import { createStore } from 'solid-js/store'

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
    tabs: [],
    action: null
  })

  /* Active Tab */
  const activeTab = createMemo(() => store.tabs.find((tab) => tab.isActive))

  /** Setup Profile */
  const setupProfile = (config: ProfileConfig): void => {
    batch(() => {
      setConfig(config)
      setReady(true)
      sendIpc('create-window', { url: config.newTabURL })
    })
  }

  /* Build IPC Channel Name */
  const ipcChannel = (channel: string): string => {
    return `${channel}-${profile().id}`
  }

  /* Send IPC */
  const sendIpc = (channel: string, ...args: unknown[]): void =>
    window.electron.ipcRenderer.send(ipcChannel(channel), ...args)

  /* Invoke IPC */
  const invokeIpc = (channel: string, ...args: unknown[]): Promise<unknown> =>
    window.electron.ipcRenderer.invoke(ipcChannel(channel), ...args)
  /* Set Ready */
  const setReady = (ready: boolean): void => {
    setStore('ready', ready)
  }

  /* Set Config */
  const setConfig = (config: Partial<ProfileConfig>): void => {
    setStore('config', config)
  }

  /* Set action popup */
  const setActionPopup = (details: BrowserActionPopup | null): void => {
    setStore('action', details)
  }

  /* Add Tab */
  const addTab = (newTab?: Tab): void => {
    /* Add new active tab */
    batch(() => {
      const url = newTab?.url || store.config.newTabURL || import.meta.env.VITE_DEFAULT_WEBVIEW_URL
      setStore('tabs', { from: 0, to: store.tabs.length - 1 }, 'isActive', false)
      setStore('tabs', store.tabs.length, {
        ...newTab,
        title: newTab?.title || 'New Tab',
        isActive: true,
        initialUrl: url,
        url: url
      })
    })
  }

  /* Set Active Tab */
  const setActiveTab = (tabId: TabId): void => {
    batch(() => {
      const index = store.tabs.findIndex((tab) => tab.id === tabId)
      const tab = store.tabs[index]

      if (tab) {
        /* Set Active */
        setStore('tabs', { from: 0, to: store.tabs.length - 1 }, 'isActive', false)
        setStore('tabs', index, 'isActive', true)
      }
    })
  }

  /* Close Tab */
  const closeTab = (tabId: TabId): void => {
    batch(() => {
      const index = store.tabs.findIndex((tab) => tab.id === tabId)
      const tab = store.tabs[index]

      if (tab) {
        /** If closed tab was active, set another tab as active */
        if (tab.isActive && store.tabs.length > 1) {
          const newActiveIndex = index === 0 ? 0 : index - 1
          setStore('tabs', newActiveIndex, 'isActive', true)
        }

        /** Remove Tab */
        setStore('tabs', (tabs) => tabs.filter((tab) => tab.id !== tabId))
      }
    })
  }

  /* Remove Window */
  const removeWindow = (windowId: number): void => {
    batch(() => {
      setStore('tabs', (tabs) => tabs.filter((tab) => tab.windowId !== windowId))
    })
  }

  /* Update Tab */
  const updateTab = (tabId: TabId, updates: Partial<Tab>): void => {
    const index = store.tabs.findIndex((tab) => tab.id === tabId)
    if (index !== -1) {
      setStore('tabs', index, updates)
    }
  }

  /* Update Title */
  const updateTitle = (tabId: TabId, title: string): void => {
    updateTab(tabId, { title })
  }

  /* Update Icon */
  const updateIcon = (tabId: TabId, icon?: string): void => {
    console.log('Updating icon for tab:', tabId, icon)
    updateTab(tabId, { faviconUrl: icon })
  }

  /* Update WebContents ID */
  const updateWebContentsId = (tabId: TabId, webContentsId: number): void => {
    /* Update Tab */
    updateTab(tabId, { id: webContentsId, webContentsId })

    /* Notify Main Process that Tab is Ready */
    sendIpc('tab-ready-' + tabId, {
      webContentsId: webContentsId
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

  /** Handle Messages */
  createEffect(() => {
    /** Listen for Messages */
    const listener = (
      _ev: Electron.CrossProcessExports.IpcRendererEvent,
      args: {
        action: string
        data: unknown
      }
    ): void => {
      const { action, data } = args

      switch (action) {
        /* Handle Create Tab */
        case 'create-tab': {
          addTab(data as Tab)
          break
        }

        /* Handle Select Tab */
        case 'select-tab': {
          const { id } = data as { id: string }
          setActiveTab(id)
          break
        }
        /* Handle Update Tab */
        case 'update-tab': {
          const { id, details } = data as {
            id: string
            details: chrome.tabs.UpdateProperties
          }
          updateTab(id, details)
          break
        }

        /* Handle Close Tab */
        case 'remove-tab': {
          const { id } = data as { id: string }
          closeTab(id)
          break
        }

        /* Remove window */
        case 'remove-window': {
          const { id } = data as { id: number }
          removeWindow(id)
          break
        }

        /* Open action popup */
        case 'open-action-popup': {
          setActionPopup(data as BrowserActionPopup)
          break
        }

        /* Close action popup */
        case 'close-action-popup': {
          setActionPopup(null)
          break
        }
      }
    }

    /** Add Listener */
    const destroy = window.electron.ipcRenderer.on(ipcChannel('browser-message'), listener)

    /** Cleanup */
    onCleanup(destroy)
  })

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
