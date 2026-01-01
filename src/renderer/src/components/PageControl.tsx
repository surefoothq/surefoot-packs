import { HiOutlineXMark } from 'solid-icons/hi'
import { cn } from '../lib/utils'
import { Component, For } from 'solid-js'

interface PageControlProps {
  pageCount: number
  currentPage: number
  setPage: (pageIndex: number) => void
  closePage: (pageIndex: number) => void
}

const PageControl: Component<PageControlProps> = (props) => (
  <div class={cn('shrink-0 p-2 flex flex-col gap-2', 'overflow-auto empty:hidden')}>
    <For each={Array.from({ length: props.pageCount })}>
      {(_, pageIndex) => (
        <div class="flex gap-1">
          {/* Switch Page */}
          <button
            class={cn(
              'p-1 w-14 rounded-xl border border-transparent',
              props.currentPage === pageIndex()
                ? [
                    'border-blue-500 bg-blue-100 text-blue-500',
                    'dark:bg-neutral-700 dark:text-blue-500',
                    'font-bold'
                  ]
                : 'bg-neutral-100 dark:bg-neutral-700'
            )}
            onClick={() => props.setPage(pageIndex())}
          >
            {pageIndex() + 1}
          </button>

          {/* Close Page */}
          <button
            class={cn(
              'p-2 rounded-xl border border-transparent',
              'bg-neutral-100 dark:bg-neutral-700',
              'hover:bg-blue-100 hover:text-blue-500',
              'dark:hover:bg-neutral-600'
            )}
            onClick={() => props.closePage(pageIndex())}
          >
            <HiOutlineXMark class="size-4" />
          </button>
        </div>
      )}
    </For>
  </div>
)

export { PageControl }
