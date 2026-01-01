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
          case 'open-window':
            console.log('Opening new window with data:', data)
            addTab({
              ...data,
              id: crypto.randomUUID(),
              active: true
            })
            break
        }
      }
    }

    /** Add Listener */
    window.electron.ipcRenderer.on('browser-message', listener)

    onCleanup(() => {
      /** Remove Listener */
      window.electron.ipcRenderer.removeListener('browser-message', listener)
    })
  })
}

export { useWebviewNewWindow }
