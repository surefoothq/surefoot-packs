import type { Component } from 'solid-js'
import { SideMenu } from './components/SideMenu'

const App: Component = () => {
  return (
    <>
      {/* Application */}
      <div class="flex h-screen w-screen divide-x dark:divide-neutral-700">
        <SideMenu />
      </div>
    </>
  )
}

export default App
