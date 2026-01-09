import { Component, ComponentProps } from 'solid-js'

import { cn } from '../lib/utils'

const WebviewButton: Component<ComponentProps<'button'>> = (props) => (
  <button
    {...props}
    class={cn(
      'bg-neutral-900',
      'hover:text-blue-400',
      'flex items-center justify-center',
      'p-2 rounded-full shrink-0',
      'disabled:opacity-50',
      'cursor-pointer',
      props.class
    )}
  />
)

export { WebviewButton }
