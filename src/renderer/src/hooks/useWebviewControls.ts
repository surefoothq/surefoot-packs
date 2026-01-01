import { Accessor, createEffect, createSignal } from 'solid-js'

interface UseWebviewControlsReturn {
  isReady: () => boolean
  isLoading: () => boolean
  callWebviewMethod: (callback: (webview: Electron.WebviewTag) => void) => void
  goBack: () => void
  goForward: () => void
  stop: () => void
  reload: () => void
}

const useWebviewControls = (
  webviewRef: Accessor<Electron.WebviewTag>
): UseWebviewControlsReturn => {
  const [isReady, setIsReady] = createSignal(false)
  const [isLoading, setIsLoading] = createSignal(false)

  /** Call Webview Method */
  const callWebviewMethod = (callback: (webview: Electron.WebviewTag) => void): void => {
    const webview = webviewRef()
    if (webview && isReady()) {
      callback(webview)
    }
  }

  /** Go Back */
  const goBack = (): void => callWebviewMethod((webview) => webview.goBack())

  /** Go Forward */
  const goForward = (): void => callWebviewMethod((webview) => webview.goForward())

  /** Stop Webview */
  const stop = (): void => callWebviewMethod((webview) => webview.stop())

  /** Reload Webview */
  const reload = (): void => callWebviewMethod((webview) => webview.reload())

  /** Setup Webview */
  createEffect((): void => {
    const webview = webviewRef()
    if (webview) {
      /** DOM Ready */
      webview.addEventListener('dom-ready', () => {
        setIsReady(true)
      })

      /** Start Loading */
      webview.addEventListener('did-start-loading', () => {
        setIsLoading(true)
      })

      /** Stop Loading */
      webview.addEventListener('did-stop-loading', () => {
        setIsLoading(false)
      })
    }
  })

  return {
    isReady,
    isLoading,
    callWebviewMethod,
    goBack,
    goForward,
    stop,
    reload
  }
}

export { useWebviewControls }
