import { AsyncStorage } from '@solid-primitives/storage'
import { Conf } from 'electron-conf/renderer'
const conf = new Conf()

// Custom storage object
export const storage: AsyncStorage = {
  getItem: async (name) => {
    return conf.get(name) as Promise<string | null>
  },
  setItem: async (name, value) => {
    return conf.set(name, value)
  },
  removeItem: async (name) => {
    return conf.delete(name)
  }
}
