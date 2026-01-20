import { createContext } from 'react'
import { useApp } from '@renderer/hooks/useApp'

const AppContext = createContext<ReturnType<typeof useApp> | null>(null)

export { AppContext }
