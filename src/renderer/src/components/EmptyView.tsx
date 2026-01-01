import { Component } from 'solid-js'
import { cn } from '../lib/utils'
import Icon from '../assets/images/icon.svg'

const EmptyView: Component = () => (
  <div
    class={cn(
      'flex flex-col justify-center items-center gap-4',
      'col-span-full row-span-full',
      'bg-blue-500 text-white'
    )}
  >
    <img src={Icon} class="size-72 rounded-full" />
    <h1 class="text-6xl font-boldonse">Packs</h1>
    <p class="font-boldonse">by Surefoot HQ</p>
  </div>
)

export { EmptyView }
