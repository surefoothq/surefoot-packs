import {} from '@kobalte/core'

import {} from './BrowserWebview'

import { Component, createMemo, onMount } from 'solid-js'
import { HiSolidXMark } from 'solid-icons/hi'
import { cn } from '@renderer/lib/utils'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'

import BrowserIcon from '../assets/images/browser.png'
import { WebviewButton } from './WebviewButton'

const ActionPopup: Component = () => {
  const context = useBrowserProfileContext()
  const action = context.store.action!

  let webview!: Electron.WebviewTag

  const icon = createMemo(() => {
    const extension = action.extension
    const selected = (extension.manifest['icons'] ?? {})[32]

    return selected
      ? `crx://extension-icon/${extension.id}/32/2?${new URLSearchParams({
          partition: context.partition()
        })}`
      : null
  })

  const closeAction = (): void => context.sendIpc('close-action-popup')

  onMount(() => {
    webview.addEventListener('destroyed', closeAction)
    webview.addEventListener('close', closeAction)
    webview.addEventListener('dom-ready', () => {
      webview.setZoomFactor(0.9)
    })
  })

  return (
    <>
      <div class="absolute inset-0 bg-black/50 z-10" onClick={() => closeAction()} />
      <div
        class={cn(
          'absolute bottom-0 z-20',
          'flex flex-col',
          'h-11/12 w-full rounded-t-xl overflow-clip',
          'bg-slate-800'
        )}
      >
        {/* Header */}
        <div class="shrink-0 p-2 flex items-center gap-2">
          <img src={icon() || BrowserIcon} alt="icon" class="size-6 shrink-0 rounded-full" />
          <h3 class="font-bold grow min-w-0 truncate text-center">{action.extension.name}</h3>
          <WebviewButton onClick={closeAction} class="size-8 p-0 shrink-0">
            <HiSolidXMark />
          </WebviewButton>
        </div>

        <webview
          src={action.url}
          allowpopups={true}
          class={cn('grow')}
          partition={context.partition()}
          ref={(ref) => (webview = ref as Electron.WebviewTag)}
        />
      </div>
    </>
  )
}

export { ActionPopup }
