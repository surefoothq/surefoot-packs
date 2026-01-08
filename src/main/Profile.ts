import {} from './VirtualWindow'

import { ElectronChromeExtensions } from 'electron-chrome-extensions'
import { app, ipcMain, session } from 'electron'
import { buildChromeContextMenu } from 'electron-chrome-context-menu'
import { installChromeWebStore } from 'electron-chrome-web-store'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'

import App from './App'
import type { ProfileConfig, WindowType } from './types'
import { TabbedBrowserWindow } from './TabbedBrowserWindow'

interface CreateWindowData extends Omit<chrome.windows.CreateData, 'type'> {
  type?: WindowType
}

const PATHS = {
  extension: join(__dirname, '../renderer')
}

class Profile {
  id: string
  ctx: App
  session: Electron.Session
  extensions!: ElectronChromeExtensions
  ready: boolean = false
  newTabExtension: Electron.Extension | null = null
  readyPromise: Promise<ProfileConfig> | null = null
  windows: TabbedBrowserWindow[] = []
  focusedWindow: TabbedBrowserWindow | null = null

  /* Constructor */
  constructor({ id, ctx }: { id: string; ctx: App }) {
    this.id = id
    this.ctx = ctx
    this.session = session.fromPartition(`persist:profile-${this.id}`)

    /* Bind Methods */
    this.configureWebContents = this.configureWebContents.bind(this)
    this.handleCRXProtocol = this.handleCRXProtocol.bind(this)
  }

  /** Get Host WebContents */
  getHostWebContents(): Electron.WebContents {
    return this.ctx.window!.webContents
  }

  /** Configure WebContents */
  configureWebContents(_event: Electron.Event, contents: Electron.WebContents): void {
    if (contents.session === this.session) {
      /* Function to open link in new window */
      const openLink = (data: { url: string }): void => {
        this.createWindow(data)
      }

      /* Context Menu for WebContents */
      contents.on('context-menu', (_e, params) => {
        const menu = buildChromeContextMenu({
          params,
          webContents: contents,
          openLink: (url) => openLink({ url })
        })

        menu.popup()
      })

      /* Override window handler */
      contents.setWindowOpenHandler((details) => {
        if (['default', 'foreground-tab', 'background-tab'].includes(details.disposition)) {
          if (contents.hostWebContents) {
            openLink(details)
          } else {
            console.warn('No hostWebContents to send browser-message')
          }
          return { action: 'deny' }
        } else {
          return {
            action: 'allow',
            overrideBrowserWindowOptions: {
              autoHideMenuBar: true
            }
          }
        }
      })
    }
  }

  /** Handle CRX Protocol */
  handleCRXProtocol(): void {
    ElectronChromeExtensions.handleCRXProtocol(this.session)
  }

  /** Configure User Agent */
  configureUserAgent(): void {
    const userAgent = this.session
      .getUserAgent()
      .replace(/\sElectron\/\S+/, '')
      .replace(new RegExp(`\\s${app.getName()}/\\S+`), '')
    this.session.setUserAgent(userAgent)
  }

  /** Initialize Profile */
  async initialize(): Promise<ProfileConfig> {
    if (!this.readyPromise) {
      this.readyPromise = this.setup()
    }
    return this.readyPromise
  }

  /** Setup Profile */
  async setup(): Promise<ProfileConfig> {
    console.log(`Initializing profile: ${this.id}`)

    /* Configure WebContents */
    app.on('web-contents-created', this.configureWebContents)

    /* Register IPC Listeners */
    this.registerIPCListeners()

    /* Handle CRX Protocol */
    this.handleCRXProtocol()

    /* Setup extensions */
    this.setupExtensions()

    /* Install Chrome Web Store */
    await installChromeWebStore({
      session: this.session,
      allowUnpackedExtensions: true
    })

    /* Load New Tab Page */
    await this.loadNewTabPage()

    /* Start Service Workers */
    await this.startServiceWorkers()

    return {
      newTabURL: this.getNewTabURL()
    }
  }

  /** Create Initial Window */
  createInitialWindow(): Promise<TabbedBrowserWindow> {
    return this.createWindow({ url: this.getNewTabURL(), type: 'normal' })
  }

