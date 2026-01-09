import EventEmitter from 'node:events'

class VirtualWindow extends EventEmitter {
  id: number
  baseWindow: Electron.BaseWindow
  destroyed: boolean = false

  constructor(baseWindow: Electron.BaseWindow) {
    super()
    this.id = Math.floor(Date.now() / 1000)
    this.baseWindow = baseWindow

    return new Proxy(this, {
      get(target, prop, receiver) {
        // Always prefer VirtualWindow's own properties
        if (prop in target) {
          return Reflect.get(target, prop, receiver)
        }

        // Otherwise delegate to baseWindow
        const value = target.baseWindow[prop]

        // Bind functions to baseWindow so `this` works correctly
        if (typeof value === 'function') {
          return value.bind(target.baseWindow)
        }

        return value
      },

      set(target, prop, value) {
        if (prop in target) {
          ;(target as object)[prop] = value
          return true
        }

        target.baseWindow[prop] = value
        return true
      }
    })
  }

  focus(): void {
    this.emit('focus')
  }

  destroy(): void {
    this.destroyed = true
    this.emit('closed')
  }

  maximize(): void {
    // TODO
  }

  minimize(): void {
    // TODO
  }

  isMinimized(): boolean {
    return false
  }

  isMaximized(): boolean {
    return true
  }

  isDestroyed(): boolean {
    return this.destroyed || this.baseWindow.isDestroyed()
  }
}

export { VirtualWindow }
