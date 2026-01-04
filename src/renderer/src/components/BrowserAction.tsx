import './BrowserAction.css'

import { Component, Show, createEffect, createSignal, onMount } from 'solid-js'

const DEFAULT_PARTITION = '_self'

interface BrowserActionProps {
  id: string
  tab?: number
  partition?: string | null
  alignment?: string
}

interface ActionInfo {
  id: string
  title?: string
  text?: string
  color?: string
  iconModified?: string
  tabs?: Record<number, { title?: string; text?: string; color?: string; iconModified?: string }>
}

interface BrowserActionAPI {
  getAction: (extensionId: string) => ActionInfo | undefined
  getState: (partition: string) => Promise<{ activeTabId?: number; actions: ActionInfo[] }>
  activate: (
    partition: string,
    details: {
      eventType: string
      extensionId: string
      tabId: number
      anchorRect: { x: number; y: number; width: number; height: number }
      alignment?: string
    }
  ) => Promise<void>
  addEventListener: (name: string, listener: (state: unknown) => void) => void
  removeEventListener: (name: string, listener: (state: unknown) => void) => void
  addObserver: (partition: string) => void
  removeObserver: (partition: string) => void
}

// Access the global browserAction API exposed from preload
const getBrowserAction = (): BrowserActionAPI | undefined => {
  return (window as { browserAction?: BrowserActionAPI }).browserAction
}

export const BrowserAction: Component<BrowserActionProps> = (props) => {
  let buttonRef: HTMLButtonElement | undefined
  const [action, setAction] = createSignal<ActionInfo | null>(null)
  const [bgImage, setBgImage] = createSignal<string>('')
  const [hasIcon, setHasIcon] = createSignal(true)
  const [dataLetter, setDataLetter] = createSignal('')

  const tabId = (): number => props.tab ?? -1
  const partition = (): string => props.partition || DEFAULT_PARTITION

  const preloadIcon = (iconUrl: string, title: string): void => {
    const img = new Image()
    img.onerror = () => {
      setHasIcon(false)
      if (title) {
        setDataLetter(title.charAt(0))
      }
    }
    img.onload = () => {
      setHasIcon(true)
      setBgImage(`url(${iconUrl})`)
    }
    img.src = iconUrl
  }

  const updateIcon = (info: ActionInfo): void => {
    const iconSize = 32
    const resizeType = 2
    const searchParams = new URLSearchParams({
      tabId: `${tabId()}`,
      partition: `${partition()}`
    })
    if (info.iconModified) {
      searchParams.append('t', info.iconModified)
    }
    const iconUrl = `crx://extension-icon/${props.id}/${iconSize}/${resizeType}?${searchParams.toString()}`
    preloadIcon(iconUrl, info.title || '')
  }

  const update = (): void => {
    const browserAction = getBrowserAction()
    if (!browserAction) return

    const actionData = browserAction.getAction(props.id)
    if (!actionData) return

    const activeTabId = tabId()
    const tabInfo = activeTabId > -1 ? actionData.tabs?.[activeTabId] : {}
    const info = { ...tabInfo, ...actionData }

    setAction(info)
    updateIcon(info)
  }

  const activate = (event: MouseEvent): void => {
    if (!buttonRef) return

    const rect = buttonRef.getBoundingClientRect()
    const browserAction = getBrowserAction()

    if (browserAction) {
      void browserAction.activate(partition(), {
        eventType: event.type,
        extensionId: props.id,
        tabId: tabId(),
        alignment: props.alignment,
        anchorRect: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        }
      })
    }
  }

  const handleClick = (event: MouseEvent): void => {
    activate(event)
  }

  const handleContextMenu = (event: MouseEvent): void => {
    event.stopImmediatePropagation()
    event.preventDefault()
    activate(event)
  }

  onMount(() => {
    update()
  })

  createEffect(() => {
    // Re-run update when props change - track dependencies by reading them
    const id = props.id
    const tab = props.tab
    const partition = props.partition
    if (id || tab !== undefined || partition !== undefined) {
      update()
    }
  })

  return (
    <button
      ref={buttonRef}
      class="action"
      classList={{
        'no-icon': !hasIcon()
      }}
      style={{
        'background-image': bgImage()
      }}
      data-letter={dataLetter()}
      title={action()?.title || ''}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <Show when={action()?.text}>
        <div
          class="badge"
          style={{
            color: '#fff',
            'background-color': action()?.color || ''
          }}
        >
          {action()?.text}
        </div>
      </Show>
    </button>
  )
}

export default BrowserAction
