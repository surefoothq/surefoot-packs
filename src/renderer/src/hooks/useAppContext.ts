import { AppContext } from '@renderer/contexts/AppContext'
import { useContext } from 'react'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useAppContext = () => useContext(AppContext)!

export { useAppContext }
