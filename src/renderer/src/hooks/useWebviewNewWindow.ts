import { Profile, Tab } from '@renderer/types'
import { Accessor, createEffect, onCleanup } from 'solid-js'

const useWebviewNewWindow = (profile: Accessor<Profile>, addTab: (tab: Tab) => void): void => {
  /** Handle New Window Open */
  createEffect(() => {
    /** Listen for Window Open */
    const listener = (
      _ev: Electron.CrossProcessExports.IpcRendererEvent,
      args: {
        id: string
        action: string
        data: Electron.HandlerDetails & Tab
      }
    ): void => {
      const { id, action, data } = args

      if (id === profile().id) {
        switch (action) {
          case 'create-tab':
            console.log('Creating new tab with data:', data)
            addTab(data)
            break
          case 'open-window':
            console.log('Opening new window with data:', data)
            addTab(data)
            break
        }
      }
    }

    /** Add Listener */
    const destroy = window.electron.ipcRenderer.on('browser-message', listener)

    /** Cleanup */
    onCleanup(destroy)
  })
}

export { useWebviewNewWindow }
