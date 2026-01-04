import { cn } from '../lib/utils'
import { Component, ComponentProps } from 'solid-js'

const Input: Component<ComponentProps<'input'>> = (props) => (
  <input
    {...props}
    class={cn(
      'bg-transparent w-full',
      'p-2.5 font-bold grow min-h-0 min-w-0',
      'focus:outline-hidden focus:border-blue-300',
      'border border-slate-700',
      'disabled:opacity-50',
      props.class
    )}
  />
)

export { Input }
