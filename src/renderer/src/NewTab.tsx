import normalizeUrl from 'normalize-url'
import { Component, onMount } from 'solid-js'
import Icon from './assets/images/icon.svg'
import { checkUrl, cn } from './lib/utils'

/** New Tab Component */
const NewTab: Component = () => {
  const handleSubmit = (e: Event): void => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const query = formData.get('search')?.toString().trim()
    const url = normalizeUrl(query || '')
    const finalUrl = checkUrl(url)
      ? url
      : `https://www.google.com/search?q=${encodeURIComponent(query || '')}`

    location.href = finalUrl
  }

  onMount(() => {
    // TEST extension
    // window.phantom.solana.disconnect()
    // window.phantom.solana.connect()
  })

  return (
    <div class={cn('min-h-dvh flex flex-col justify-center items-center gap-4 p-4')}>
      <img src={Icon} class="size-48 rounded-full" />

      <form onSubmit={handleSubmit} class="w-full max-w-lg flex flex-col">
        <input
          name="search"
          class="bg-neutral-900 rounded-full p-4"
          placeholder="Search Google or type a URL"
        />
      </form>
    </div>
  )
}

export default NewTab
