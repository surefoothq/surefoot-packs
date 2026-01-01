import { AppStore, Profile } from '../types'
import { createStore } from 'solid-js/store'
import { makePersisted } from '@solid-primitives/storage'

/* Initial Store */
const [initialStore, initialSetStore] = createStore<AppStore>({
  profiles: [],
  page: 0,
  rows: 1,
  columns: 4
})

/* Persisted Store */
const [store, setStore] = makePersisted([initialStore, initialSetStore], {
  name: 'app-store'
})

/* Add Profile */
const addProfile = (profile: Profile): void => {
  setStore('profiles', (profiles) => [...profiles, profile])
}

/* Set Page */
const setPage = (pageIndex: number): void => {
  setStore('page', pageIndex)
}

/* Close Page */
const closePage = (pageIndex: number): void => {
  // Do something to close the page
  console.log('Close page:', pageIndex)
}

export { store, setStore, addProfile, setPage, closePage }
