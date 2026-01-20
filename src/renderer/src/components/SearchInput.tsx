import { cn } from '@renderer/lib/utils'

const SearchInput = (props: React.ComponentProps<'input'>): React.JSX.Element => (
  <input
    {...props}
    type="search"
    className={cn('p-4 bg-neutral-800 rounded-full', 'w-full max-w-md mx-auto', props.className)}
  />
)

export { SearchInput }
