import { app, session } from 'electron'
import App from './App'

class Profile {
  id: string
  ctx: App
  session: Electron.Session
  contextMenuMap = new Map<Electron.WebContents, () => void>()

  /* Constructor */
  constructor({ id, ctx }: { id: string; ctx: App }) {
    this.id = id
    this.ctx = ctx
    this.session = session.fromPartition(`persist:profile-${this.id}`)

    /* Bind Methods */
    this.configureWebContents = this.configureWebContents.bind(this)

    /* Initialize Profile */
    this.initialize()
  }

  /** Configure WebContents */
  configureWebContents(_event: Electron.Event, contents: Electron.WebContents): void {
    if (contents.session === this.session) {
      /* Setup Context Menu */
      this.contextMenuMap.set(
        contents,
        this.ctx.createContextMenu({
          window: contents
        })
      )

      /* Override window handler */
      contents.setWindowOpenHandler((details) => {
        if (['default', 'foreground-tab', 'background-tab'].includes(details.disposition)) {
          if (contents.hostWebContents) {
            contents.hostWebContents.send('browser-message', {
              id: this.id,
              action: 'open-window',
              data: details
            })
          } else {
            console.warn('No hostWebContents to send browser-message')
          }
          return { action: 'deny' }
        } else {
          return {
            action: 'allow',
            overrideBrowserWindowOptions: {
              autoHideMenuBar: true
            }
          }
        }
      })
    }
  }

  /** Initialize Profile */
  initialize(): void {
    console.log(`Initializing profile: ${this.id}`)
    app.on('web-contents-created', this.configureWebContents)
  }

  /** Destroy Profile */
  destroy(): void {
    console.log(`Destroying profile: ${this.id}`)
    app.off('web-contents-created', this.configureWebContents)
    this.contextMenuMap.forEach((dispose) => dispose())
    this.contextMenuMap.clear()
  }
}

export { Profile }
