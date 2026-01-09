import { Component, ComponentProps } from 'solid-js'

import { cn } from '../lib/utils'

const Input: Component<ComponentProps<'input'>> = (props) => (
  <input
    {...props}
    class={cn(
      'bg-transparent w-full rounded-xl',
      'p-2.5 font-bold grow min-h-0 min-w-0',
      'focus:outline-hidden focus:border-blue-300',
      'border border-neutral-800',
      'disabled:opacity-50',
      props.class
    )}
  />
)

export { Input }
