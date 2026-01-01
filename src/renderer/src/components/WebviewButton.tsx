import { Component, ComponentProps } from 'solid-js'
import { cn } from '../lib/utils'

const WebviewButton: Component<ComponentProps<'button'>> = (props) => (
  <button
    {...props}
    class={cn(
      'bg-neutral-100 dark:bg-neutral-700',
      'hover:bg-blue-100 hover:text-blue-500',
      'dark:hover:bg-blue-200',
      'flex items-center justify-center',
      'p-2 rounded-full shrink-0',
      'disabled:opacity-50',
      'cursor-pointer',
      props.class
    )}
  />
)

export { WebviewButton }
