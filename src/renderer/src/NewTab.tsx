import isUrl from 'is-url'
import normalizeUrl from 'normalize-url'
import { Component } from 'solid-js'

import Icon from './assets/images/icon.svg'
import { cn } from './lib/utils'

/** New Tab Component */
const NewTab: Component = () => {
  const handleSubmit = (e: Event): void => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const query = formData.get('search')?.toString().trim()
    const url = normalizeUrl(query || '')
    const finalUrl = isUrl(url)
      ? url
      : `https://www.google.com/search?q=${encodeURIComponent(query || '')}`

    location.href = finalUrl
  }

  return (
    <div class={cn('min-h-dvh flex flex-col justify-center items-center gap-4 p-4')}>
      <img src={Icon} class="size-48 rounded-full" />

      <div class="flex flex-col justify-center items-center text-center gap-2">
        <h1 class="text-3xl font-boldonse">Packs</h1>
        <p class="font-boldonse">by Surefoot HQ</p>
      </div>

      <form onSubmit={handleSubmit} class="w-full max-w-lg flex flex-col">
        <input
          name="search"
          class="bg-white text-black rounded-lg p-4"
          placeholder="Search Google or type a URL"
        />
      </form>
    </div>
  )
}

export default NewTab
