import type { Component } from 'solid-js'
import { SideMenu } from './components/SideMenu'
import { PageControl } from './components/PageControl'
import { EmptyView } from './components/EmptyView'
import { ViewContainer } from './components/ViewContainer'

const App: Component = () => {
  const page = 0
  const columns = 4
  const rows = 1
  const itemsPerPage = columns * rows
  const pageCount = Math.ceil(1 / itemsPerPage)
  const currentPage = Math.max(0, Math.min(page, pageCount - 1))

  return (
    <>
      {/* Application */}
      <div class="flex h-screen w-screen divide-x dark:divide-neutral-700">
        {/* Side Menu */}
        <SideMenu />

        {/* Main Area */}
        <ViewContainer currentPage={currentPage} rows={rows} columns={columns}>
          <EmptyView />
        </ViewContainer>

        {/* Page Control */}
        <PageControl
          currentPage={currentPage}
          pageCount={pageCount}
          closePage={() => null}
          setPage={() => null}
        />
      </div>
    </>
  )
}

export default App
