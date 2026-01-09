import { Component, For } from 'solid-js'
import { HiOutlineXMark } from 'solid-icons/hi'

import { cn } from '../lib/utils'

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
              'bg-neutral-800 cursor-pointer',
              props.currentPage === pageIndex()
                ? ['text-blue-400 border-blue-400', 'font-bold']
                : ''
            )}
            onClick={() => props.setPage(pageIndex())}
          >
            {pageIndex() + 1}
          </button>

          {/* Close Page */}
          <button
            class={cn(
              'cursor-pointer p-2 bg-neutral-800 rounded-xl border border-transparent',
              'hover:text-blue-400'
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
