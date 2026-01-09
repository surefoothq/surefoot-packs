import { Profile } from './Profile'

class BrowserActionPopup {
  profile: Profile
  extensionId: string
  url: string
  destroyed: boolean = false
  extension: Electron.Extension

  constructor(profile: Profile, extensionId: string, url: string) {
    this.profile = profile
    this.extensionId = extensionId
    this.url = url
    this.extension = this.profile.session.extensions
      .getAllExtensions()
      .find((ext) => ext.id === this.extensionId)!
  }

  open(): void {
    this.profile.sendMessageToHost('open-action-popup', {
      extension: this.extension,
      url: this.url
    })
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.profile.sendMessageToHost('close-action-popup')
  }

  isDestroyed(): boolean {
    return this.destroyed
  }
}

export { BrowserActionPopup }
