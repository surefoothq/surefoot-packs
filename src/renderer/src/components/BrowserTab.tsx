import {} from 'solid-icons/hi'

import {} from './Input'
import {} from './WebviewButton'

import { Component, Show, createEffect } from 'solid-js'
import { Tab } from '@renderer/types'

import { BrowserTabControls } from './BrowserTabControls'
import { BrowserWebview } from './BrowserWebview'
import { cn } from '../lib/utils'

interface BrowserTabProps {
  index: number
  tab: Tab
}

const BrowserTab: Component<BrowserTabProps> = (props) => {
  /** Webview Ref */
  let webviewRef!: Electron.WebviewTag

  /* Get Webview */
  const getWebview = (): Electron.WebviewTag => webviewRef

  /** Debug Render */
  createEffect(() => {
    console.log('Rendering BrowserTab:', {
      index: props.index,
      tab: props.tab,
      active: props.tab.isActive,
      selected: props.tab.isSelected,
      webContentsId: props.tab.webContentsId
    })
  })

  return (
    <div class={cn('grow flex flex-col shrink-0', 'divide-y dark:divide-slate-700')}>
      {/* Browser Tab Controls */}
      <Show when={props.tab.windowType === 'normal'}>
        <BrowserTabControls tab={props.tab} getWebview={getWebview} />
      </Show>

      {/* Webview */}
      <BrowserWebview tab={props.tab} ref={(webview) => (webviewRef = webview)} />
    </div>
  )
}

export { BrowserTab }
