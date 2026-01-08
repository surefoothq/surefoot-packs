import {} from 'solid-icons/hi'

import {} from './Input'
import {} from './WebviewButton'

import { Component, ComponentProps, createEffect, onCleanup, onMount, splitProps } from 'solid-js'
import { Tab } from '@renderer/types'
import { cn } from '@renderer/lib/utils'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'

interface BrowserWebviewProps extends ComponentProps<'webview'> {
  tab: Tab
}

const BrowserWebview: Component<BrowserWebviewProps> = (props) => {
  /** Webview Ref */
  let webviewRef!: Electron.WebviewTag

  /* Get Context */
  const context = useBrowserProfileContext()

  /* Get Webview */
  const getWebview = (): Electron.WebviewTag => webviewRef

  const [local, others] = splitProps(props, ['tab'])

  /** Tab Ready */
  const tabReady = (): void => {
    const webview = getWebview()
    const webContentsId = webview.getWebContentsId()

    /* Debug */
    console.log('Webview DOM Ready:', { tabId: local.tab.id, webContentsId })

    /* Update Web Contents ID in Context */
    context.updateWebContentsId(local.tab.id, webContentsId)

    /* Remove Listener */
    webview.removeEventListener('dom-ready', tabReady)
  }

  /** Listen for Window Close */
  const closeTab = (): void => {
    context.closeTab(local.tab.id)
  }

  /** Handle Page Title */
  const handlePageTitle = (ev: Electron.PageTitleUpdatedEvent): void => {
    context.updateTitle(local.tab.id, ev.title)
  }

  /** Handle Favicons */
  const handleFavicons = (ev: Electron.PageFaviconUpdatedEvent): void => {
    const img = new Image()

    img.onload = () => context.updateIcon(local.tab.id, img.src)
    img.onerror = () => context.updateIcon(local.tab.id)
    img.src = ev.favicons[0]
  }

  /** On Mount */
  onMount(() => {
    const webview = getWebview()

    /** Pass Ref to Parent */
    props.ref && typeof props.ref === 'function' && props.ref(webview)

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
      {...others}
      allowpopups={true}
      class={cn('grow', props.class)}
      partition={`persist:profile-${context.profile().id}`}
      ref={webviewRef}
    />
  )
}

export { BrowserWebview }
