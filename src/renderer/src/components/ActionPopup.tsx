import {} from './BrowserWebview'

import { Component, onMount } from 'solid-js'
import { Dialog } from '@kobalte/core'
import { cn } from '@renderer/lib/utils'
import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'

import BrowserIcon from '../assets/images/browser.png'

const ActionPopup: Component = () => {
  const context = useBrowserProfileContext()
  const action = context.store.action!

  let webview!: Electron.WebviewTag

  onMount(() => {
    webview.addEventListener('dom-ready', () => {
      webview.setZoomFactor(0.9)
    })
  })

  return (
    <Dialog.Root
      open
      modal={false}
      preventScroll={false}
      onOpenChange={() => context.sendIpc('close-action-popup')}
    >
      <Dialog.Overlay class="absolute inset-0 bg-black/50 z-10" />
      <Dialog.Content
        class={cn(
          'absolute bottom-0 z-20',
          'flex flex-col',
          'h-11/12 w-full rounded-t-xl overflow-clip',
          'bg-slate-800'
        )}
      >
        <div class="shrink-0 p-2 flex justify-center items-center gap-2">
          <img src={BrowserIcon} alt="icon" class="size-6 rounded-full" />
          <Dialog.Title class="font-bold">{action.extension.name}</Dialog.Title>
          <Dialog.Description class="sr-only">{action.extension.name}</Dialog.Description>
        </div>

        <webview
          src={action.url}
          allowpopups={true}
          class={cn('grow')}
          partition={`persist:profile-${context.profile().id}`}
          ref={(ref) => (webview = ref as Electron.WebviewTag)}
        />
      </Dialog.Content>
    </Dialog.Root>
  )
}

export { ActionPopup }
