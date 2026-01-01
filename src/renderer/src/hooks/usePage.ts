import { Accessor, createMemo } from 'solid-js'
import { store } from '../store'
import { Profile } from '../types'

interface PageInfo {
  pageCount: number
  currentPage: number
}

const usePage = (activeProfiles: Accessor<Profile[]>): Accessor<PageInfo> => {
  const page = createMemo(() => {
    const itemsPerPage = store.rows * store.columns
    return {
      pageCount: Math.ceil(activeProfiles().length / itemsPerPage),
      currentPage: Math.max(
        0,
        Math.min(store.page, Math.ceil(activeProfiles().length / itemsPerPage) - 1)
      )
    }
  })

  return page
}

export { usePage }
