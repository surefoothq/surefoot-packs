import { uuid } from '@renderer/lib/utils'
import { BrowserProfileContextType, BrowserProfileStore, Profile, Tab } from '@renderer/types'
import { Accessor, batch, onCleanup, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'
import { useWebviewNewWindow } from './useWebviewNewWindow'

/** Get new tab */
const getNewTab = (): Tab => ({
  id: uuid(),
  active: true,
  title: 'New Tab',
  url: import.meta.env.VITE_DEFAULT_WEBVIEW_URL
})

const useBrowserProfile = (profile: Accessor<Profile>): BrowserProfileContextType => {
  /* Container Ref */
  let containerRef: HTMLElement | null = null

  /* Store */
  const [store, setStore] = createStore<BrowserProfileStore>({
    ready: false,
    showAside: false,
    isDesktop: false,
    tabs: [getNewTab()]
  })

  /* Set Ready */
  const setReady = (ready: boolean): void => {
    setStore('ready', ready)
  }

  /* Add Tab */
  const addTab = (newTab?: Tab): void => {
    /* Add new active tab */
    batch(() => {
      setStore('tabs', { from: 0, to: store.tabs.length - 1 }, 'active', false)
      setStore('tabs', store.tabs.length, newTab || getNewTab())
    })
  }

  /* Set Active Tab */
  const setActiveTab = (tabId: string): void => {
    batch(() => {
      const index = store.tabs.findIndex((tab) => tab.id === tabId)
      setStore('tabs', { from: 0, to: store.tabs.length - 1 }, 'active', false)
      setStore('tabs', index, 'active', true)
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
  const updateIcon = (tabId: string, icon: string[]): void => {
    console.log('Updating icon for tab:', tabId, icon)
    updateTab(tabId, { icon: icon[0] })
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
    setStore,
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
    updateIcon
  }
}

export { useBrowserProfile }
