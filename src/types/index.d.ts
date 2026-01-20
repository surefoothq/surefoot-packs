export interface Browser {
  name: string
  userDataDir: {
    win32: string
    darwin: string
    linux: string
  }
  exec: {
    win32: string
    darwin: string
    linux: string
  }
}

export type BrowserKey = 'google-chrome' | 'chromium' | 'brave' | 'edge'

export interface BrowserProfile {
  active_time: number
  avatar_icon: string
  background_apps: boolean
  default_avatar_fill_color: number
  default_avatar_stroke_color: number
  enterprise_label: string
  first_account_name_hash: number
  force_signin_profile_locked: boolean
  gaia_given_name: string
  gaia_id: string
  gaia_name: string
  gaia_picture_file_name: string
  hosted_domain: string
  is_consented_primary_account: boolean
  is_ephemeral: boolean
  is_managed: number
  is_using_default_avatar: boolean
  is_using_default_name: boolean
  last_downloaded_gaia_picture_url_with_size: string
  managed_user_id: string
  metrics_bucket_index: number
  name: string
  profile_color_seed: number
  profile_highlight_color: number
  'signin.with_credential_provider': boolean
  user_accepted_account_management: boolean
  user_name: string
  browserKey: string
  directory: string
  path: string
  picture: string
}

export type BrowserList = Record<BrowserKey, Browser>

export interface ProfileExtension {
  id: string
  name: string
  description: string
  version: string
  enabled: boolean
  icon: string | null
  path: string
}
