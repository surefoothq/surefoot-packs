import { useBrowserProfileContext } from '@renderer/hooks/useBrowserProfileContext'
import { cn } from '@renderer/lib/utils'
import { Component, JSX } from 'solid-js'
interface ProfileViewContainerProps {
  children: JSX.Element
}

const ProfileViewContainer: Component<ProfileViewContainerProps> = (props) => {
  const context = useBrowserProfileContext()

  return (
    <div class="grow flex flex-col overflow-hidden">
      <div
        class={cn(
          '-translate-x-(--translate) translate-3d',
          'grow grid w-[200%] gap-0  grid-cols-2',
          'transition-transform duration-500'
        )}
        style={{
          '--translate': context.store.showAside ? '50%' : '0%'
        }}
      >
        {props.children}
      </div>
    </div>
  )
}
export { ProfileViewContainer }
