import { ElectronChromeExtensions } from 'electron-chrome-extensions'
import { app, ipcMain, session, webContents } from 'electron'
import { buildChromeContextMenu } from 'electron-chrome-context-menu'
import { installChromeWebStore } from 'electron-chrome-web-store'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'

import App from './App'
import type { ProfileConfig } from './types'

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

  /* Constructor */
  constructor({ id, ctx }: { id: string; ctx: App }) {
    this.id = id
    this.ctx = ctx
    this.session = session.fromPartition(`persist:profile-${this.id}`)

    /* Bind Methods */
    this.configureWebContents = this.configureWebContents.bind(this)
    this.handleCRXProtocol = this.handleCRXProtocol.bind(this)
    this.setActiveTab = this.setActiveTab.bind(this)
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
        contents.hostWebContents.send('browser-message', {
          id: this.id,
          action: 'open-window',
          data
        })
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

      /* If WebView, add to extensions */
      if (contents.getType() === 'webview') {
        /* Add Tab to Extensions */
        this.extensions.addTab(contents, this.ctx.window!)
      }
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

  /** Set Active Tab */
  setActiveTab(_event: Electron.IpcMainEvent, webContentsId: number): void {
    const contents = webContents.fromId(webContentsId) as Electron.WebContents
    if (!contents.isDestroyed()) {
      this.extensions.selectTab(contents)
    }
  }

  /** Build IPC Event Name */
  event(channel: string): string {
    return `${channel}-${this.id}`
  }

  /** Register IPC Listeners */
  registerIPCListeners(): void {
    ipcMain.on(this.event('tab-active'), this.setActiveTab)
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

  /** Setup Extensions */
  setupExtensions(): void {
    this.extensions = new ElectronChromeExtensions({
      license: 'GPL-3.0',
      session: this.session,
      /* Create Tab  */
      createTab: async (details) => {
        const tab = await this.createTab(details)
        return [tab, this.ctx.window!]
      },

      /* Create Window  */
      createWindow: async (details) => {
        console.log('==========================================')
        console.log('Creating window for extension with details:', details)
        console.log('==========================================')
        if (!details.tabId) {
          const urls = Array.isArray(details.url) ? details.url : [details.url || '']
          await Promise.all(urls.map((url) => this.createTab({ url })))
        }
        return this.ctx.window!
      }
    })
  }

  /** Create Tab */
  createTab(details: { url?: string }): Promise<Electron.WebContents> {
    return new Promise((resolve) => {
      /* Generate Tab ID */
      const tabId = crypto.randomUUID()

      /* Listener for Tab Ready */
      const tabReadyListener = (
        _ev: Electron.IpcMainEvent,
        args: { id: string; tabId: string; webContentsId: number }
      ): void => {
        if (args.id === this.id && args.tabId === tabId) {
          ipcMain.off('tab-ready-' + this.id, tabReadyListener)
          resolve(webContents.fromId(args.webContentsId)!)
        }
      }

      /* Listen for Tab Ready */
      ipcMain.on('tab-ready-' + this.id, tabReadyListener)

      /* Send Message to Create Tab */
      this.getHostWebContents().send('browser-message', {
        id: this.id,
        action: 'create-tab',
        data: {
          ...details,
          id: tabId
        }
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
