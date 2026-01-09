import type { BaseWindow } from 'electron'
import { EventEmitter } from 'events'

type Bounds = {
  x: number
  y: number
  width: number
  height: number
}

class VirtualWindow extends EventEmitter {
  readonly id: number
  readonly baseWindow: BaseWindow

  private destroyed = false
  private focused = false
  private minimized = false
  private maximized = false
  private fullscreen = false

  private bounds: Bounds

  constructor(baseWindow: BaseWindow) {
    super()

    this.id = Math.floor(Math.random() * 1e9)
    this.baseWindow = baseWindow

    // initialize fake bounds from real window (one-time)
    const [x, y] = baseWindow.getPosition()
    const [width, height] = baseWindow.getSize()

    this.bounds = { x, y, width, height }

    return new Proxy(this, this.proxy())
  }

  /* ----------------- Fake lifecycle ----------------- */

  focus(): void {
    if (this.destroyed) return
    if (this.focused) return

    this.focused = true
    this.emit('focus')
  }

  blur(): void {
    if (this.destroyed) return
    if (!this.focused) return

    this.focused = false
    this.emit('blur')
  }

  close(): void {
    if (this.destroyed) return
    this.destroyed = true
    this.emit('close')
    this.emit('closed')
  }

  destroy(): void {
    this.close()
  }

  /* ----------------- Fake window state ----------------- */

  minimize(): void {
    if (this.destroyed || this.minimized) return
    this.minimized = true
    this.emit('minimize')
  }

  restore(): void {
    if (this.destroyed) return
    if (!this.minimized && !this.maximized) return

    this.minimized = false
    this.maximized = false
    this.emit('restore')
  }

  maximize(): void {
    if (this.destroyed || this.maximized) return
    this.maximized = true
    this.emit('maximize')
  }

  unmaximize(): void {
    if (this.destroyed || !this.maximized) return
    this.maximized = false
    this.emit('unmaximize')
  }

  setFullScreen(flag: boolean = true): void {
    if (this.destroyed) return
    if (this.fullscreen === flag) return

    this.fullscreen = flag
    this.minimized = false

    if (flag) {
      this.emit('enter-full-screen')
    } else {
      this.emit('leave-full-screen')
    }
  }

  /* ----------------- Fake bounds ----------------- */

  getBounds(): Bounds {
    return { ...this.bounds }
  }

  setBounds(bounds: Partial<Bounds>): void {
    if (this.destroyed) return

    this.bounds = { ...this.bounds, ...bounds }
    this.emit('resize')
    this.emit('move')
  }

  setSize(width: number, height: number): void {
    this.setBounds({ width, height })
  }

  setPosition(x: number, y: number): void {
    this.setBounds({ x, y })
  }

  getSize(): [number, number] {
    return [this.bounds.width, this.bounds.height]
  }

  getPosition(): [number, number] {
    return [this.bounds.x, this.bounds.y]
  }

  /* ----------------- State queries ----------------- */

  isDestroyed(): boolean {
    return this.destroyed
  }

  isFocused(): boolean {
    return this.focused
  }

  isMinimized(): boolean {
    return this.minimized
  }

  isMaximized(): boolean {
    return this.maximized
  }

  isVisible(): boolean {
    return !this.destroyed && !this.minimized
  }

  isFullScreen(): boolean {
    return this.fullscreen
  }

  /* ----------------- No-op compatibility ----------------- */

  show(): void {
    return
  }
  hide(): void {
    return
  }
  showInactive(): void {
    return
  }
  moveTop(): void {
    return
  }
  setAlwaysOnTop(): void {
    return
  }

  setOpacity(): void {
    return
  }
  setResizable(): void {
    return
  }
  setClosable(): void {
    return
  }
  setMinimizable(): void {
    return
  }
  setMaximizable(): void {
    return
  }

  /* ----------------- Proxy delegation ----------------- */

  private proxy(): ProxyHandler<this> {
    return {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver)
        }

        const value = target.baseWindow[prop]

        if (typeof value === 'function') {
          return value.bind(target.baseWindow)
        }

        return value
      }
    }
  }
}

export { VirtualWindow }
