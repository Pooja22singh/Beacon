import { BeaconDot } from './components/BeaconDot'
import { Button } from './components/Button'
import { ChatView } from './components/ChatView'
import { SignIn } from './components/SignIn'
import { useAuth } from './hooks/useAuth'

const App = () => {
  const { status, user, signIn, signOut, markSignedOut, retry } = useAuth()

  if (status === 'loading') {
    return (
      <main className="grid min-h-dvh place-items-center bg-background">
        <BeaconDot active />
        <span className="sr-only" role="status">
          Loading
        </span>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="grid min-h-dvh place-items-center bg-background p-4">
        <div className="max-w-xs text-center">
          <h1 className="text-lg font-semibold">Can't reach support right now</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Check your connection and try again.
          </p>
          <Button className="mt-4" onClick={retry}>
            Try again
          </Button>
        </div>
      </main>
    )
  }

  if (status === 'signedOut' || !user) return <SignIn onSignedIn={signIn} />

  return <ChatView user={user} onSignOut={signOut} onUnauthorized={markSignedOut} />
}

export default App