  /** Create Window */
  async createWindow(details: CreateWindowData): Promise<TabbedBrowserWindow> {
    const window = new TabbedBrowserWindow(this, details.type)
    this.windows.push(window)
    this.focusedWindow = window

    /* Set URL(s) */
    details.url = details.url || this.getNewTabURL()

    /* Create Tabs */
    const urls = Array.isArray(details.url) ? details.url : [details.url || '']
    const tabs = await Promise.all(urls.map((url) => window.tabs.create({ url })))

    /* Add Tabs to Extensions */
    if (window.type === 'normal') {
      tabs.forEach((tab) => this.extensions.addTab(tab, window.window))
      this.extensions.selectTab(tabs[0])
    }

    /* Select First Tab */
    if (window.type !== 'action') {
      window.tabs.select(tabs[0])
    }

    return window
  }

  /** Build IPC Channel Name */
  ipcChannel(channel: string): string {
    return `${channel}-${this.id}`
  }

  /** Handle Create Window */
  async handleCreateWindow(
    _event: Electron.IpcMainEvent,
    details: chrome.windows.CreateData
  ): Promise<void> {
    await this.createWindow(details)
  }

  async handleCreateTab(
    _event: Electron.IpcMainEvent,
    details: chrome.tabs.CreateProperties
  ): Promise<void> {
    if (this.focusedWindow) {
      const window = this.focusedWindow
      const tab = await window.tabs.create(details)
      this.extensions.addTab(tab, window.window)
      this.extensions.selectTab(tab)
    } else {
      await this.createInitialWindow()
    }
  }

  /** Handle Select Tab */
  handleSelectTab(_event: Electron.IpcMainEvent, id: number): void {
    const window = this.getWindowFromTabId(id)
    if (window) {
      const tab = window.tabs.getById(id)
      if (tab) {
        this.focusedWindow = window
        if (window.type === 'normal') {
          this.extensions.selectTab(tab)
        }
        window.tabs.select(tab)
      }
    }
  }

  /** Handle Remove Tab */
  handleRemoveTab(_event: Electron.IpcMainEvent, id: number): void {
    const window = this.getWindowFromTabId(id)
    if (window) {
      const tab = window.tabs.getById(id)
      if (tab) {
        this.extensions.removeTab(tab)
        window.tabs.remove(tab)

        if (window.tabs.getAll().length === 0) {
          this.removeWindow(window)
        }
      }
    }
  }

  /** Register IPC Listeners */
  registerIPCListeners(): void {
    // Register other IPC listeners as needed
    ipcMain.on(this.ipcChannel('create-window'), this.handleCreateWindow.bind(this))
    ipcMain.on(this.ipcChannel('create-tab'), this.handleCreateTab.bind(this))
    ipcMain.on(this.ipcChannel('select-tab'), this.handleSelectTab.bind(this))
    ipcMain.on(this.ipcChannel('remove-tab'), this.handleRemoveTab.bind(this))
  }

  /** Load New Tab Page */
  async loadNewTabPage(): Promise<void> {
    if (!is.dev || !process.env['ELECTRON_RENDERER_URL']) {
      this.newTabExtension = await this.session.extensions.loadExtension(PATHS.extension, {
        allowFileAccess: true
      })
    }
  }

  /** Get New Tab URL */
  getNewTabURL(): string {
    /* Check if New Tab Extension is loaded */
    if (this.newTabExtension) {
      const manifest = this.newTabExtension.manifest
      const newTabPath = manifest.chrome_url_overrides?.newtab
      if (newTabPath) {
        return new URL(newTabPath, this.newTabExtension.url).toString()
      }
    }

    /* Fallback for Development */
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      return new URL('/new-tab.html', process.env['ELECTRON_RENDERER_URL']).toString()
    }

