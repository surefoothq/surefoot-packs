import { AppContext } from './contexts/AppContext'
import { BrowserProfiles } from './components/BrowserProfiles'
import { ProfileDetails } from './components/ProfileDetails'
import { Welcome } from './components/Welcome'
import { useApp } from './hooks/useApp'

const App = (): React.JSX.Element => {
  const app = useApp()

  return (
    <AppContext.Provider value={app}>
      {app.profile ? <ProfileDetails /> : app.browserKey ? <BrowserProfiles /> : <Welcome />}
    </AppContext.Provider>
  )
}

export default App
