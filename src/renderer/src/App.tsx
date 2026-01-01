import { For, Show, type Component } from 'solid-js'
import { SideMenu } from './components/SideMenu'
import { PageControl } from './components/PageControl'
import { EmptyView } from './components/EmptyView'
import { ViewContainer } from './components/ViewContainer'
import { Profile } from './components/Profile'
import { store, closePage, setPage } from './store'
import { useActiveProfiles } from './hooks/useActiveProfiles'
import { usePage } from './hooks/usePage'

const App: Component = () => {
  /* Active Profiles */
  const activeProfiles = useActiveProfiles()

  /* Pagination Logic */
  const page = usePage(activeProfiles)

  return (
    <>
      {/* Application */}
      <div class="flex h-screen w-screen divide-x dark:divide-neutral-700">
        {/* Side Menu */}
        <SideMenu />

        {/* Main Area */}
        <ViewContainer currentPage={page().currentPage} rows={store.rows} columns={store.columns}>
          <Show
            when={activeProfiles().length > 0}
            fallback={<EmptyView class="col-span-full row-span-full" />}
          >
            <For each={activeProfiles()}>{(profile) => <Profile profile={profile} />}</For>
          </Show>
        </ViewContainer>

        {/* Page Control */}
        <PageControl
          currentPage={page().currentPage}
          pageCount={page().pageCount}
          closePage={closePage}
          setPage={setPage}
        />
      </div>
    </>
  )
}

export default App
