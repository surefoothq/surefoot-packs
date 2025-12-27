import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [solid(), tailwindcss(), imagetools()]
  }
})
