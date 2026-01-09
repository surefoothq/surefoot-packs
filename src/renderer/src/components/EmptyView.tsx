import { Component, ComponentProps } from 'solid-js'

import Icon from '../assets/images/icon.svg'
import { cn } from '../lib/utils'

const EmptyView: Component<ComponentProps<'div'>> = (props) => (
  <div
    class={cn(
      'flex flex-col justify-center items-center gap-6',
      'bg-neutral-950 text-white',
      props.class
    )}
  >
    <img src={Icon} class="size-60 rounded-full" />
    <h1 class="text-5xl font-boldonse">Packs</h1>
    <p class="font-boldonse">by Surefoot HQ</p>
    {props.children}
  </div>
)

export { EmptyView }
