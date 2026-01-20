import { BrowserKey } from 'src/types'
import { useAppContext } from '@renderer/hooks/useAppContext'

import Icon from '../assets/images/icon.svg'
import { browsers } from '../lib/browsers'
import { cn } from '../lib/utils'

const Welcome = (): React.JSX.Element => {
  const app = useAppContext()
  return (
    <div className="flex flex-col gap-6 items-center justify-center h-dvh overflow-auto">
      {/* App Icon */}
      <img src={Icon} className="rounded-full size-40" />

      {/* App Title */}
      <div className="flex flex-col font-boldonse gap-4 text-center">
        <h1 className="text-4xl text-blue-200">Packs</h1>
        <h2>
          <a href="https://sfoothq.com" target="_blank" rel="noreferrer">
            by SurefootHQ
          </a>
        </h2>
      </div>

      {/* Browsers list */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(browsers).map(([id, browser]) => (
          <button
            onClick={() => app.setBrowserKey(id as BrowserKey)}
            key={id}
            className={cn(
              'p-6 flex flex-col items-center justify-center',
              'text-center gap-4 rounded-3xl cursor-pointer',
              'bg-neutral-800 hover:bg-neutral-700'
            )}
          >
            <img src={browser.icon} className="size-16" />
            <span className="font-bold">{browser.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export { Welcome }
