import {} from '@renderer/hooks/useBrowserProfileContext'

import isUrl from 'is-url'
import normalizeUrl from 'normalize-url'
import { Component } from 'solid-js'
import { HiOutlineArrowLeft, HiOutlineArrowRight } from 'solid-icons/hi'
import { HiOutlineArrowPath, HiOutlineXMark } from 'solid-icons/hi'
import { Tab } from '@renderer/types'
import { onMount } from 'solid-js'
import { useWebviewControls } from '@renderer/hooks/useWebviewControls'

import { Input } from './Input'
import { WebviewButton } from './WebviewButton'

interface BrowserTabControlsProps {
  tab: Tab
  getWebview: () => Electron.WebviewTag
}

const BrowserTabControls: Component<BrowserTabControlsProps> = (props) => {
  /** Address Bar */
  let addressBarRef!: HTMLInputElement

  /* Get Webview */
  const getWebview = (): Electron.WebviewTag => props.getWebview()

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

  /** On Mount */
  onMount(() => {
    const webview = getWebview()

    /** Did Navigate */
    webview.addEventListener('did-navigate', (ev) => {
      addressBarRef.value = ev.url
    })

    /** Navigate in Page */
    webview.addEventListener('did-navigate-in-page', (ev) => {
      addressBarRef.value = ev.url
    })
  })

  return (
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
  )
}

export { BrowserTabControls }
