import { BrowserWindow, app, ipcMain, screen, session, shell } from 'electron'
import { Conf } from 'electron-conf/main'
import { ElectronChromeExtensions } from 'electron-chrome-extensions'
import { buildChromeContextMenu } from 'electron-chrome-context-menu'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { join } from 'path'
import { nativeTheme } from 'electron/main'

import icon from '../../resources/icon.png?asset'
import { Profile } from './Profile'
import { ProfileConfig } from './types'

/** Profile Map */
const profileMap = new Map<string, Profile>()

class App {
  window: BrowserWindow | null = null

  /* Constructor */
  constructor() {
    this.initialize()
  }

  handleCRXProtocol(): void {
    ElectronChromeExtensions.handleCRXProtocol(session.defaultSession)
  }

  /** Create Main Window */
  createWindow(): void {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    this.window = new BrowserWindow({
      width,
      height,
      show: false,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        webviewTag: true,
        webSecurity: false
      }
    })

    /* Context Menu for WebContents */
    this.window.webContents.on('context-menu', (_e, params) => {
      const menu = buildChromeContextMenu({
        params,
        webContents: this.window!.webContents,
        openLink: (url) => {
          this.window!.webContents.loadURL(url)
        }
      })

      menu.popup()
    })

    this.window.on('ready-to-show', () => {
      this.window!.maximize()
    })

    this.window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.window.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.window.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // Clean up on window closed
    this.window.on('closed', () => {
      this.window = null
    })
  }

  /** Setup Profile */
  async setupProfile(_ev: Electron.IpcMainInvokeEvent, id: string): Promise<ProfileConfig> {
    if (!profileMap.has(id)) {
      profileMap.set(id, new Profile({ id, ctx: this }))
    }

    return profileMap.get(id)!.initialize()
  }

  /** Destroy Profile */
  async destroyProfile(_ev: Electron.IpcMainInvokeEvent, id: string): Promise<void> {
    // TODO: Optimize destroy profile
    return
    if (profileMap.has(id)) {
      profileMap.get(id)?.destroy()
      profileMap.delete(id)
    }
  }

  /** Register IPC Handlers */
  registerIpcHandlers(): void {
    // IPC test
    ipcMain.on('ping', () => console.log('pong'))
    ipcMain.handle('setup-profile', this.setupProfile.bind(this))
    ipcMain.handle('destroy-profile', this.destroyProfile.bind(this))
  }

  setupConfig(): void {
    new Conf().registerRendererListener()
  }

  setTheme(): void {
    nativeTheme.themeSource = 'dark'
  }

  /** Initialize Application */
  initialize(): void {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.whenReady().then(() => {
      // Set app user model id for windows
      electronApp.setAppUserModelId('com.electron')

      // Default open or close DevTools by F12 in development
      // and ignore CommandOrControl + R in production.
      // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
      })

      this.setupConfig()
      this.registerIpcHandlers()
      this.handleCRXProtocol()
      this.setTheme()
      this.createWindow()

      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) this.createWindow()
      })
    })

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    // In this file you can include the rest of your app's specific main process
    // code. You can also put them in separate files and require them here.
  }
}

export default App
