import isUrl from 'is-url'
import normalizeUrl from 'normalize-url'
import { Component, createEffect, onCleanup, onMount } from 'solid-js'
import {
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlineArrowRight,
  HiOutlineXMark
} from 'solid-icons/hi'
import { Tab } from '@renderer/types'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'
import { useWebviewControls } from '@renderer/hooks/useWebviewControls'

import { Input } from './Input'
import { WebviewButton } from './WebviewButton'
import { cn } from '../lib/utils'

interface BrowserTabProps {
  index: number
  tab: Tab
}

const BrowserTab: Component<BrowserTabProps> = (props) => {
  /** Webview Ref */
  let webviewRef!: Electron.WebviewTag

  /** Address Bar */
  let addressBarRef!: HTMLInputElement

  /* Get Context */
  const context = useBrowserProfileContext()

  /* Get Webview */
  const getWebview = (): Electron.WebviewTag => webviewRef

  /* Webview Controls */
  const { isLoading, goBack, goForward, reload, stop, callWebviewMethod } =
    useWebviewControls(getWebview)

  /**
   * Handle Form Submit
   */
  const handleFormSubmit = (ev: SubmitEvent): void => {
    ev.preventDefault()
    ev.stopPropagation()

    /** Blur */
    addressBarRef.blur()

    /** Get Input */
    const input = addressBarRef.value
    const url = normalizeUrl(input)

    callWebviewMethod((webview) => {
      webview.loadURL(
        isUrl(url) ? url : `https://www.google.com/search?q=${encodeURIComponent(input)}`
      )
    })
  }

  /** Tab Ready */
  const tabReady = (): void => {
    const webview = webviewRef
    const webContentsId = webview.getWebContentsId()

    /* Debug */
    console.log('Webview DOM Ready:', { tabId: props.tab.id, webContentsId })

    /* Update Web Contents ID in Context */
    context.updateWebContentsId(props.tab.id, webContentsId)

    /* Remove Listener */
    webview.removeEventListener('dom-ready', tabReady)
  }

  /** On Mount */
  onMount(() => {
    const webview = webviewRef

    /** DOM Ready */
    webview.addEventListener('dom-ready', tabReady)

    /** Did Navigate */
    webview.addEventListener('did-navigate', (ev) => {
      addressBarRef.value = ev.url
    })

    /** Navigate in Page */
    webview.addEventListener('did-navigate-in-page', (ev) => {
      addressBarRef.value = ev.url
    })
  })

  /** Handle Tab Active */
  createEffect(() => {
    if (props.tab.active && props.tab.webContentsId) {
      context.sendIpc('tab-active', props.tab.webContentsId)
    }
  })

  /** Handle Window Close */
  createEffect(() => {
    const webview = webviewRef

    /** Listen for Window Close */
    const listener = (): void => {
      context.closeTab(props.tab.id)
    }

    /** Listen For Close */
    webview.addEventListener('close', listener)

    /* Cleanup */
    onCleanup(() => webview.removeEventListener('close', listener))
  })

  /** Favicon and Title */
  createEffect(() => {
    const webview = webviewRef

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

  createEffect(() => {
    console.log('Rendering BrowserTab:', {
      index: props.index,
      tab: props.tab,
      active: props.tab.active,
      webContentsId: props.tab.webContentsId
    })
  })

  return (
    <div class={cn('grow flex flex-col shrink-0', 'divide-y dark:divide-slate-700')}>
      <div class="p-2 flex gap-1 items-center">
        <div class="flex gap-1">
          {/* Back */}
          <WebviewButton onClick={() => goBack()} title="Go Back">
            <HiOutlineArrowLeft class="size-4" />
          </WebviewButton>

          {/* Forward */}
          <WebviewButton onClick={() => goForward()} title="Go Forward">
            <HiOutlineArrowRight class="size-4" />
          </WebviewButton>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleFormSubmit} class="w-full">
          <Input class="rounded-full p-2" placeholder="Enter URL" ref={addressBarRef} />
        </form>

        {/* Stop */}
        {isLoading() ? (
          <WebviewButton onClick={() => stop()} title="Stop">
            <HiOutlineXMark class="size-4" />
          </WebviewButton>
        ) : (
          <WebviewButton onClick={() => reload()} title="Refresh">
            <HiOutlineArrowPath class="size-4" />
          </WebviewButton>
        )}
      </div>

      {/* Webview */}
      <webview
        src={props.tab.url}
        allowpopups={true}
        class="grow bg-white"
        partition={`persist:profile-${context.profile().id}`}
        ref={webviewRef}
      />
    </div>
  )
}

export { BrowserTab }