    /* Default New Tab URL */
    return import.meta.env.VITE_DEFAULT_WEBVIEW_URL
  }

  getWindowFromBaseWindow(baseWindow: Electron.BaseWindow): TabbedBrowserWindow | null {
    return this.windows.find((win) => win.window.id === baseWindow.id) || null
  }

  getWindowFromWebContents(contents: Electron.WebContents): TabbedBrowserWindow | null {
    return this.windows.find((win) => win.tabs.get(contents)) || null
  }

  getWindowFromTabId(tabId: number): TabbedBrowserWindow | null {
    return this.windows.find((win) => win.tabs.getById(tabId)) || null
  }

  getFocusedWindow(): TabbedBrowserWindow | null {
    return this.focusedWindow
  }

  /** Setup Extensions */
  setupExtensions(): void {
    this.extensions = new ElectronChromeExtensions({
      license: 'GPL-3.0',
      session: this.session,

      /* Create Tab  */
      createTab: async (details) => {
        const window = this.getFocusedWindow()!
        const tab = await window.tabs.create(details)
        return [tab, window.window]
      },

      /* Create Window  */
      createWindow: async (details) => {
        const window = await this.createWindow(details)
        return window.window
      },

      /* Remove Tab  */
      removeTab: (tab: Electron.WebContents): void => {
        const window = this.getWindowFromWebContents(tab)
        if (window) {
          window.tabs.remove(tab)
        }
      },

      /* Remove Window  */
      removeWindow: (window) => {
        const tabbedWindow = this.getWindowFromBaseWindow(window)
        if (tabbedWindow) {
          this.removeWindow(tabbedWindow)
        }
      },

      /* Select Tab  */
      selectTab: (tab) => {
        const window = this.getWindowFromWebContents(tab)
        if (window) {
          this.focusedWindow = window
          window.tabs.select(tab)
        }
      },

      /* Assign Tab Details  */
      assignTabDetails: (details, tab) => {
        const window = this.getWindowFromWebContents(tab)
        if (window) {
          window.tabs.update(tab, details)
        }
      },

      /* Open Popup  */
      openPopup: async (_extensionId, url): Promise<TabbedBrowserWindow> => {
        return await this.createWindow({ url, type: 'action' })
      },

      /* Close Popup  */
      closePopup: async (_extensionId, window: TabbedBrowserWindow) => {
        await this.removeWindow(window)
      }
    })
  }

  async removeWindow(window: TabbedBrowserWindow): Promise<void> {
    window.tabs.getAll().forEach((tab) => {
      this.extensions.removeTab(tab)
    })
    window.destroy()

    this.windows = this.windows.filter((win) => win !== window)
    this.sendMessageToHost('remove-window', { id: window.window.id })

    if (this.focusedWindow === window) {
      this.focusedWindow = this.windows.length > 0 ? this.windows[0] : null

      if (this.focusedWindow) {
        const tab = this.focusedWindow.tabs.getAll()[0]
        if (tab) {
          if (this.focusedWindow.type === 'normal') {
            this.extensions.selectTab(tab)
          }
          this.focusedWindow.tabs.select(tab)
        }
      }
    }
  }

  /** Send Message to Host */
  sendMessageToHost(action: string, data?: unknown): void {
    this.getHostWebContents().send(this.ipcChannel('browser-message'), {
      id: this.id,
      action,
      data
    })
  }

  /** Invoke Action on Host */
  invokeHost<T>(action: string, data?: unknown): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const channel = this.ipcChannel(`host-reply-${crypto.randomUUID()}`)

      ipcMain.once(channel, (_event, response: { error?: string; result?: T }) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response.result as T)
        }
      })

      this.getHostWebContents().send(this.ipcChannel('browser-invoke'), {
        id: this.id,
        action,
        data,
        channel
      })
    })
  }

  /** Start Service Workers */
  async startServiceWorkers(): Promise<void> {
    await Promise.all(
      this.session.extensions.getAllExtensions().map(async (extension) => {
        const manifest = extension.manifest
        if (manifest.manifest_version === 3 && manifest?.background?.service_worker) {
          await this.session.serviceWorkers.startWorkerForScope(extension.url).catch((error) => {
            console.error(error)
          })
        }
      })
    )
  }

  /** Destroy Profile */
  destroy(): void {
    console.log(`Destroying profile: ${this.id}`)
    app.off('web-contents-created', this.configureWebContents)
  }
}

export { Profile }
