import { BrowserProfile } from 'src/types'
import { chromeColorToHex, cn } from '@renderer/lib/utils'

interface ProfileAvatarProps extends React.ComponentProps<'div'> {
  profile: BrowserProfile
}

const ProfileAvatar = ({ profile, ...props }: ProfileAvatarProps): React.JSX.Element => {
  const bg = chromeColorToHex(profile.default_avatar_fill_color)
  const letter = (profile['gaia_name'] || profile.name)?.[0]?.toUpperCase() || '?'

  return (
    <div
      {...props}
      style={{
        background: bg
      }}
      className={cn(
        'flex items-center justify-center',
        'text-white text-lg font-boldonse',
        props.className
      )}
    >
      {letter}
    </div>
  )
}

export { ProfileAvatar }
