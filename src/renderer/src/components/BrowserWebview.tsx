import {} from 'solid-icons/hi'
import {} from './Input'
import {} from './WebviewButton'
import { Component, createEffect, onCleanup, onMount } from 'solid-js'
import { Tab } from '@renderer/types'
import { cn } from '@renderer/lib/utils'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'

interface BrowserWebviewProps {
  tab: Tab
  ref?: (ref: Electron.WebviewTag) => void
  class?: string
}

const BrowserWebview: Component<BrowserWebviewProps> = (props) => {
  /** Webview Ref */
  let webviewRef!: Electron.WebviewTag

  /* Get Context */
  const context = useBrowserProfileContext()

  /* Get Webview */
  const getWebview = (): Electron.WebviewTag => webviewRef

  /** Tab Ready */
  const tabReady = (): void => {
    const webview = getWebview()
    const webContentsId = webview.getWebContentsId()
    /* Debug */
    console.log('Webview DOM Ready:', { tabId: props.tab.id, webContentsId })

    /* Remove Listener */
    webview.removeEventListener('dom-ready', tabReady)

    /* Update Web Contents ID in Context */
    context.updateWebContentsId(props.tab.id, webContentsId)
  }

  /** Listen for Window Close */
  const closeTab = (): void => {
    context.closeTab(props.tab.id)
  }

  /** Handle Page Title */
  const handlePageTitle = (ev: Electron.PageTitleUpdatedEvent): void => {
    context.updateTitle(props.tab.id, ev.title)
  }

  /** Handle Favicons */
  const handleFavicons = (ev: Electron.PageFaviconUpdatedEvent): void => {
    const img = new Image()

    img.onload = () => context.updateIcon(props.tab.id, img.src)
    img.onerror = () => context.updateIcon(props.tab.id)
    img.src = ev.favicons[0]
  }

  /** Set Webview Ref */
  const setWebviewRef = (ref: Electron.WebviewTag): void => {
    webviewRef = ref
    props.ref?.(webviewRef)
  }

  /** On Mount */
  onMount(() => {
    /* Get Webview */
    const webview = getWebview()

    /** DOM Ready */
    webview.addEventListener('dom-ready', tabReady)
  })

  /** Handle Window Close */
  createEffect(() => {
    const webview = getWebview()

    /** Listen For Close */
    webview.addEventListener('close', closeTab)

    /* Cleanup */
    onCleanup(() => webview.removeEventListener('close', closeTab))
  })

  /** Favicon and Title */
  createEffect(() => {
    const webview = getWebview()

    /** Update Title */
    webview.addEventListener('page-title-updated', handlePageTitle)

    /** Update Icon */
    webview.addEventListener('page-favicon-updated', handleFavicons)

    onCleanup(() => {
      /** Remove Handler for Update Title */
      webview.removeEventListener('page-title-updated', handlePageTitle)

      /** Remove Handler for Update Icon */
      webview.removeEventListener('page-favicon-updated', handleFavicons)
    })
  })

  return (
    <webview
      src={props.tab.initialUrl}
      allowpopups={true}
      class={cn('grow', props.class)}
      partition={`persist:profile-${context.profile().id}`}
      ref={(webviewRef) => setWebviewRef(webviewRef as Electron.WebviewTag)}
    />
  )
}

export { BrowserWebview }
