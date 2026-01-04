import { cn } from '../lib/utils'
import { Component, JSX } from 'solid-js'

interface ViewContainerProps {
  currentPage: number
  rows: number
  columns: number
  children: JSX.Element
}

const ViewContainer: Component<ViewContainerProps> = (props) => (
  <div class="grow overflow-clip">
    <div
      class={cn(
        'h-full grid grid-cols-(--grid-cols) auto-rows-(--auto-rows)',
        '-translate-y-(--current-page)',
        'transition-transform duration-500',
        'divide-x dark:divide-slate-700'
      )}
      style={{
        '--current-page': `${props.currentPage * 100}%`,
        '--grid-cols': `repeat(${props.columns}, minmax(0, 1fr))`,
        '--auto-rows': `${100 / props.rows}%`
      }}
    >
      {props.children}
    </div>
  </div>
)

export { ViewContainer }
