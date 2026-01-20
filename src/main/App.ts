import { BrowserWindow, app, ipcMain, shell } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { join } from 'path'
import { nativeTheme } from 'electron/main'

import icon from '../../resources/icon.png?asset'
import { Browser, BrowserKey, BrowserProfile, ProfileExtension } from '../types'
import { Launcher } from './Launcher'

class App {
  window!: Electron.BrowserWindow
  launcher = new Launcher()

  constructor() {
    // Configure theme
    nativeTheme.themeSource = 'dark'

    // Initialize
    this.initialize()
  }

  createWindow(): void {
    // Create the browser window.
    this.window = new BrowserWindow({
      width: 900,
      height: 670,
      show: false,
      autoHideMenuBar: true,
      resizable: false,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        webSecurity: false
      }
    })

    this.window.on('ready-to-show', () => {
      this.window.show()
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
  }

  registerIpcHandlers(): void {
    ipcMain.on('ping', () => console.log('pong'))
    ipcMain.handle('get-browsers', this.getBrowsers)
    ipcMain.handle('get-profiles', this.getProfiles)
    ipcMain.handle('get-extensions', this.getExtensions)
    ipcMain.handle('launch-profile', this.launchProfile)
  }

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

      // IPC handlers
      this.registerIpcHandlers()

      // Create Window
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

  getBrowsers = (): Record<BrowserKey, Browser> => this.launcher.getBrowsers()
  getProfiles = (_event: Electron.IpcMainInvokeEvent, browser: BrowserKey): BrowserProfile[] =>
    this.launcher.getProfiles(browser)

  getExtensions = (_event: Electron.IpcMainInvokeEvent, profileDir: string): ProfileExtension[] =>
    this.launcher.getProfileExtensions(profileDir)

  launchProfile = (
    _event: Electron.IpcMainInvokeEvent,
    browser: BrowserKey,
    profileDir: string
  ): void => this.launcher.launchProfile(browser, profileDir)
}

export { App }
