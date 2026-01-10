import { Component, For, createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'

import BrowserAction from './BrowserAction'

const DEFAULT_PARTITION = '_self'

interface BrowserActionListProps {
  tab?: number | null
  partition?: string | null
  alignment?: string
}

interface ActionState {
  activeTabId?: number
  actions: Array<{ id: string }>
}

interface BrowserActionAPI {
  getState: (partition: string) => Promise<ActionState>
  addEventListener: (name: string, listener: (state: ActionState) => void) => void
  removeEventListener: (name: string, listener: (state: ActionState) => void) => void
  addObserver: (partition: string) => void
  removeObserver: (partition: string) => void
}

// Access the global browserAction API exposed from preload
const getBrowserAction = (): BrowserActionAPI | undefined => {
  return (window as { browserAction?: BrowserActionAPI }).browserAction
}

export const BrowserActionList: Component<BrowserActionListProps> = (props) => {
  const [store, setStore] = createStore<ActionState>({
    actions: []
  })

  const [observing, setObserving] = createSignal(false)

  const partition = (): string => props.partition || DEFAULT_PARTITION
  const tabId = (): number => {
    const tab = props.tab
    return typeof tab === 'number' && tab >= 0 ? tab : store.activeTabId || -1
  }

  const fetchState = async (): Promise<void> => {
    try {
      const browserAction = getBrowserAction()
      if (!browserAction) return

      const newState = await browserAction.getState(partition())
      updateState(newState)
    } catch (error) {
      console.error(
        `browser-action-list failed to update [tab: ${props.tab}, partition: '${props.partition}']`,
        error
      )
    }
  }

  const updateState = (newState: ActionState): void => {
    setStore(reconcile(newState))
  }

  const handleUpdate = (newState: ActionState): void => {
    console.log('Actions updated:', newState)
    updateState(newState)
  }

  const startObserving = (): void => {
    if (observing()) return

    const browserAction = getBrowserAction()
    if (!browserAction) return

    browserAction.addEventListener('update', handleUpdate)
    browserAction.addObserver(partition())
    setObserving(true)
  }

  const stopObserving = (): void => {
    if (!observing()) return

    const browserAction = getBrowserAction()
    if (!browserAction) return

    browserAction.removeEventListener('update', handleUpdate)
    browserAction.removeObserver(partition())
    setObserving(false)
  }

  onMount(() => {
    startObserving()
    fetchState()
  })

  onCleanup(() => {
    stopObserving()
  })

  createEffect(() => {
    // Re-fetch state when tab or partition changes - track dependencies by reading them
    const tab = props.tab
    const partition = props.partition
    if (tab !== undefined || partition !== undefined) {
      if (observing()) {
        void fetchState()
      }
    }
  })

  return (
    <div class="flex gap-1">
      <For each={store.actions}>
        {(action) => (
          <BrowserAction
            id={action.id}
            tab={tabId()}
            partition={props.partition}
            alignment={props.alignment}
          />
        )}
      </For>
    </div>
  )
}

export default BrowserActionList
