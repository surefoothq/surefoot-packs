class VirtualWindow {
  id: number
  baseWindow: Electron.BaseWindow
  destroyed: boolean = false

  constructor(baseWindow: Electron.BaseWindow) {
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

  destroy(): void {
    this.destroyed = true
  }

  isDestroyed(): boolean {
    return this.destroyed || this.baseWindow.isDestroyed()
  }
}

export { VirtualWindow }
