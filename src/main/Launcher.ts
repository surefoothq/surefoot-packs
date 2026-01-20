import { execFile } from 'child_process'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

import { Browser, BrowserKey, BrowserProfile, ProfileExtension } from '../types'

const platform = process.platform

const browsers: Record<BrowserKey, Browser> = {
  'google-chrome': {
    name: 'Google Chrome',
    userDataDir: {
      win32: join(homedir(), 'AppData/Local/Google/Chrome/User Data'),
      darwin: join(homedir(), 'Library/Application Support/Google/Chrome'),
      linux: join(homedir(), '.config/google-chrome')
    },
    exec: {
      win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      linux: 'google-chrome-stable'
    }
  },
  chromium: {
    name: 'Chromium',
    userDataDir: {
      win32: join(homedir(), 'AppData/Local/Chromium/User Data'),
      darwin: join(homedir(), 'Library/Application Support/Chromium'),
      linux: join(homedir(), '.config/chromium')
    },
    exec: {
      win32: 'C:\\Program Files\\Chromium\\Application\\chromium.exe',
      darwin: '/Applications/Chromium.app/Contents/MacOS/Chromium',
      linux: 'chromium'
    }
  },
  brave: {
    name: 'Brave',
    userDataDir: {
      win32: join(homedir(), 'AppData/Local/BraveSoftware/Brave-Browser/User Data'),
      darwin: join(homedir(), 'Library/Application Support/BraveSoftware/Brave-Browser'),
      linux: join(homedir(), '.config/BraveSoftware/Brave-Browser')
    },
    exec: {
      win32: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      darwin: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
      linux: 'brave-browser'
    }
  },
  edge: {
    name: 'Microsoft Edge',
    userDataDir: {
      win32: join(homedir(), 'AppData/Local/Microsoft/Edge/User Data'),
      darwin: join(homedir(), 'Library/Application Support/Microsoft Edge'),
      linux: join(homedir(), '.config/microsoft-edge')
    },
    exec: {
      win32: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      darwin: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      linux: 'microsoft-edge'
    }
  }
}

class Launcher {
  getBrowsers(): Record<BrowserKey, Browser> {
    return browsers
  }

  getUserDataDir(browserKey: BrowserKey): string | null {
    return browsers[browserKey]?.userDataDir[platform] || null
  }

  getBrowserExec(browserKey: BrowserKey): string | null {
    return browsers[browserKey]?.exec[platform] || null
  }

  getProfiles(browserKey): BrowserProfile[] {
    const userDataDir = this.getUserDataDir(browserKey)
    if (!userDataDir) return []

    const localStatePath = join(userDataDir, 'Local State')
    if (!existsSync(localStatePath)) return []

    try {
      const state = JSON.parse(readFileSync(localStatePath, 'utf8'))
      const infoCache: Record<string, BrowserProfile> = state.profile?.info_cache || {}
      return Object.entries(infoCache).map(([directory, profile]) => ({
        ...profile,
        picture: profile['gaia_picture_file_name']
          ? join(userDataDir, directory, profile['gaia_picture_file_name'])
          : '',
        browserKey,
        directory,
        path: join(userDataDir, directory)
      }))
    } catch {
      return []
    }
  }

  launchProfile(browserKey: BrowserKey, profileDir: string): void {
    const execPath = this.getBrowserExec(browserKey)
    const userDataDir = this.getUserDataDir(browserKey)
    if (!execPath || !userDataDir) return

    execFile(execPath, [`--user-data-dir=${userDataDir}`, `--profile-directory=${profileDir}`], {
      cwd: userDataDir
    })
  }

  resolveLocalizedString(raw: string, extensionDir: string): string {
    if (!raw?.startsWith('__MSG_')) return raw

    const key = raw.replace('__MSG_', '').replace('__', '')
    const localePath = join(extensionDir, '_locales', 'en', 'messages.json')

    if (!existsSync(localePath)) return raw

    try {
      const messages = JSON.parse(readFileSync(localePath, 'utf8'))
      return messages[key]?.message || raw
    } catch {
      return raw
    }
  }

  pickBestIcon(icons: Record<string, string> | undefined): string | null {
    if (!icons) return null

    const sizes = Object.keys(icons)
      .map(Number)
      .sort((a, b) => b - a)

    return icons[sizes[0]]
  }

  getProfileExtensions(profilePath: string): ProfileExtension[] {
    const prefPath = join(profilePath, 'Preferences')
    const extensionsDir = join(profilePath, 'Extensions')

    if (!existsSync(prefPath) || !existsSync(extensionsDir)) return []

    let extensionStates: Record<
      string,
      {
        state: number
      }
    > = {}

    try {
      const prefs = JSON.parse(readFileSync(prefPath, 'utf8'))
      extensionStates = prefs.extensions?.settings || {}
    } catch {
      return []
    }

    const result: ProfileExtension[] = []

    for (const extensionId of Object.keys(extensionStates)) {
      const extRoot = join(extensionsDir, extensionId)
      if (!existsSync(extRoot)) continue

      // pick latest version folder
      const versions = readdirSync(extRoot).filter((v) =>
        existsSync(join(extRoot, v, 'manifest.json'))
      )
      if (!versions.length) continue

      versions.sort((a, b) => b.localeCompare(a))
      const versionDir = join(extRoot, versions[0])

      try {
        const manifestPath = join(versionDir, 'manifest.json')
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

        const name = this.resolveLocalizedString(manifest.name, versionDir)

        const iconPath = this.pickBestIcon(manifest.icons)
        const icon = iconPath ? join(versionDir, iconPath) : null

        const state = extensionStates[extensionId]

        result.push({
          id: extensionId,
          name,
          description: this.resolveLocalizedString(manifest.description, versionDir),
          version: manifest.version,
          enabled: state.state === 1,
          icon,
          path: versionDir
        })
      } catch {
        continue
      }
    }

    return result
  }
}

export { Launcher, browsers, platform }
