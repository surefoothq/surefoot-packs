import { ipcMain, webContents } from 'electron'

import { Profile } from './Profile'
import { TabbedBrowserWindow } from './TabbedBrowserWindow'

class Tabs {
  window: TabbedBrowserWindow
  profile: Profile
  list: Electron.WebContents[] = []
  selected: Electron.WebContents | null = null

  constructor(window: TabbedBrowserWindow) {
    this.window = window
    this.profile = window.profile
  }

  get(contents: Electron.WebContents): Electron.WebContents | null {
    return this.list.find((tab) => tab.id === contents.id) || null
  }

  getById(id: number): Electron.WebContents | null {
    return this.list.find((tab) => tab.id === id) || null
  }

  /** Create Tab from Host */
  createFromHost(details: chrome.tabs.CreateProperties): Promise<Electron.WebContents> {
    return new Promise((resolve) => {
      /* Generate Tab ID */
      const id = crypto.randomUUID()

      /* Listener for Tab Ready */
      const tabReadyListener = (
        _ev: Electron.IpcMainEvent,
        args: { webContentsId: number }
      ): void => {
        resolve(webContents.fromId(args.webContentsId)!)
      }

      /* Listen for Tab Ready */
      ipcMain.once(this.profile.ipcChannel('tab-ready-' + id), tabReadyListener)

      /* Send Message to Create Tab */
      this.profile.sendMessageToHost('create-tab', {
        ...details,
        windowType: this.window.type,
        windowId: this.window.window.id,
        id
      })
    })
  }

  /** Create */
  async create(details: chrome.tabs.CreateProperties): Promise<Electron.WebContents> {
    const tab = await this.createFromHost(details)
    this.list.push(tab)
    this.selected = tab

    return tab
  }

  /** Select */
  select(contents: Electron.WebContents): void {
    const tab = this.get(contents)
    if (tab) {
      this.selected = tab
      this.profile.sendMessageToHost('select-tab', { id: tab.id })
    }
  }

  /** Update */
  update(contents: Electron.WebContents, details: chrome.tabs.UpdateProperties): void {
    const tab = this.get(contents)
    if (tab) {
      this.profile.sendMessageToHost('update-tab', {
        id: tab.id,
        details
      })
    }
  }

  /** Remove */
  remove(contents: Electron.WebContents): void {
    const tab = this.get(contents)
    if (tab) {
      this.list = this.list.filter((t) => t.id !== contents.id)
      this.profile.sendMessageToHost('remove-tab', { id: tab.id })
    }
  }

  /** Get All Tabs */
  getAll(): Electron.WebContents[] {
    return this.list
  }
}

export { Tabs }
